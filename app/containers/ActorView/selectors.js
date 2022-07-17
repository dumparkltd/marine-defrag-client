import { createSelector } from 'reselect';
import { Map } from 'immutable';
import {
  API,
  FF_ACTIONTYPE,
  ACTIONTYPES_CONFIG,
  ACTORTYPES_CONFIG,
  ACTIONTYPE_ACTOR_ACTION_ROLES,
} from 'themes/config';

import qe from 'utils/quasi-equals';
import {
  selectReady,
  selectEntity,
  selectEntities,
  selectCategories,
  selectTaxonomiesSorted,
  selectActionConnections,
  selectActorConnections,
  selectActions,
  selectActorActionsGroupedByAction,
  selectActorActionsGroupedByActionAttributes,
  selectActionActorsGroupedByAction,
  selectActorActionsGroupedByActor,
  selectActionActorsGroupedByActor,
  selectActionCategoriesGroupedByAction,
  selectActionResourcesGroupedByAction,
  selectMembershipsGroupedByMember,
  selectMembershipsGroupedByAssociation,
  selectActors,
  selectActorCategoriesGroupedByActor,
  selectActorActionsGroupedByActorAttributes,
} from 'containers/App/selectors';

import {
  entitySetUser,
  prepareTaxonomiesIsAssociated,
  setActionConnections,
  setActorConnections,
} from 'utils/entities';

import { DEPENDENCIES } from './constants';

export const selectViewEntity = createSelector(
  (state, id) => selectEntity(state, { path: API.ACTORS, id }),
  (state) => selectEntities(state, API.USERS),
  (entity, users) => entitySetUser(entity, users)
);

// TODO optimise use selectActorCategoriesGroupedByActor
export const selectViewTaxonomies = createSelector(
  (state, id) => id,
  selectTaxonomiesSorted,
  selectCategories,
  (state) => selectEntities(state, API.ACTOR_CATEGORIES),
  (id, taxonomies, categories, associations) => prepareTaxonomiesIsAssociated(
    taxonomies,
    categories,
    associations,
    'tags_actors',
    'actor_id',
    id,
  )
);

const selectActionAssociations = createSelector(
  (state, id) => id,
  selectActorActionsGroupedByActor,
  (actorId, associationsByActor) => associationsByActor.get(
    parseInt(actorId, 10)
  )
);
const selectActionAsTargetAssociations = createSelector(
  (state, id) => id,
  selectActionActorsGroupedByActor,
  (actorId, associationsByActor) => associationsByActor.get(
    parseInt(actorId, 10)
  )
);
const selectActionsAssociated = createSelector(
  selectActions,
  selectActionAssociations,
  (actions, associations) => actions && associations && associations.reduce(
    (memo, id) => {
      const entity = actions.get(id.toString());
      return entity
        ? memo.set(id, entity)
        : memo;
    },
    Map(),
  )
);

// all connected actions
// get associated actors with associoted actions and categories
// - group by actortype
export const selectActionsWith = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectActionsAssociated,
  selectActionConnections,
  selectActorActionsGroupedByAction,
  selectActorActionsGroupedByActionAttributes,
  selectActionActorsGroupedByAction,
  selectActionResourcesGroupedByAction,
  selectCategories,
  selectActionCategoriesGroupedByAction,
  (
    ready,
    actions,
    actionConnections,
    actorActions,
    actorActionsAttributes,
    actionActors,
    actionResources,
    categories,
    actionCategories,
  ) => {
    if (!ready) return Map();
    return actions && actions
      .map((action) => setActionConnections({
        action,
        actionConnections,
        actorActions,
        actorActionsAttributes,
        actionActors,
        actionResources,
        categories,
        actionCategories,
      }));
  }
);

export const selectActionsByType = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectActionsWith,
  selectViewEntity,
  selectActorActionsGroupedByActorAttributes,
  (
    ready,
    actionsWithConnections,
    viewEntity,
    actorActionsAttributes,
  ) => {
    if (!ready) return Map();
    const actions = actionsWithConnections && actionsWithConnections
      .map((action) => {
        const hasRelationshipRole = action
          && ACTIONTYPE_ACTOR_ACTION_ROLES[action.getIn(['attributes', 'measuretype_id'])]
          && ACTIONTYPE_ACTOR_ACTION_ROLES[action.getIn(['attributes', 'measuretype_id'])].length > 0;
        if (hasRelationshipRole) {
          const viewEntityActions = actorActionsAttributes.get(parseInt(viewEntity.get('id'), 10));
          const actionConnection = viewEntityActions.find(
            (connection) => qe(action.get('id'), connection.get('measure_id'))
          );
          return action.setIn(['relationshipRole', viewEntity.get('id')], actionConnection.get('relationshiptype_id'));
        }
        return action;
      });
    return actions && actions
      .groupBy((r) => r.getIn(['attributes', 'measuretype_id']))
      .filter(
        (typeActions, typeId) => !qe(typeId, FF_ACTIONTYPE),
      )
      .sortBy((val, key) => key);
  }
);

