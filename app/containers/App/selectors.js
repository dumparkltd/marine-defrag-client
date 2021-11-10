/**
 * The global state selectors
 *
 * use the makeSelector () => createSelector pattern when you want a selector that
 * doesn't take arguments, but can have its own cache between components
 *
 * otherwise use straight createSelector
 * https://github.com/react-boilerplate/react-boilerplate/pull/1205#issuecomment-274319934
 *
 */
import { createSelector } from 'reselect';
import { reduce } from 'lodash/collection';
import { Map, List } from 'immutable';

import asArray from 'utils/as-array';
import asList from 'utils/as-list';
import { sortEntities } from 'utils/sort';

import { USER_ROLES, API, ROUTES } from 'themes/config';

import {
  filterEntitiesByAttributes,
  filterEntitiesByKeywords,
  entitiesSetCategoryIds,
  prepareTaxonomies,
  prepareTaxonomiesTags,
} from 'utils/entities';
import { qe } from 'utils/quasi-equals';
import { PARAMS } from './constants';

// high level state selects
const getRoute = (state) => state.get('route');
const getGlobal = (state) => state.get('global');

// data loading ///////////////////////////////////////////////////////////////

const getGlobalRequested = (state) => state.getIn(['global', 'requested']);

export const selectRequestedAt = createSelector(
  getGlobalRequested,
  (state, { path }) => path,
  (requested, path) => requested.get(path)
);

export const selectReady = (state, { path }) => reduce(asArray(path),
  (areReady, readyPath) => areReady && (
    !!state.getIn(['global', 'ready', readyPath])
      || Object.values(API).indexOf(readyPath) === -1
  ),
  true);


// ui states ///////////////////////////////////////////////////////////////////

export const selectNewEntityModal = createSelector(
  getGlobal,
  (globalState) => globalState.get('newEntityModal')
);

// users and user authentication ///////////////////////////////////////////////

export const selectIsAuthenticating = createSelector(
  getGlobal,
  (globalState) => globalState.getIn(['auth', 'sending'])
);

const selectReadyUserRoles = (state) => !!state.getIn(['global', 'ready', 'user_roles']);

export const selectReadyForAuthCheck = createSelector(
  selectIsAuthenticating,
  selectReadyUserRoles,
  (isAuthenticating, rolesReady) => !isAuthenticating && rolesReady
);

export const selectSessionUser = createSelector(
  getGlobal,
  (state) => state.get('user')
);

export const selectIsSignedIn = createSelector(
  selectSessionUser,
  (sessionUser) => sessionUser && sessionUser.get('isSignedIn')
);

export const selectSessionUserAttributes = createSelector(
  selectSessionUser,
  (sessionUser) => sessionUser && sessionUser.get('attributes')
);

export const selectSessionUserId = createSelector(
  selectSessionUserAttributes,
  (sessionUserAttributes) => sessionUserAttributes && sessionUserAttributes.id.toString()
);

export const selectIsSigningIn = createSelector(
  selectIsSignedIn,
  selectSessionUserAttributes,
  (signedIn, user) => signedIn && !user
);

// const makeSessionUserRoles = () => selectSessionUserRoles;
export const selectSessionUserRoles = createSelector(
  (state) => state,
  selectIsSignedIn,
  selectSessionUserId,
  (state, isSignedIn, sessionUserId) => isSignedIn && sessionUserId
    ? selectEntitiesWhere(state, {
      path: API.USER_ROLES,
      where: { user_id: sessionUserId },
    })
      .map((role) => role.getIn(['attributes', 'role_id']))
      .toList()
    : Map()
);

export const selectIsUserAdmin = createSelector(
  selectSessionUserRoles,
  (userRoles) => userRoles.includes(USER_ROLES.ADMIN.value)
);

export const selectIsUserManager = createSelector(
  selectSessionUserRoles,
  (userRoles) => userRoles.includes(USER_ROLES.MANAGER.value)
    || userRoles.includes(USER_ROLES.ADMIN.value)
);

