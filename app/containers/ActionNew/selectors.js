import { createSelector } from 'reselect';
import { ACTIONTYPE_ACTORTYPES, ACTIONTYPE_TARGETTYPES } from 'themes/config';
import { qe } from 'utils/quasi-equals';

import {
  selectCategories,
  selectActortypes,
  selectActions,
  selectActiontypes,
  selectActorTaxonomies,
  selectActorsCategorised,
  selectActorActionsGroupedByAction,
} from 'containers/App/selectors';

import { prepareTaxonomies } from 'utils/entities';

export const selectDomain = createSelector(
  (state) => state.get('actionNew'),
  (substate) => substate
);

export const selectParentOptions = createSelector(
  (state, id) => id,
  selectActions,
  selectActiontypes,
  (actiontypeId, actions, actiontypes) => {
    if (actiontypeId && actions && actiontypes) {
      const type = actiontypes.find((at) => qe(actiontypeId, at.get('id')));
      if (type && type.getIn(['attributes', 'has_parent'])) {
        return actions.filter((action) => {
          const sameType = qe(actiontypeId, action.getIn(['attributes', 'measuretype_id']));
          // const hasParent = action.getIn(['attributes', 'parent_id']);
          // todo: avoid circular dependencies
          return sameType;
        });
      }
      return null;
    }
    return null;
  }
);

export const selectConnectedTaxonomies = createSelector(
  selectActorTaxonomies,
  selectCategories,
  (taxonomies, categories) => prepareTaxonomies(
    taxonomies,
    categories,
    false,
  )
);

export const selectActorsByActortype = createSelector(
  (state, id) => id,
  selectActorsCategorised,
  selectActorActionsGroupedByAction,
  selectActortypes,
  (actiontypeId, actors, associations, actortypes) => {
    // compare App/selectors/selectActortypesForActiontype
    const validActortypeIds = ACTIONTYPE_ACTORTYPES[actiontypeId];
    if (!validActortypeIds || validActortypeIds.length === 0) {
      return null;
    }
    return actortypes.filter(
      (type) => validActortypeIds
        && validActortypeIds.indexOf(type.get('id')) > -1
        && type.getIn(['attributes', 'is_active'])
    ).map((type) => actors.filter(
      (actor) => qe(
        type.get('id'),
        actor.getIn(['attributes', 'actortype_id']),
      )
    ));
  }
);
export const selectTargetsByActortype = createSelector(
  (state, id) => id,
  selectActorsCategorised,
  selectActorActionsGroupedByAction,
  selectActortypes,
  (actiontypeId, actors, associations, actortypes) => {
    // compare App/selectors/selectActortypesForActiontype
    const validActortypeIds = ACTIONTYPE_TARGETTYPES[actiontypeId];
    if (!validActortypeIds || validActortypeIds.length === 0) {
      return null;
    }
    return actortypes.filter(
      (type) => validActortypeIds
        && validActortypeIds.indexOf(type.get('id')) > -1
        && type.getIn(['attributes', 'is_target'])
    ).map((type) => actors.filter(
      (actor) => qe(
        type.get('id'),
        actor.getIn(['attributes', 'actortype_id']),
      )
    ));
  }
);
