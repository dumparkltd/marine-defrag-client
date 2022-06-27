import { createSelector } from 'reselect';
import { API, ACTIONTYPE_ACTORTYPES, ACTIONTYPE_TARGETTYPES } from 'themes/config';
import { qe } from 'utils/quasi-equals';

import {
  selectEntity,
  selectEntities,
  selectActionsCategorised,
  selectActiontypes,
  selectActorActionsGroupedByActorAttributes,
  selectActionActorsGroupedByActor,
  selectActorCategoriesGroupedByActor,
  selectCategories,
  selectTaxonomiesSorted,
  selectReady,
  selectActorsCategorised,
  selectMembershipsGroupedByMember,
  selectMembershipsGroupedByAssociation,
  selectActortypes,
} from 'containers/App/selectors';

import {
  entitySetUser,
  entitiesSetAssociated,
  entitiesSetAssociated_NEW,
  prepareTaxonomiesAssociated,
  prepareTaxonomies,
} from 'utils/entities';

import { DEPENDENCIES } from './constants';

export const selectDomain = createSelector(
  (state) => state.get('actorEdit'),
  (substate) => substate
);

export const selectViewEntity = createSelector(
  (state, id) => selectEntity(state, { path: API.ACTORS, id }),
  (state) => selectEntities(state, API.USERS),
  (entity, users) => entitySetUser(entity, users)
);

export const selectTaxonomyOptions = createSelector(
  selectViewEntity,
  selectTaxonomiesSorted,
  (state) => selectEntities(state, API.ACTORTYPE_TAXONOMIES),
  selectCategories,
  selectActorCategoriesGroupedByActor,
  (
    entity,
    taxonomies,
    typeTaxonomies,
    categories,
    associations,
  ) => {
    if (
      entity
      && taxonomies
      && typeTaxonomies
      && categories
      && associations
    ) {
      const id = entity.get('id');
      const taxonomiesForType = taxonomies.filter((tax) => typeTaxonomies.some(
        (type) => qe(
          type.getIn(['attributes', 'taxonomy_id']),
          tax.get('id'),
        ) && qe(
          type.getIn(['attributes', 'actortype_id']),
          entity.getIn(['attributes', 'actortype_id']),
        )
      ));

      return prepareTaxonomiesAssociated(
        taxonomiesForType,
        categories,
        associations,
        'tags_actors',
        id,
        false,
      );
    }
    return null;
  }
);

export const selectConnectedTaxonomies = createSelector(
  selectTaxonomiesSorted,
  selectCategories,
  (taxonomies, categories) => prepareTaxonomies(
    taxonomies,
    categories,
    false,
  )
);

export const selectActionsByActiontype = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectViewEntity,
  selectActionsCategorised,
  selectActorActionsGroupedByActorAttributes,
  selectActiontypes,
  (ready, viewActor, actions, associations, actiontypes) => {
    if (!viewActor || !ready) return null;
    const actortypeId = viewActor.getIn(['attributes', 'actortype_id']).toString();
    // compare App/selectors/selectActiontypesForActortype
    const validActiontypeIds = Object.keys(ACTIONTYPE_ACTORTYPES).filter((actiontypeId) => {
      const actortypeIds = ACTIONTYPE_ACTORTYPES[actiontypeId];
      return actortypeIds && actortypeIds.indexOf(actortypeId) > -1;
    });
    if (!validActiontypeIds || validActiontypeIds.length === 0) {
      return null;
    }
    return actiontypes.filter(
      (type) => validActiontypeIds && validActiontypeIds.indexOf(type.get('id')) > -1
    ).map((type) => {
      const filtered = actions.filter(
        (action) => qe(
          type.get('id'),
          action.getIn(['attributes', 'measuretype_id']),
        )
      );
      return entitiesSetAssociated_NEW(
        filtered,
        associations.get(parseInt(viewActor.get('id'), 10)),
        'measure_id'
      );
    });
  }
);

export const selectActionsAsTargetByActiontype = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectViewEntity,
  selectActionsCategorised,
  selectActionActorsGroupedByActor,
  selectActiontypes,
  (ready, viewActor, actions, associations, actiontypes) => {
    if (!viewActor || !ready) return null;
    const actortypeId = viewActor.getIn(['attributes', 'actortype_id']).toString();
    // compare App/selectors/selectActiontypesForActortype
    const validActiontypeIds = Object.keys(ACTIONTYPE_TARGETTYPES).filter((actiontypeId) => {
      const actortypeIds = ACTIONTYPE_TARGETTYPES[actiontypeId];
      return actortypeIds && actortypeIds.indexOf(actortypeId) > -1;
    });
    if (!validActiontypeIds || validActiontypeIds.length === 0) {
      return null;
    }
    return actiontypes.filter(
      (type) => validActiontypeIds
        && validActiontypeIds.indexOf(type.get('id')) > -1
        && type.getIn(['attributes', 'has_target'])
    ).map((type) => {
      const filtered = actions.filter(
        (action) => qe(
          type.get('id'),
          action.getIn(['attributes', 'measuretype_id']),
        )
      );
      return entitiesSetAssociated(
        filtered,
        associations,
        viewActor.get('id'),
      );
    });
  }
);

export const selectMembersByActortype = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectViewEntity,
  selectActorsCategorised,
  selectMembershipsGroupedByAssociation,
  selectActortypes,
  (ready, viewActor, actors, associations, actortypes) => {
    if (!viewActor || !ready) return null;
    const actortypeId = viewActor.getIn(['attributes', 'actortype_id']).toString();
    const viewActortype = actortypes.get(actortypeId);
    if (!viewActortype.getIn(['attributes', 'has_members'])) {
      // console.log('no members for actortype', actortypeId)
      return null;
    }
    return actortypes.filter(
      (type) => !type.getIn(['attributes', 'has_members'])
    ).map((type) => {
      const filtered = actors.filter(
        (actor) => qe(
          type.get('id'),
          actor.getIn(['attributes', 'actortype_id']),
        )
      );
      return entitiesSetAssociated(
        filtered,
        associations,
        viewActor.get('id'),
      );
    });
  }
);

export const selectAssociationsByActortype = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectViewEntity,
  selectActorsCategorised,
  selectMembershipsGroupedByMember,
  selectActortypes,
  (ready, viewActor, actors, joins, actortypes) => {
    if (!viewActor || !ready) return null;
    const actortypeId = viewActor.getIn(['attributes', 'actortype_id']).toString();
    const viewActortype = actortypes.get(actortypeId);
    if (viewActortype.getIn(['attributes', 'has_members'])) {
      // console.log('no memberships for actortype', actortypeId)
      return null;
    }
    return actortypes.filter(
      (type) => type.getIn(['attributes', 'has_members'])
    ).map((type) => {
      const filtered = actors.filter(
        (actor) => qe(
          type.get('id'),
          actor.getIn(['attributes', 'actortype_id']),
        )
      );
      return entitiesSetAssociated(
        filtered,
        joins,
        viewActor.get('id'),
      );
    });
  }
);
