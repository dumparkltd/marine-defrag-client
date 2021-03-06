import { createSelector } from 'reselect';
import { Map } from 'immutable';

import {
  selectEntities,
  selectEntitiesWhereQuery,
  selectWithoutQuery,
  selectConnectionQuery,
  selectCategoryQuery,
  selectCategories,
} from 'containers/App/selectors';
import { USER_ROLES, API } from 'themes/config';

import {
  filterEntitiesByConnection,
  filterEntitiesByCategories,
  filterEntitiesWithoutAssociation,
} from 'utils/entities';
import { qe } from 'utils/quasi-equals';

const selectUsersNested = createSelector(
  (state) => selectEntitiesWhereQuery(state, { path: API.USERS }),
  (state) => selectEntities(state, API.USER_CATEGORIES),
  (state) => selectEntities(state, API.USER_ROLES),
  (entities, entityCategories, entityRoles) => entities.map(
    (entity) => {
      const entityRoleIds = entityRoles.filter(
        (association) => qe(
          association.getIn(['attributes', 'user_id']),
          entity.get('id')
        )
      ).map(
        (association) => association.getIn(['attributes', 'role_id'])
      );
      const entityHighestRoleId = entityRoleIds.reduce(
        (memo, roleId) => roleId < memo ? roleId : memo,
        USER_ROLES.DEFAULT.value,
      );
      return entity.set(
        'categories',
        entityCategories && entityCategories.filter(
          (association) => qe(
            association.getIn(['attributes', 'user_id']),
            entity.get('id')
          )
        ).map(
          (association) => association.getIn(['attributes', 'category_id'])
        )
      ).set(
        'roles',
        entityHighestRoleId !== USER_ROLES.DEFAULT.value
          ? Map({ 0: entityHighestRoleId })
          : Map()
      );
    }
  )
);
const selectUsersWithout = createSelector(
  selectUsersNested,
  selectCategories,
  selectWithoutQuery,
  (entities, categories, query) => query
    ? filterEntitiesWithoutAssociation(entities, categories, query)
    : entities
);
const selectUsersByConnections = createSelector(
  selectUsersWithout,
  selectConnectionQuery,
  (entities, query) => query
    ? filterEntitiesByConnection(entities, query)
    : entities
);
const selectUsersByCategories = createSelector(
  selectUsersByConnections,
  selectCategoryQuery,
  (entities, query) => query
    ? filterEntitiesByCategories(entities, query)
    : entities
);

// kicks off series of cascading selectors
// 1. selectEntitiesWhere filters by attribute
// 2. selectEntitiesSearchQuery filters by keyword
// 4. selectUsersWithout will filter by absence of taxonomy or connection
// 5. selectUsersByConnections will filter by specific connection
// 6. selectUsersByCategories will filter by specific categories
export const selectUsers = createSelector(
  selectUsersByCategories,
  (entities) => entities && entities.toList()
);