export const selectIsUserAnalyst = createSelector(
  selectSessionUserRoles,
  (userRoles) => userRoles.includes(USER_ROLES.ANALYST.value)
    || userRoles.includes(USER_ROLES.MANAGER.value)
    || userRoles.includes(USER_ROLES.ADMIN.value)
);

export const selectHasUserRole = createSelector(
  selectIsUserAdmin,
  selectIsUserManager,
  selectIsUserAnalyst,
  (isAdmin, isManager, isAnalyst) => ({
    [USER_ROLES.ADMIN.value]: isAdmin,
    [USER_ROLES.MANAGER.value]: isManager,
    [USER_ROLES.ANALYST.value]: isAnalyst,
  })
);

export const selectSessionUserHighestRoleId = createSelector(
  selectSessionUserRoles,
  (userRoles) => {
    if (userRoles.includes(USER_ROLES.ADMIN.value)) {
      return USER_ROLES.ADMIN.value;
    }
    if (userRoles.includes(USER_ROLES.MANAGER.value)) {
      return USER_ROLES.MANAGER.value;
    }
    if (userRoles.includes(USER_ROLES.ANALYST.value)) {
      return USER_ROLES.ANALYST.value;
    }
    return USER_ROLES.DEFAULT.value;
  }
);


// location and queries ////////////////////////////////////////////////////////

// makeSelectLocationState expects a plain JS object for the routing state
export const makeSelectLocationState = () => {
  let prevRoutingState;
  let prevRoutingStateJS;

  return (state) => {
    const routingState = state.get('route'); // or state.route

    if (!routingState.equals(prevRoutingState)) {
      prevRoutingState = routingState;
      prevRoutingStateJS = routingState.toJS();
    }

    return prevRoutingStateJS;
  };
};

export const selectCurrentPathname = createSelector(
  getRoute,
  (routeState) => {
    try {
      return routeState.getIn(['locationBeforeTransitions', 'pathname']);
    } catch (error) {
      return null;
    }
  }
);

export const selectRedirectOnAuthSuccessPath = createSelector(
  getRoute,
  (routeState) => {
    try {
      return routeState.getIn([
        'locationBeforeTransitions',
        'query',
        PARAMS.REDIRECT_ON_AUTH_SUCCESS,
      ]);
    } catch (error) {
      return null;
    }
  }
);

export const selectQueryMessages = createSelector(
  getRoute,
  (routeState) => {
    try {
      return ({
        info: routeState.getIn(['locationBeforeTransitions', 'query', 'info']),
        warning: routeState.getIn(['locationBeforeTransitions', 'query', 'warning']),
        error: routeState.getIn(['locationBeforeTransitions', 'query', 'error']),
        infotype: routeState.getIn(['locationBeforeTransitions', 'query', 'infotype']),
      });
    } catch (error) {
      return null;
    }
  }
);

export const selectPreviousPathname = createSelector(
  getRoute,
  (routeState) => {
    try {
      return routeState.getIn(['locationBeforeTransitions', 'pathnamePrevious']);
    } catch (error) {
      return null;
    }
  }
);

export const selectLocation = createSelector(
  getRoute,
  (routeState) => {
    try {
      return routeState.get('locationBeforeTransitions');
    } catch (error) {
      return null;
    }
  }
);

export const selectLocationQuery = createSelector(
  selectLocation,
  (location) => location && location.get('query')
);

// filter queries //////////////////////////////////////////////////////////////

// TODO consider replacing all "(state, locationQuery) => locationQuery" with selectLocationQuery
const selectWhereQuery = createSelector(
  (state, locationQuery) => locationQuery,
  (locationQuery) => locationQuery && locationQuery.get('where')
);
export const selectAttributeQuery = createSelector(
  (state, { locationQuery }) => selectWhereQuery(state, locationQuery),
  (whereQuery) => whereQuery && asList(whereQuery).reduce(
    (memo, where) => {
      const attrValue = where.split(':');
      return Object.assign(memo, { [attrValue[0]]: attrValue[1] });
    },
    {},
  )
);