const selectActionsAsTargetAssociated = createSelector(
  selectActions,
  selectActionAsTargetAssociations,
  (actions, associations) => actions && associations && associations.reduce(
    (memo, id) => {
      const entity = actions.get(id.toString());
      return entity
        ? memo.set(id, entity)
        : memo;
    },
    Map(),
  )
);
// all connected actions where view entity is target
// get associated actors with associoted actions and categories
// - group by actortype
export const selectActionsAsTargetByType = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectActionsAsTargetAssociated,
  selectActionConnections,
  selectActorActionsGroupedByAction,
  selectActorActionsGroupedByActionAttributes,
  selectActionActorsGroupedByAction,
  selectActionResourcesGroupedByAction,
  selectActionCategoriesGroupedByAction,
  selectCategories,
  (
    ready,
    actions,
    actionConnections,
    actorActions,
    actorActionsAttributes,
    actionActors,
    actionResources,
    actionCategories,
    categories,
  ) => {
    if (!ready) return Map();
    return actions && actions
      .map((action) => setActionConnections({
        action,
        actionConnections,
        actorActions,
        actorActionsAttributes,
        actionActors,
        actionResources,
        categories,
        actionCategories,
      }))
      .groupBy((r) => r.getIn(['attributes', 'measuretype_id']))
      .sortBy(
        (val, key) => key,
        (a, b) => {
          const configA = ACTIONTYPES_CONFIG[a];
          const configB = ACTIONTYPES_CONFIG[b];
          return configA.order < configB.order ? -1 : 1;
        }
      );
  }
);

// connected actors (members/associations)
const selectMemberJoins = createSelector(
  (state, id) => id,
  selectMembershipsGroupedByAssociation,
  (actorId, joinsByAssociation) => joinsByAssociation.get(
    parseInt(actorId, 10)
  )
);
const selectMembersJoined = createSelector(
  selectActors,
  selectMemberJoins,
  (members, joins) => members && joins && joins.reduce(
    (memo, id) => {
      const entity = members.get(id.toString());
      return entity
        ? memo.set(id, entity)
        : memo;
    },
    Map(),
  )
);

// get associated actors with associoted actions and categories
// - group by actortype
export const selectMembersByType = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectMembersJoined,
  selectActorConnections,
  selectActorActionsGroupedByActor,
  selectActionActorsGroupedByActor,
  selectMembershipsGroupedByMember,
  selectMembershipsGroupedByAssociation,
  selectActorCategoriesGroupedByActor,
  selectCategories,
  (
    ready,
    actors,
    actorConnections,
    actorActions,
    actionActors,
    memberships,
    associations,
    actorCategories,
    categories,
  ) => {
    if (!ready) return Map();
    return actors && actors
      .map((actor) => setActorConnections({
        actor,
        actorConnections,
        actorActions,
        actionActors,
        categories,
        actorCategories,
        memberships,
        associations,
      }))
      .groupBy((r) => r.getIn(['attributes', 'actortype_id']))
      .sortBy(
        (val, key) => key,
        (a, b) => {
          const configA = ACTORTYPES_CONFIG[a];
          const configB = ACTORTYPES_CONFIG[b];
          return configA.order < configB.order ? -1 : 1;
        }
      );
  }
);

const selectAssociationJoins = createSelector(
  (state, id) => id,
  selectMembershipsGroupedByMember,
  (actorId, joinsByMember) => joinsByMember.get(
    parseInt(actorId, 10)
  )
);
const selectAssociationsJoined = createSelector(
  selectActors,
  selectAssociationJoins,
  (members, joins) => members && joins && joins.reduce(
    (memo, id) => {
      const entity = members.get(id.toString());
      return entity
        ? memo.set(id, entity)
        : memo;
    },
    Map(),
  )
);
// get associated actors with associoted actions and categories
// - group by actortype
export const selectAssociationsByType = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectAssociationsJoined,
  (
    ready,
    actors,
  ) => {
    if (!ready) return Map();
    return actors && actors
      .groupBy((r) => r.getIn(['attributes', 'actortype_id']))
      .sortBy((val, key) => key);
  }
);

