import { createSelector } from 'reselect';
import { Map } from 'immutable';

import {
  selectEntities,
  selectActionsWhereQuery,
  selectWithoutQuery,
  selectAnyQuery,
  selectActorQuery,
  selectCategoryQuery,
  selectTargetedQuery,
  selectParentQuery,
  selectResourceQuery,
  selectActors,
  selectActions,
  selectActorTaxonomies,
  // selectActortypes,
  selectReady,
  selectActorCategoriesGroupedByActor,
  selectActionCategoriesGroupedByAction,
  selectActorActionsGroupedByAction, // active
  selectActorActionsGroupedByActionAttributes, // w/ all attributes not just id
  selectActorActionsMembersGroupedByAction,
  selectActionActorsGroupedByAction, // passive, as targets
  selectActionActorsMembersGroupedByAction, // passive, as targets
  selectCategories,
  selectActionResourcesGroupedByAction,
  selectResources,
  selectIncludeMembersForFiltering,
  selectActorActionsAssociationsGroupedByAction,
  selectActionActorsAssociationsGroupedByAction,
} from 'containers/App/selectors';

import {
  filterEntitiesByAttributes,
  filterEntitiesByConnection,
  filterEntitiesByMultipleConnections,
  filterEntitiesByCategories,
  // filterEntitiesByConnectedCategories,
  filterEntitiesWithoutAssociation,
  filterEntitiesWithAnyAssociation,
  entitiesSetCategoryIds,
  // filterTaxonomies,
  getTaxonomyCategories,
} from 'utils/entities';
import qe from 'utils/quasi-equals';

import { API } from 'themes/config';

import { DEPENDENCIES } from './constants';

export const selectConnections = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectActors,
  selectActorCategoriesGroupedByActor,
  selectActions,
  selectActionCategoriesGroupedByAction,
  selectResources,
  selectCategories,
  (ready, actors, actorCategoriesGrouped, actions, actionAssociationsGrouped, resources, categories) => {
    if (ready) {
      return new Map()
        .set(
          API.ACTORS,
          entitiesSetCategoryIds(
            actors,
            actorCategoriesGrouped,
            categories,
          ),
        ).set(
          API.RESOURCES,
          resources,
        ).set(
          // potential parents
          API.ACTIONS,
          entitiesSetCategoryIds(
            actions,
            actionAssociationsGrouped,
            categories,
          ),
        );
    }
    return new Map();
  }
);

export const selectConnectedTaxonomies = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectConnections,
  selectActorTaxonomies,
  selectCategories,
  (state) => selectEntities(state, API.ACTOR_CATEGORIES),
  // selectActortypes,
  // (state) => selectEntities(state, API.ACTORTYPE_TAXONOMIES),
  (
    ready,
    connections,
    taxonomies,
    categories,
    actorCategories,
    // actortypes,
    // actortypeTaxonomies,
  ) => {
    if (!ready) return Map();
    const relationship = {
      tags: 'tags_actors',
      path: API.ACTORS,
      key: 'actor_id',
      associations: actorCategories,
    };
    // const connectedTaxonomies = filterTaxonomies(
    //   taxonomies,
    //   relationship.tags,
    //   true,
    // ).filter(
    //   (taxonomy) => actortypeTaxonomies.some(
    //     (actortypet) => actionActortypes.some(
    //       (actortype) => qe(API.ACTORSconnections
    //         actortype.get('id'),
    //         actortypet.getIn(['attributes', 'actortype_id']),
    //       ),
    //     ) && qe(
    //       taxonomy.get('id'),
    //       actortypet.getIn(['attributes', 'taxonomy_id']),
    //     )
    //   )
    // );
    // if (!connections.get(relationship.path)) {
    //   return connectedTaxonomies;
    // }
    const groupedAssociations = relationship.associations.filter(
      (association) => association.getIn(['attributes', relationship.key])
        && connections.getIn([
          relationship.path,
          association.getIn(['attributes', relationship.key]).toString(),
        ])
    ).groupBy(
      (association) => association.getIn(['attributes', 'category_id'])
    );
    return taxonomies.map(
      (taxonomy) => taxonomy.set(
        'categories',
        getTaxonomyCategories(
          taxonomy,
          categories,
          relationship,
          groupedAssociations,
        )
      )
    );
  }
);

// nest category ids
const selectActionsWithCategories = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectActionsWhereQuery,
  selectActionCategoriesGroupedByAction,
  selectCategories,
  (ready, entities, associationsGrouped, categories) => {
    if (ready) {
      return entitiesSetCategoryIds(
        entities,
        associationsGrouped,
        categories,
      );
    }
    return entities;
  }
);