export const selectWithoutQuery = createSelector(
  (state, locationQuery) => locationQuery,
  (locationQuery) => locationQuery && locationQuery.get('without')
);
export const selectCategoryQuery = createSelector(
  (state, locationQuery) => locationQuery,
  (locationQuery) => locationQuery && locationQuery.get('cat')
);
export const selectConnectionQuery = createSelector(
  (state, locationQuery) => locationQuery,
  (locationQuery) => locationQuery && locationQuery.get('connected')
);
export const selectConnectedCategoryQuery = createSelector(
  (state, locationQuery) => locationQuery,
  (locationQuery) => locationQuery && locationQuery.get('catx')
);
export const selectSearchQuery = createSelector(
  (state, locationQuery) => locationQuery,
  (locationQuery) => locationQuery && locationQuery.get('search')
);
export const selectActortypeListQuery = createSelector(
  (state, locationQuery) => locationQuery,
  (locationQuery) => locationQuery && locationQuery.get('actortypex')
);
export const selectActiontypeListQuery = createSelector(
  (state, locationQuery) => locationQuery,
  (locationQuery) => locationQuery && locationQuery.get('actiontypex')
);
export const selectSortOrderQuery = createSelector(
  (state, locationQuery) => locationQuery,
  (locationQuery) => locationQuery && locationQuery.get('order')
);
export const selectSortByQuery = createSelector(
  (state, locationQuery) => locationQuery,
  (locationQuery) => locationQuery && locationQuery.get('sort')
);

export const selectActortypeQuery = createSelector(
  selectLocationQuery,
  (query) => (query && query.get('actortype'))
    ? query.get('actortype')
    : 'all'
);
export const selectActiontypeQuery = createSelector(
  selectLocationQuery,
  (query) => (query && query.get('actiontype'))
    ? query.get('actiontype')
    : 'all'
);

// database ////////////////////////////////////////////////////////////////////////

const selectEntitiesAll = (state) => state.getIn(['global', 'entities']);

export const selectEntities = createSelector(
  selectEntitiesAll,
  (state, path) => path,
  (entities, path) => entities.get(path)
);

// select a single entity by path and id
export const selectEntity = createSelector(
  (state, { path }) => selectEntities(state, path),
  (state, { id }) => id,
  (entities, id) => id && entities.get(id.toString())
);


// actions and activities //////////////////////////////////////////////////////

// all actions
export const selectActions = createSelector(
  (state) => selectEntities(state, API.ACTIONS),
  (entities) => entities
);
// all actors
export const selectActors = createSelector(
  (state) => selectEntities(state, API.ACTORS),
  (entities) => entities
);
// all action types
export const selectActortypes = createSelector(
  (state) => selectEntities(state, API.ACTORTYPES),
  (entities) => entities
);
// all action types
export const selectActiontypes = createSelector(
  (state) => selectEntities(state, API.ACTIONTYPES),
  (state, active) => active,
  (entities, active) => entities && entities.map(
    (entity) => active && qe(active, entity.get('id'))
      ? entity.set('active', true)
      : entity
  )
);
// single action type
export const selectActiontype = createSelector(
  (state) => selectEntities(state, API.ACTIONTYPES),
  (state, id) => id,
  (entities, id) => entities && entities.get(id.toString())
);
// single actor type
export const selectActortype = createSelector(
  (state) => selectEntities(state, API.ACTORTYPES),
  (state, id) => id, // type id
  (entities, id) => entities && entities.get(id.toString())
);

// TODO check: likely not needed
export const selectActiveActortypes = createSelector(
  selectActortypes,
  selectActortypeQuery,
  (entities, typeQuery) => {
    if (
      entities
      && entities.size > 1
      && typeQuery
      && typeQuery !== 'all'
    ) {
      return entities.filter((type) => qe(typeQuery, type.get('id')));
    }
    return entities;
  }
);
// TODO check: likely not needed
export const selectActiveActiontypes = createSelector(
  selectActiontypes,
  selectActiontypeQuery,
  (entities, typeQuery) => {
    if (
      entities
      && entities.size > 1
      && typeQuery
      && typeQuery !== 'all'
    ) {
      return entities.filter((type) => qe(typeQuery, type.get('id')));
    }
    return entities;
  }
);
// all actors for a given type id
export const selectActortypeActors = createSelector(
  selectActors,
  (state, { type }) => type,
  (entities, type) => {
    if (entities && type) {
      return entities.filter(
        (actor) => qe(
          type,
          actor.getIn(['attributes', 'actortype_id']),
        )
      );
    }
    return entities;
  }
);
// all actions for a given type id
export const selectActiontypeActions = createSelector(
  selectActions,
  (state, { type }) => type,
  (entities, type) => {
    if (entities && type) {
      return entities.filter(
        (actor) => qe(
          type,
          actor.getIn(['attributes', 'measuretype_id']),
        )
      );
    }
    return entities;
  }
);

