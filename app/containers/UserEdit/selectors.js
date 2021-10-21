import { createSelector } from 'reselect';
import { DB } from 'themes/config';

import {
  selectEntity,
  selectEntities,
  selectTaxonomiesSorted,
  selectUserCategoriesByUser,
} from 'containers/App/selectors';

import {
  entitySetUser,
  prepareTaxonomiesAssociated,
} from 'utils/entities';
import { qe } from 'utils/quasi-equals';

export const selectDomain = createSelector(
  (state) => state.get('userEdit'),
  (substate) => substate
);

export const selectViewEntity = createSelector(
  (state, id) => selectEntity(state, { path: DB.USERS, id }),
  (state) => selectEntities(state, DB.USERS),
  (state) => selectEntities(state, DB.USER_ROLES),
  (state) => selectEntities(state, DB.ROLES),
  (entity, users, userRoles, roles) => entity && users && userRoles && roles && entitySetUser(entity, users).set(
    'roles',
    userRoles.filter(
      (association) => qe(
        association.getIn(['attributes', 'user_id']),
        entity.get('id'),
      )
    ).map(
      (association) => roles.find(
        (role) => qe(
          role.get('id'),
          association.getIn(['attributes', 'role_id']),
        )
      )
    )
  )
);

export const selectTaxonomies = createSelector(
  (state, id) => id,
  selectTaxonomiesSorted,
  (state) => selectEntities(state, DB.CATEGORIES),
  selectUserCategoriesByUser,
  (id, taxonomies, categories, associations) => prepareTaxonomiesAssociated(
    taxonomies,
    categories,
    associations,
    'tags_users',
    id,
  )
);

export const selectRoles = createSelector(
  (state, id) => id,
  (state) => selectEntities(state, DB.ROLES),
  (state) => selectEntities(state, DB.USER_ROLES),
  (id, roles, userRoles) => roles && roles.map(
    (role) => {
      const filteredAssociations = userRoles.filter(
        (association) => qe(
          association.getIn(['attributes', 'user_id']),
          id,
        )
      );
      const entityAssociation = filteredAssociations.find(
        (association) => qe(
          association.getIn(['attributes', 'role_id']),
          role.get('id'),
        )
      );
      return role.set('associated', !!entityAssociation || false);
    }
  )
);
