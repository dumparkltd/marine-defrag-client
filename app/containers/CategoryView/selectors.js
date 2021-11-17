import { createSelector } from 'reselect';
import { Map } from 'immutable';
import { API } from 'themes/config';

import {
  selectReady,
  selectEntities,
  selectCategory,
  selectCategories,
  selectTaxonomies,
  selectTaxonomiesSorted,
  selectActors,
  selectActions,
  selectActorConnections,
  selectActionConnections,
  selectActorCategoriesGroupedByCategory,
  selectActionCategoriesGroupedByCategory,
  selectActorCategoriesGroupedByActor,
  selectActionCategoriesGroupedByAction,
  selectActorActionsGroupedByActor,
  selectActorActionsGroupedByAction,
} from 'containers/App/selectors';

import {
  entitySetSingles,
  getEntityCategories,
} from 'utils/entities';
import { qe } from 'utils/quasi-equals';

import { sortCategories } from 'utils/sort';

import { DEPENDENCIES } from './constants';

// the view category
export const selectViewEntity = createSelector(
  selectCategory,
  (state) => selectEntities(state, API.USERS),
  selectTaxonomiesSorted,
  selectCategories,
  (entity, users, taxonomies, categories) => entity
    && entitySetSingles(
      entity, [
        {
          related: users,
          key: 'user',
          relatedKey: 'updated_by_id',
        },
        {
          related: users,
          key: 'manager',
          relatedKey: 'manager_id',
        },
        {
          related: taxonomies,
          key: 'taxonomy',
          relatedKey: 'taxonomy_id',
        },
        {
          related: categories,
          key: 'category',
          relatedKey: 'parent_id',
        },
      ],
    )
);

// the taxonomy of the view category
export const selectTaxonomy = createSelector(
  selectCategory,
  selectTaxonomies,
  (category, taxonomies) => category && taxonomies && taxonomies.get(
    category.getIn(['attributes', 'taxonomy_id']).toString()
  )
);

// the parent taxonomy of the view category's taxonomy
export const selectParentTaxonomy = createSelector(
  selectTaxonomy,
  selectTaxonomies,
  (taxonomy, taxonomies) => taxonomy
    && taxonomies
    && taxonomy.getIn(['attributes', 'parent_id'])
    && taxonomies.get(
      taxonomy.getIn(['attributes', 'parent_id']).toString()
    )
);
// the child taxonomies of the view category's taxonomy
// - with respective child categories
export const selectChildTaxonomies = createSelector(
  selectCategory,
  selectTaxonomy,
  selectTaxonomiesSorted,
  selectCategories,
  (entity, taxonomy, taxonomies, categories) => {
    if (taxonomy && taxonomies) {
      return taxonomies
        .filter(
          (tax) => qe(tax.getIn(['attributes', 'parent_id']), taxonomy.get('id'))
        ).map(
          (tax) => tax.set(
            'categories',
            sortCategories(
              categories.filter(
                (cat) => qe(cat.getIn(['attributes', 'parent_id']), entity.get('id'))
                  && qe(cat.getIn(['attributes', 'taxonomy_id']), tax.get('id'))
              ),
              tax.get('id'),
            )
          )
        );
    }
    return null;
  }
);

const selectChildCategories = createSelector(
  (state, id) => id,
  selectCategories,
  (catId, cats) => cats.filter((cat) => qe(cat.getIn(['attributes', 'parent_id']), catId))
);

// get associated actor ids
const selectActorAssociations = createSelector(
  (state, id) => id,
  selectActorCategoriesGroupedByCategory,
  (catId, associationsByCat) => associationsByCat.get(
    parseInt(catId, 10)
  )
);
// get associated action ids
const selectActionAssociations = createSelector(
  (state, id) => id,
  selectActionCategoriesGroupedByCategory,
  (catId, associationsByCat) => associationsByCat.get(
    parseInt(catId, 10)
  )
);