// TODO check: likely not needed
// returns actions not associated or associated with current actortype
export const selectActortypeActions = createSelector(
  (state) => selectEntities(state, API.ACTIONS),
  (entities) => entities
);
// export const selectActortypeActions = createSelector(
//   (state) => selectEntities(state, API.ACTIONS),
//   selectActortypeQuery,
//   selectActortypeActors,
//   (state) => selectEntities(state, API.ACTOR_ACTIONS), // active
//   selectIsUserManager,
//   (entities, actortype, actors, actorActions, isManager) => {
//     if (entities && actors && actorActions) {
//       if (actortype && actortype !== 'all') {
//         return entities.filter(
//           (action) => {
//             const actorIds = actorActions.filter(
//               (rm) => qe(
//                 rm.getIn(['attributes', 'measure_id']),
//                 action.get('id'),
//               )
//             ).map(
//               (rm) => rm.getIn(['attributes', 'actor_id'])
//             );
//             return (isManager && actorIds.size === 0) || actorIds.some(
//               (id) => !!actors.find(
//                 (actor) => qe(actor.get('id'), id)
//               )
//             );
//           }
//         );
//       }
//       return entities;
//     }
//     return null;
//   }
// );F

// TODO check: likely not needed
export const selectActortypeEntitiesAll = createSelector(
  selectEntitiesAll,
  selectActortypeActors,
  selectActortypeActions,
  (entities, actors, actions) => entities
    .set('actors', actors)
    .set('actions', actions)
);
// TODO check: likely not needed
export const selectActiontypeEntitiesAll = createSelector(
  selectEntitiesAll,
  selectActortypeActors,
  selectActiontypeActions,
  (entities, actors, actions) => entities
    .set('actors', actors)
    .set('actions', actions)
);

// filtered entities ///////////////////////////////////////////////////////////

// filter entities by attributes, using object
export const selectEntitiesWhere = createSelector(
  (state, { where }) => where,
  (state, { path }) => selectEntities(state, path),
  (query, entities) => query
    ? filterEntitiesByAttributes(entities, query)
    : entities
);

// filter entities by attributes, using locationQuery
const selectEntitiesWhereQuery = createSelector(
  selectAttributeQuery,
  (state, { path }) => selectEntities(state, path),
  (query, entities) => query
    ? filterEntitiesByAttributes(entities, query)
    : entities
);
export const selectEntitiesSearchQuery = createSelector(
  selectEntitiesWhereQuery,
  (state, { locationQuery }) => selectSearchQuery(state, locationQuery),
  (state, { searchAttributes }) => searchAttributes,
  (entities, query, searchAttributes) => query
    ? filterEntitiesByKeywords(entities, query, searchAttributes)
    : entities // !search
);

// filter entities by attributes, using object
export const selectActorsWhere = createSelector(
  (state, { where }) => where,
  selectActortypeActors, // type should be optional
  (query, entities) => query
    ? filterEntitiesByAttributes(entities, query)
    : entities
);

// filter entities by attributes, using locationQuery
const selectActorsWhereQuery = createSelector(
  selectAttributeQuery,
  selectActortypeActors, // type should be optional
  (query, entities) => query
    ? filterEntitiesByAttributes(entities, query)
    : entities
);

// TODO: passing of location query likely not needed if selectSearchQuery changed
export const selectActorsSearchQuery = createSelector(
  selectActorsWhereQuery,
  (state, { locationQuery }) => selectSearchQuery(state, locationQuery),
  (state, { searchAttributes }) => searchAttributes,
  (entities, query, searchAttributes) => query
    ? filterEntitiesByKeywords(entities, query, searchAttributes)
    : entities // !search
);