// nest connected actor ids
// nest connected actor ids by actortype
const selectActionsWithConnections = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectActionsWithCategories,
  selectConnections,
  selectActorActionsGroupedByAction,
  selectActorActionsGroupedByActionAttributes,
  selectActorActionsMembersGroupedByAction,
  selectActorActionsAssociationsGroupedByAction,
  selectActionActorsGroupedByAction,
  selectActionActorsMembersGroupedByAction,
  selectActionActorsAssociationsGroupedByAction,
  selectActionResourcesGroupedByAction,
  selectIncludeMembersForFiltering,
  (
    ready,
    entities,
    connections,
    actorConnectionsGrouped,
    actorConnectionsGroupedFull,
    actorMemberConnectionsGrouped,
    actorAssociationConnectionsGrouped,
    targetConnectionsGrouped,
    targetMemberConnectionsGrouped,
    targetAssociationConnectionsGrouped,
    resourceAssociationsGrouped,
    includeMembers,
  ) => {
    // console.log(actorAssociationConnectionsGrouped && actorAssociationConnectionsGrouped.toJS())
    if (ready && (connections.get(API.ACTORS) || connections.get(API.RESOURCES))) {
      return entities.map(
        (entity) => {
          // actors
          const entityActors = actorConnectionsGrouped.get(parseInt(entity.get('id'), 10));
          const entityActorsAttributes = actorConnectionsGroupedFull.get(parseInt(entity.get('id'), 10));
          const entityActorsByActortype = entityActors && entityActors.filter(
            (actorId) => connections.getIn([
              API.ACTORS,
              actorId.toString(),
            ])
          ).groupBy(
            (actorId) => connections.getIn([
              API.ACTORS,
              actorId.toString(),
              'attributes',
              'actortype_id',
            ])
          ).sortBy((val, key) => key);

          // actors as members
          const entityActorsMembers = actorMemberConnectionsGrouped.get(parseInt(entity.get('id'), 10));
          const entityActorsMembersByActortype = entityActorsMembers && entityActorsMembers.filter(
            (actorId) => connections.getIn([
              API.ACTORS,
              actorId.toString(),
            ])
          ).groupBy(
            (actorId) => connections.getIn([
              API.ACTORS,
              actorId.toString(),
              'attributes',
              'actortype_id',
            ])
          ).sortBy((val, key) => key);
          // actors as associations
          const entityActorsAssociations = includeMembers && actorAssociationConnectionsGrouped.get(parseInt(entity.get('id'), 10));
          const entityActorsAssociationsByActortype = includeMembers && entityActorsAssociations && entityActorsAssociations.filter(
            (actorId) => connections.getIn([
              API.ACTORS,
              actorId.toString(),
            ])
          ).groupBy(
            (actorId) => connections.getIn([
              API.ACTORS,
              actorId.toString(),
              'attributes',
              'actortype_id',
            ])
          ).sortBy((val, key) => key);

          // targets
          const entityTargets = targetConnectionsGrouped.get(parseInt(entity.get('id'), 10));
          // console.log('actorConnectionsGrouped', actorConnectionsGrouped && actorConnectionsGrouped.toJS())
          // console.log('targetConnectionsGrouped', targetConnectionsGrouped && targetConnectionsGrouped.toJS())
          const entityTargetsByActortype = entityTargets && entityTargets.filter(
            (actorId) => connections.getIn([
              API.ACTORS,
              actorId.toString(),
            ])
          ).groupBy(
            (actorId) => connections.getIn([
              API.ACTORS,
              actorId.toString(),
              'attributes',
              'actortype_id',
            ])
          ).sortBy((val, key) => key);

          // targets as members
          const entityTargetsMembers = targetMemberConnectionsGrouped.get(parseInt(entity.get('id'), 10));
          // console.log('actorConnectionsGrouped', actorConnectionsGrouped && actorConnectionsGrouped.toJS())
          // console.log('targetConnectionsGrouped', targetConnectionsGrouped && targetConnectionsGrouped.toJS())
          const entityTargetsMembersByActortype = entityTargetsMembers && entityTargetsMembers.filter(
            (actorId) => connections.getIn([
              'actors',
              actorId.toString(),
            ])
          ).groupBy(
            (actorId) => connections.getIn([
              API.ACTORS,
              actorId.toString(),
              'attributes',
              'actortype_id',
            ])
          ).sortBy((val, key) => key);
          // resources
          const entityResources = resourceAssociationsGrouped.get(parseInt(entity.get('id'), 10));
          const entityResourcesByResourcetype = entityResources && entityResources.filter(
            (resourceId) => connections.getIn([
              API.RESOURCES,
              resourceId.toString(),
            ])
          ).groupBy(
            (resourceId) => connections.getIn([
              API.RESOURCES,
              resourceId.toString(),
              'attributes',
              'resourcetype_id',
            ])
          ).sortBy((val, key) => key);
          // targets as associations
          const entityTargetsAssociations = includeMembers && targetAssociationConnectionsGrouped.get(parseInt(entity.get('id'), 10));
          const entityTargetsAssociationsByActortype = includeMembers && entityTargetsAssociations && entityTargetsAssociations.filter(
            (actorId) => connections.getIn([
              API.ACTORS,
              actorId.toString(),
            ])
          ).groupBy(
            (actorId) => connections.getIn([
              API.ACTORS,
              actorId.toString(),
              'attributes',
              'actortype_id',
            ])
          ).sortBy((val, key) => key);

          const entityChildren = connections.get(API.ACTIONS).filter(
            (action) => qe(action.getIn(['attributes', 'parent_id']), entity.get('id'))
          ).map(
            (action) => parseInt(action.get('id'), 10)
          );
          // the activity
          return entity
            // directly connected actors
            .set('actors', entityActors)
            .set('actorsAttributes', entityActorsAttributes)
            .set('actorsByType', entityActorsByActortype)
            // indirectly connected actors (member of a directly connected group)
            .set('actorsMembers', entityActorsMembers)
            .set('actorsMembersByType', entityActorsMembersByActortype)
            // indirectly connected actors (group, region, class a directly connected actor belongs to)
            .set('actorsAssociations', entityActorsAssociations)
            .set('actorsAssociationsByType', entityActorsAssociationsByActortype)
            // directly connected targets
            .set('targets', entityTargets)
            .set('targetsByType', entityTargetsByActortype)
            // indirectly connected targets (via group, region, class)
            .set('targetsMembers', entityTargetsMembers)
            .set('targetsMembersByType', entityTargetsMembersByActortype)
            // indirectly connected targets (group, region, class a directly connected actor belongs to)
            .set('targetsAssociations', entityTargetsAssociations)
            .set('targetsAssociationsByType', entityTargetsAssociationsByActortype)
            // directly connected resources
            .set('resources', entityResources)
            .set('resourcesByType', entityResourcesByResourcetype)
            .set('children', entityChildren);
        }
      );
    }
    return entities;
  }
);