// get actor ids associated with child categories
const selectChildActorAssociations = createSelector(
  selectChildCategories,
  selectActorCategoriesGroupedByCategory,
  (childCategories, associationsByCat) => childCategories
    && associationsByCat
    && childCategories.keySeq().reduce((memo, catId) => {
      const associationsForCat = associationsByCat.get(
        parseInt(catId, 10)
      );
      return associationsForCat ? memo.merge(associationsForCat) : memo;
    }, Map())
);
// get actor ids associated with child categories
const selectChildActionAssociations = createSelector(
  selectChildCategories,
  selectActionCategoriesGroupedByCategory,
  (childCategories, associationsByCat) => childCategories
    && associationsByCat
    && childCategories.keySeq().reduce((memo, catId) => {
      const associationsForCat = associationsByCat.get(
        parseInt(catId, 10)
      );
      return associationsForCat ? memo.merge(associationsForCat) : memo;
    }, Map())
);
const selectChildActorsAssociated = createSelector(
  selectActors,
  selectChildActorAssociations,
  (actors, associations) => actors && associations && associations.reduce(
    (memo, id) => {
      // return memo;
      const entity = actors.get(id.toString());
      return entity
        ? memo.set(id, entity)
        : memo;
    },
    Map(),
  ),
);
const selectChildActionsAssociated = createSelector(
  selectActors,
  selectChildActionAssociations,
  (actors, associations) => actors && associations && associations.reduce(
    (memo, id) => {
      // return memo;
      const entity = actors.get(id.toString());
      return entity
        ? memo.set(id, entity)
        : memo;
    },
    Map(),
  ),
);

// get associated actors
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
  ),
);
// get associated actions
const selectActionsAssociated = createSelector(
  selectActionAssociations,
  selectActions,
  (associations, actions) => associations && associations.map(
    (id) => actions.get(id.toString())
  )
);

// get associated actions with associoted actors and categories
// - TODO group by actortype
export const selectActionsByType = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectActionsAssociated,
  selectActionConnections,
  selectActorActionsGroupedByAction,
  selectActionCategoriesGroupedByAction,
  selectCategories,
  (
    ready,
    actions,
    connections,
    actionActors,
    actionCategories,
    categories,
  ) => {
    if (!ready) return Map();
    return actions && actions.map(
      (action) => {
        const entityActors = actionActors.get(parseInt(action.get('id'), 10));
        const entityActorsByActortype = entityActors
          && connections.get('actors')
          && entityActors.filter(
            (actorId) => connections.getIn([
              'actors',
              actorId.toString(),
            ])
          ).groupBy(
            (actorId) => connections.getIn([
              'actors',
              actorId.toString(),
              'attributes',
              'actortype_id',
            ]).toString()
          );
        return action.set(
          'categories',
          getEntityCategories(
            action.get('id'),
            actionCategories,
            categories,
          )
        // currently needs both
        ).set(
          'actors',
          entityActors,
        // nest connected actor ids byactortype
        ).set(
          'actorsByActortype',
          entityActorsByActortype,
        );
      }
    ).groupBy(
      (r) => r.getIn(['attributes', 'measuretype_id'])
    );
  }
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
          );
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
          'actorsByActortype',
          entityActionsByActiontype,
        );
      }
    ).groupBy(
      (r) => r.getIn(['attributes', 'actortype_id'])
    );
  }
);

export const selectChildActorsByType = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectChildActorsAssociated,
  selectActorActionsGroupedByActor,
  selectActorCategoriesGroupedByActor,
  selectCategories,
  (
    ready,
    actors,
    actorActions,
    actorCategories,
    categories,
  ) => actors && actors.map(
    (actor) => actor && actor.set(
      'categories',
      getEntityCategories(
        actor.get('id'),
        actorCategories,
        categories,
      )
    ).set(
      'actions',
      actorActions.get(parseInt(actor.get('id'), 10))
    )
  ).groupBy(
    (r) => r.getIn(['attributes', 'actortype_id'])
  )
);
export const selectChildActionsByType = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectChildActionsAssociated,
  selectActorActionsGroupedByAction,
  selectActionCategoriesGroupedByAction,
  selectCategories,
  (
    ready,
    actions,
    actionActors,
    actionCategories,
    categories,
  ) => actions && actions.map(
    (action) => action && action.set(
      'categories',
      getEntityCategories(
        action.get('id'),
        actionCategories,
        categories,
      )
    ).set(
      'actors',
      actionActors.get(parseInt(action.get('id'), 10))
    )
  ).groupBy(
    (r) => r.getIn(['attributes', 'actiontype_id'])
  )
);