// filter entities by attributes, using object
export const selectActionsWhere = createSelector(
  (state, { where }) => where,
  selectActiontypeActions, // type should be optional
  (query, entities) => query
    ? filterEntitiesByAttributes(entities, query)
    : entities
);

// filter entities by attributes, using locationQuery
const selectActionsWhereQuery = createSelector(
  selectAttributeQuery,
  selectActiontypeActions, // type should be optional
  (query, entities) => query
    ? filterEntitiesByAttributes(entities, query)
    : entities
);
export const selectActionsSearchQuery = createSelector(
  selectActionsWhereQuery,
  (state, { locationQuery }) => selectSearchQuery(state, locationQuery),
  (state, { searchAttributes }) => searchAttributes,
  (entities, query, searchAttributes) => query
    ? filterEntitiesByKeywords(entities, query, searchAttributes)
    : entities // !search
);

// taxonomies and categories ///////////////////////////////////////////////////

// select all categories
export const selectCategories = createSelector(
  (state) => selectEntities(state, API.CATEGORIES),
  (entities) => entities
);
// select all taxonomies
export const selectTaxonomies = createSelector(
  (state) => selectEntities(state, API.TAXONOMIES),
  (entities) => entities
);

// select all taxonomies sorted by priority
export const selectTaxonomiesSorted = createSelector(
  selectTaxonomies,
  (entities) => entities
    && sortEntities(entities, 'asc', 'priority', null, false)
);
// get all actor taxonomies for a given type

// select single taxonomy
export const selectTaxonomy = createSelector(
  (state, id) => id,
  selectTaxonomies,
  (id, entities) => id && entities.get(id.toString())
);

// get all taxonomies applicable to actors (of any type)
export const selectActorTaxonomies = createSelector(
  selectTaxonomiesSorted,
  (state) => selectEntities(state, API.ACTORTYPE_TAXONOMIES),
  (taxonomies, actortypeTaxonomies) => taxonomies
    && actortypeTaxonomies
    && taxonomies.filter(
      // connected to current actortype
      (tax) => actortypeTaxonomies.some(
        (type) => qe(
          type.getIn(['attributes', 'taxonomy_id']),
          tax.get('id'),
        )
      )
    ).map(
      // TODO check if really needed
      (tax) => {
        // connectedActortypes
        const actortypeIds = actortypeTaxonomies.reduce(
          (memo, type) => {
            if (
              qe(
                type.getIn(['attributes', 'taxonomy_id']),
                tax.get('id')
              )
            ) {
              return memo.push(type.getIn(['attributes', 'actortype_id']));
            }
            return memo;
          },
          List(),
        );
        return tax.set('actortypeIds', actortypeIds);
      }
    )
);

// get all taxonomies applicable to actions
export const selectActionTaxonomies = createSelector(
  selectTaxonomiesSorted,
  (state) => selectEntities(state, API.ACTIONTYPE_TAXONOMIES),
  (taxonomies, actiontypeTaxonomies) => taxonomies
    && actiontypeTaxonomies
    && taxonomies.filter(
      // connected to any actortype
      (tax) => actiontypeTaxonomies.some(
        (type) => qe(
          type.getIn(['attributes', 'taxonomy_id']),
          tax.get('id'),
        )
      )
    // ).map(
    //   (tax) => {
    //     // connectedActortypes
    //     const actiontypeIds = actiontypeTaxonomies.reduce(
    //       (memo, type) => {
    //         if (
    //           qe(
    //             type.getIn(['attributes', 'taxonomy_id']),
    //             tax.get('id')
    //           )
    //         ) {
    //           return memo.push(type.getIn(['attributes', 'actortype_id']));
    //         }
    //         return memo;
    //       },
    //       List(),
    //     );
    //     return tax.set('actiontypeIds', actiontypeIds);
    //   }
    )
);

