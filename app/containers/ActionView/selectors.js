import { createSelector } from 'reselect';
import { Map } from 'immutable';
import { API } from 'themes/config';

import {
  selectReady,
  selectEntity,
  selectEntities,
  selectCategories,
  selectTaxonomiesSorted,
  selectActorConnections,
  selectActors,
  selectActionActorsGroupedByAction,
  selectActorActionsGroupedByActor,
  // selectActionActorsGroupedByActor,
  selectActorActionsGroupedByAction,
  selectActorCategoriesGroupedByActor,
} from 'containers/App/selectors';

import {
  entitySetUser,
  prepareTaxonomiesIsAssociated,
  getEntityCategories,
} from 'utils/entities';

import { DEPENDENCIES } from './constants';

export const selectViewEntity = createSelector(
  (state, id) => selectEntity(state, { path: API.ACTIONS, id }),
  (state) => selectEntities(state, API.USERS),
  (entity, users) => entitySetUser(entity, users)
);

// TODO optimise use selectActionCategoriesGroupedByAction
export const selectViewTaxonomies = createSelector(
  (state, id) => id,
  selectTaxonomiesSorted,
  selectCategories,
  (state) => selectEntities(state, API.ACTION_CATEGORIES),
  (id, taxonomies, categories, associations) => prepareTaxonomiesIsAssociated(
    taxonomies,
    categories,
    associations,
    'tags_actions',
    'measure_id',
    id,
  )
);

const selectActorAssociations = createSelector(
  (state, id) => id,
  selectActorActionsGroupedByAction,
  (actionId, associationsByAction) => associationsByAction.get(
    parseInt(actionId, 10)
  )
);
const selectTargetAssociations = createSelector(
  (state, id) => id,
  selectActionActorsGroupedByAction,
  (actionId, associationsByAction) => associationsByAction.get(
    parseInt(actionId, 10)
  )
);
const selectActorsAssociated = createSelector(
  selectActors,
  selectActorAssociations,
  (actors, associations) => actors && associations && associations.reduce(
    (memo, id) => {
      const entity = actors.get(id.toString());
      return entity
        ? memo.set(id, entity)
        : memo;
    },
    Map(),
  )
);
const selectTargetsAssociated = createSelector(
  selectActors,
  selectTargetAssociations,
  (actors, associations) => actors && associations && associations.reduce(
    (memo, id) => {
      const entity = actors.get(id.toString());
      return entity
        ? memo.set(id, entity)
        : memo;
    },
    Map(),
  )
);

// get associated actors with associoted actions and categories
// - group by actortype
export const selectActorsByType = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectActorsAssociated,
  selectActorConnections,
  selectActorActionsGroupedByActor,
  selectActorCategoriesGroupedByActor,
  selectCategories,
  (
    ready,
    actors,
    connections,
    actorActions,
    actorCategories,
    categories,
  ) => {
    if (!ready) return Map();
    return actors && actors.map(
      (actor) => {
        const entityActions = actorActions.get(parseInt(actor.get('id'), 10));
        const entityActionsByActiontype = entityActions
          && connections.get('actions')
          && entityActions.filter(
            (actionId) => connections.getIn([
              'actions',
              actionId.toString(),
            ])
          ).groupBy(
            (actionId) => connections.getIn([
              'actions',
              actionId.toString(),
              'attributes',
              'measuretype_id',
            ]).toString()
          ).sortBy((val, key) => key);
        return actor.set(
          'categories',
          getEntityCategories(
            actor.get('id'),
            actorCategories,
            categories,
          )
        ).set(
          'actions',
          entityActions,
        ).set(
          'actionsByType',
          entityActionsByActiontype,
        );
      }
    ).groupBy(
      (r) => r.getIn(['attributes', 'actortype_id'])
    ).sortBy((val, key) => key);
  }
);
// get associated actors with associoted actions and categories
// - group by actortype
export const selectTargetsByType = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectTargetsAssociated,
  selectActorConnections,
  selectActorActionsGroupedByActor,
  selectActorCategoriesGroupedByActor,
  selectCategories,
  (
    ready,
    targets,
    connections,
    actorActions, // aka actionTargets
    actorCategories,
    categories,
  ) => {
    if (!ready) return Map();
    return targets && targets.map(
      (target) => {
        const entityActions = actorActions.get(parseInt(target.get('id'), 10));
        const entityActionsByActiontype = entityActions
          && connections.get('actions')
          && entityActions.filter(
            (actionId) => connections.getIn([
              'actions',
              actionId.toString(),
            ])
          ).groupBy(
            (actionId) => connections.getIn([
              'actions',
              actionId.toString(),
              'attributes',
              'measuretype_id',
            ]).toString()
          ).sortBy((val, key) => key);
        return target.set(
          'categories',
          getEntityCategories(
            target.get('id'),
            actorCategories,
            categories,
          )
        ).set(
          'actions',
          entityActions,
        ).set(
          'actionsByType',
          entityActionsByActiontype,
        );
      }
    ).groupBy(
      (r) => r.getIn(['attributes', 'actortype_id'])
    ).sortBy((val, key) => key);
  }
);