const selectActionsWithout = createSelector(
  selectActionsWithConnections,
  selectCategories,
  selectWithoutQuery,
  selectIncludeMembersForFiltering,
  (entities, categories, query, includeMembers) => query
    ? filterEntitiesWithoutAssociation(entities, categories, query, includeMembers)
    : entities
);
const selectActionsAny = createSelector(
  selectActionsWithout,
  selectCategories,
  selectAnyQuery,
  selectIncludeMembersForFiltering,
  (entities, categories, query, includeMembers) => query
    ? filterEntitiesWithAnyAssociation(entities, categories, query, includeMembers)
    : entities
);
const selectActionsByActors = createSelector(
  selectActionsAny,
  selectActorQuery,
  selectIncludeMembersForFiltering,
  (entities, query, includeMembers) => {
    if (query) {
      if (includeMembers) {
        return filterEntitiesByMultipleConnections(entities, query, ['actors', 'actorsAssociations']);
      }
      return filterEntitiesByConnection(entities, query, 'actors');
    }
    return entities;
  }
);
const selectActionsByTargets = createSelector(
  selectActionsByActors,
  selectTargetedQuery,
  selectIncludeMembersForFiltering,
  (entities, query, includeMembers) => {
    if (query) {
      if (includeMembers) {
        return filterEntitiesByMultipleConnections(entities, query, ['targets', 'targetsAssociations']);
      }
      return filterEntitiesByConnection(entities, query, 'targets');
    }
    return entities;
  }
);
const selectActionsByResources = createSelector(
  selectActionsByTargets,
  selectResourceQuery,
  (entities, query) => query
    ? filterEntitiesByConnection(entities, query, 'resources')
    : entities
);
const selectActionsByParent = createSelector(
  selectActionsByResources,
  selectParentQuery,
  (entities, query) => {
    if (!query) return entities;
    const [, value] = query.split(':');
    return (value)
      ? filterEntitiesByAttributes(entities, { parent_id: parseInt(value, 10) })
      : entities;
  }
);
const selectActionsByCategories = createSelector(
  selectActionsByParent,
  selectCategoryQuery,
  (entities, query) => query
    ? filterEntitiesByCategories(entities, query)
    : entities
);
// const selectActionsByConnectedCategories = createSelector(
//   selectActionsByCategories,
//   selectConnections,
//   selectConnectedCategoryQuery,
//   (entities, connections, query) => query
//     ? filterEntitiesByConnectedCategories(entities, connections, query)
//     : entities
// );

// kicks off series of cascading selectors
// 1. selectEntitiesWhere filters by attribute
// 2. selectEntitiesSearchQuery filters by keyword
// 4. selectActionsWithout will filter by absence of taxonomy or connection
// 5. selectActionsByConnections will filter by specific connection
// 6. selectActionsByCategories will filter by specific categories
// 7. selectActionsByCOnnectedCategories will filter by specific categories connected via connection
export const selectViewActions = createSelector(
  selectActionsByCategories,
  (entities) => entities && entities.toList()
);