// get all taxonomies applicable to actor type
export const selectActortypeTaxonomies = createSelector(
  (state, args) => args ? args.type : null,
  selectTaxonomiesSorted,
  (state) => selectEntities(state, API.ACTORTYPE_TAXONOMIES),
  (typeId, taxonomies, actortypeTaxonomies) => typeId
    && taxonomies
    && actortypeTaxonomies
    && taxonomies.filter(
      // connected to current actortype
      (tax) => actortypeTaxonomies.some(
        (type) => qe(
          type.getIn(['attributes', 'taxonomy_id']),
          tax.get('id'),
        ) && qe(
          type.getIn(['attributes', 'actortype_id']),
          typeId,
        )
      )
    ).map(
      // TODO check if needed
      (tax) => {
        // connectedActortypes
        const actortypeIds = actortypeTaxonomies.reduce(
          (memo, type) => {
            if (
              qe(
                type.getIn(['attributes', 'taxonomy_id']),
                tax.get('id')
              )
            ) {
              return memo.push(type.getIn(['attributes', 'actortype_id']));
            }
            return memo;
          },
          List(),
        );
        return tax.set('actortypeIds', actortypeIds);
      }
    )
);

// get all taxonomies applicable to actor type with categories
export const selectActortypeTaxonomiesWithCats = createSelector(
  (state, args) => args ? args.includeParents : true,
  selectActortypeTaxonomies,
  (state) => selectEntities(state, API.CATEGORIES),
  (includeParents, taxonomies, categories) => prepareTaxonomies(
    taxonomies,
    categories,
    includeParents,
  )
);

// // get all taxonomies applicable to action type
export const selectActiontypeTaxonomies = createSelector(
  (state, args) => args ? args.type : null,
  selectTaxonomiesSorted,
  (state) => selectEntities(state, API.ACTIONTYPE_TAXONOMIES),
  (typeId, taxonomies, actiontypeTaxonomies) => typeId
    && taxonomies
    && actiontypeTaxonomies
    && taxonomies.filter(
      // connected to current actortype
      (tax) => actiontypeTaxonomies.some(
        (type) => qe(
          type.getIn(['attributes', 'taxonomy_id']),
          tax.get('id'),
        ) && qe(
          type.getIn(['attributes', 'measuretype_id']),
          typeId,
        )
      )
    // ).map(
    //   (tax) => {
    //     // set all actiontypes valid for taxonomy
    //     const actiontypeIds = actiontypeTaxonomies.reduce(
    //       (memo, type) => {
    //         if (
    //           qe(
    //             type.getIn(['attributes', 'taxonomy_id']),
    //             tax.get('id')
    //           )
    //         ) {
    //           return memo.push(type.getIn(['attributes', 'measuretype_id']));
    //         }
    //         return memo;
    //       },
    //       List(),
    //     );
    //     return tax.set('actiontypeIds', actiontypeIds);
    //   }
    )
);

// get all taxonomies applicable to action type with categories
export const selectActiontypeTaxonomiesWithCats = createSelector(
  (state, args) => args ? args.includeParents : true,
  selectActiontypeTaxonomies,
  (state) => selectEntities(state, API.CATEGORIES),
  (includeParents, taxonomies, categories) => prepareTaxonomies(
    taxonomies,
    categories,
    includeParents,
  )
);

// get all taxonomies with nested categories
export const selectAllTaxonomiesWithCategories = createSelector(
  selectTaxonomiesSorted,
  selectCategories,
  (taxonomies, categories) => taxonomies && taxonomies.map(
    (tax) => tax.set(
      'categories',
      categories.filter(
        (cat) => qe(
          tax.get('id'),
          cat.getIn(['attributes', 'taxonomy_id']),
        )
      )
    )
  )
);

export const selectUserTaxonomies = createSelector(
  selectTaxonomiesSorted,
  (state) => selectEntities(state, API.CATEGORIES),
  (taxonomies, categories) => prepareTaxonomiesTags(
    taxonomies,
    categories,
    'tags_users',
  )
);

// potential connections ///////////////////////////////////////////////////////

export const selectUserConnections = createSelector(
  (state) => selectEntities(state, API.ROLES),
  (roles) => Map().set('roles', roles)
);