// get any indirect actions actor is associated with via any associations it belongs to
export const selectActionsAsMemberByActortype = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectAssociationsJoined, // all groups current actor is member of
  selectActorActionsGroupedByActor,
  selectActorConnections,
  selectActionConnections,
  selectActorActionsGroupedByAction,
  selectActorActionsGroupedByActionAttributes,
  selectActionActorsGroupedByAction,
  selectActionResourcesGroupedByAction,
  selectCategories,
  selectActionCategoriesGroupedByAction,
  selectActions,
  (
    ready,
    associations,
    actorActionsByActor,
    actorConnections,
    actionConnections,
    actorActionsByAction,
    actorActionsByActionAttributes,
    actionActors,
    actionResources,
    categories,
    actionCategories,
    actions,
  ) => {
    if (!ready || !associations) return Map();
    return associations.map(
      (actor) => setActorConnections({ actor, actorActions: actorActionsByActor, actorConnections })
    ).filter(
      (actor) => actor.get('actionsByType') && actor.get('actionsByType').size > 0
    ).map(
      (actor) => actor.set(
        'actionsByType',
        actor.get('actionsByType').map(
          (actionIdsForType) => actionIdsForType.map(
            (actionId) => setActionConnections({
              action: actions.get(actionId.toString()),
              categories,
              actionCategories,
              actionConnections,
              actorActions: actorActionsByAction,
              actorActionsAttributes: actorActionsByActionAttributes,
              actionActors,
              actionResources,
            })
          )
        )
      )
    ).groupBy(
      (r) => r.getIn(['attributes', 'actortype_id'])
    ).sortBy(
      (val, key) => key,
      (a, b) => {
        const configA = ACTORTYPES_CONFIG[a];
        const configB = ACTORTYPES_CONFIG[b];
        return configA.order < configB.order ? -1 : 1;
      }
    );
  },
);
export const selectActionsAsTargetAsMemberByActortype = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectAssociationsJoined, // all associations
  selectActionActorsGroupedByActor,
  selectActorConnections,
  selectActionConnections,
  selectActorActionsGroupedByAction,
  selectActorActionsGroupedByActionAttributes,
  selectActionActorsGroupedByAction,
  selectActionResourcesGroupedByAction,
  selectCategories,
  selectActionCategoriesGroupedByAction,
  selectActions,
  (
    ready,
    associations,
    actionActorsByActor,
    actorConnections,
    actionConnections,
    actorActionsByAction,
    actorActionsByActionAttributes,
    actionActors,
    actionResources,
    categories,
    actionCategories,
    actions,
  ) => {
    if (!ready || !associations) return Map();
    return associations.map(
      (actor) => setActorConnections({ actor, actionActors: actionActorsByActor, actorConnections })
    ).filter(
      (actor) => actor.get('targetingActionsByType') && actor.get('targetingActionsByType').size > 0
    ).map(
      (actor) => actor.set(
        'targetingActionsByType',
        actor.get('targetingActionsByType').map(
          (actionIdsForType) => actionIdsForType.map(
            (actionId) => setActionConnections({
              action: actions.get(actionId.toString()),
              categories,
              actionCategories,
              actionConnections,
              actorActions: actorActionsByAction,
              actorActionsAttributes: actorActionsByActionAttributes,
              actionActors,
              actionResources,
            })
          )
        )
      )
    ).groupBy(
      (r) => r.getIn(['attributes', 'actortype_id'])
    ).sortBy(
      (val, key) => key,
      (a, b) => {
        const configA = ACTORTYPES_CONFIG[a];
        const configB = ACTORTYPES_CONFIG[b];
        return configA.order < configB.order ? -1 : 1;
      }
    );
  },
);

export const selectActorIndicators = createSelector(
  (state, id) => id,
  selectActionsWith,
  selectActorActionsGroupedByActorAttributes,
  (id, viewActions, actorActions) => {
    const viewActorActions = actorActions && actorActions.get(parseInt(id, 10));
    return viewActions && viewActions.filter(
      (action) => qe(action.getIn(['attributes', 'measuretype_id']), FF_ACTIONTYPE)
    ).map(
      (action) => {
        const aaa = viewActorActions.find((aa) => qe(aa.get('measure_id'), action.get('id')));
        return aaa
          ? action.set('value', aaa.get('value'))
          : action;
      }
    );
  }
);