export const selectActorConnections = createSelector(
  selectActiontypeActions,
  (actions) => Map()
    .set('actions', actions)
);

export const selectActionConnections = createSelector(
  selectActortypeActors,
  (actors) => Map()
    .set('actors', actors)
);

// grouped JOIN tables /////////////////////////////////////////////////////////////////

export const selectActorCategoriesGroupedByActor = createSelector(
  (state) => selectEntities(state, API.ACTOR_CATEGORIES),
  (entities) => entities
    && entities.groupBy(
      (entity) => entity.getIn(['attributes', 'actor_id'])
    ).map(
      (group) => group.map(
        (entity) => entity.getIn(['attributes', 'category_id'])
      )
    ),
);
export const selectActorCategoriesGroupedByCategory = createSelector(
  (state) => selectEntities(state, API.ACTOR_CATEGORIES),
  (entities) => entities
    && entities.groupBy(
      (entity) => entity.getIn(['attributes', 'category_id'])
    ).map(
      (group) => group.map(
        (entity) => entity.getIn(['attributes', 'actor_id'])
      )
    ),
);

export const selectActorActionsGroupedByActor = createSelector(
  (state) => selectEntities(state, API.ACTOR_ACTIONS),
  (entities) => entities
    && entities.groupBy(
      (entity) => entity.getIn(['attributes', 'actor_id'])
    ).map(
      (group) => group.map(
        (entity) => entity.getIn(['attributes', 'measure_id'])
      )
    ),
);
export const selectActorActionsGroupedByAction = createSelector(
  (state) => selectEntities(state, API.ACTOR_ACTIONS),
  (entities) => entities
    && entities.groupBy(
      (entity) => entity.getIn(['attributes', 'measure_id'])
    ).map(
      (group) => group.map(
        (entity) => entity.getIn(['attributes', 'actor_id'])
      )
    ),
);

export const selectActionCategoriesGroupedByAction = createSelector(
  (state) => selectEntities(state, API.ACTION_CATEGORIES),
  (entities) => entities
    && entities.groupBy(
      (entity) => entity.getIn(['attributes', 'measure_id'])
    ).map(
      (group) => group.map(
        (entity) => entity.getIn(['attributes', 'category_id'])
      )
    ),
);
export const selectActionCategoriesGroupedByCategory = createSelector(
  (state) => selectEntities(state, API.ACTION_CATEGORIES),
  (entities) => entities
    && entities.groupBy(
      (entity) => entity.getIn(['attributes', 'category_id'])
    ).map(
      (group) => group.map(
        (entity) => entity.getIn(['attributes', 'measure_id'])
      )
    ),
);
export const selectUserCategoriesGroupedByUser = createSelector(
  (state) => selectEntities(state, API.USER_CATEGORIES),
  (entities) => entities
    && entities.groupBy(
      (entity) => entity.getIn(['attributes', 'user_id'])
    ).map(
      (group) => group.map(
        (entity) => entity.getIn(['attributes', 'category_id'])
      )
    ),
);

// TABLES with nested ids /////////////////////////////////////////////////////////////
// get actors with category ids
export const selectActorsCategorised = createSelector(
  selectActortypeActors,
  selectActorCategoriesGroupedByActor,
  (entities, associationsGrouped) => entitiesSetCategoryIds(
    entities,
    associationsGrouped,
  )
);
// get actions with category ids
export const selectActionsCategorised = createSelector(
  selectActiontypeActions,
  selectActionCategoriesGroupedByAction,
  (entities, associationsGrouped) => entitiesSetCategoryIds(
    entities,
    associationsGrouped,
  )
);

// TODO: check, likely obsolete
export const selectViewActorActortypeId = createSelector(
  (state, id) => selectEntity(state, { path: API.ACTORS, id }),
  selectCurrentPathname,
  (entity, pathname) => {
    if (
      pathname.startsWith(ROUTES.ACTORS)
      && entity
      && entity.getIn(['attributes', 'actortype_id'])
    ) {
      return entity.getIn(['attributes', 'actortype_id']).toString();
    }
    return null;
  }
);
