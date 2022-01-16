import { Map } from 'immutable';

import {
  TEXT_TRUNCATE,
  ACTION_FIELDS,
  ACTOR_FIELDS,
  RESOURCE_FIELDS,
} from 'themes/config';
import { find, reduce, every } from 'lodash/collection';

import { cleanupSearchTarget, regExMultipleWords, truncateText } from 'utils/string';
import asList from 'utils/as-list';
import isNumber from 'utils/is-number';
import appMessage from 'utils/app-message';
import { qe } from 'utils/quasi-equals';

// check if entity has nested connection by id
export const testEntityEntityAssociation = (
  entity,
  path,
  associatedId,
) => entity.get(path)
  && entity.get(path).includes(parseInt(associatedId, 10));

// check if entity has nested category by id
export const testEntityCategoryAssociation = (
  entity,
  categoryId,
) => testEntityEntityAssociation(entity, 'categories', categoryId);

export const testEntityParentCategoryAssociation = (
  entity,
  categories,
  categoryId,
) => testEntityEntityAssociation(entity, 'categories', categoryId);

// check if entity has any category by taxonomy id
export const testEntityTaxonomyAssociation = (
  entity,
  categories,
  taxonomyId,
) => entity.get('categories')
  && entity.get('categories').some(
    (catId) => categories.size > 0
      && categories.get(catId.toString())
      && qe(
        taxonomyId,
        categories.getIn([
          catId.toString(),
          'attributes', 'taxonomy_id',
        ])
      )
  );

// check if entity has any nested connection by type
export const testEntityAssociation = (entity, associatedPath) => {
  // check for actortype
  if (associatedPath.indexOf('_') > -1) {
    const [path, typeId] = associatedPath.split('_');
    const associations = entity.getIn([`${path}ByType`, parseInt(typeId, 10)]);
    return associations && associations.size > 0;
  }
  return entity.get(associatedPath) && entity.get(associatedPath).size > 0;
};

// prep searchtarget, incl id
export const prepareEntitySearchTarget = (entity, fields, queryLength) => reduce(
  fields,
  (target, field) => queryLength > 1 || field === 'reference '
    ? `${target} ${cleanupSearchTarget(entity.getIn(['attributes', field]))}`
    : target,
  entity.get('id')
);

export const getConnectedCategories = (
  entityConnectedIds,
  taxonomyCategories,
  path,
) => taxonomyCategories.filter(
  (category) => entityConnectedIds.some(
    (connectionId) => testEntityEntityAssociation(
      category,
      path,
      connectionId,
    )
  )
);


// filter entities by absence of association either by taxonomy id or connection type
// assumes prior nesting of relationships
export const filterEntitiesWithoutAssociation = (
  entities,
  categories,
  query,
) => entities && entities.filter(
  (entity) => asList(query).every(
    (pathOrTax) => {
      const isTax = isNumber(pathOrTax);
      if (isTax) {
        return !testEntityTaxonomyAssociation(entity, categories, parseInt(pathOrTax, 10));
      }
      if (pathOrTax.indexOf('|') > -1) {
        const [group, path] = pathOrTax.split('|');
        return !testEntityAssociation(entity, path, group);
      }
      return !testEntityAssociation(entity, pathOrTax);
    }
  )
);

// filter entities by association with one or more categories
// assumes prior nesting of relationships
export const filterEntitiesByCategories = (
  entities,
  query,
) => entities
  && entities.filter(
    (entity) => asList(query).every(
      (categoryId) => testEntityCategoryAssociation(
        entity,
        parseInt(categoryId, 10),
      )
    )
  );

// filter entities by association with one or more categories
// assumes prior nesting of relationships
export const filterEntitiesByConnectedCategories = (
  entities,
  connections,
  query,
) => entities && entities.filter(
  // consider replacing with .every()
  (entity) => asList(query).every(
    (queryArg) => {
      const pathValue = queryArg.split(':');
      const path = pathValue[0];
      const connectionsForPath = connections.get(path);
      return !connectionsForPath || connectionsForPath.some(
        (connection) => testEntityEntityAssociation(
          entity,
          path,
          connection.get('id'),
        ) && testEntityCategoryAssociation(
          connection,
          pathValue[1],
        )
      );
    },
  )
);

// filter entities by by association with one or more entities of specific connection type
// assumes prior nesting of relationships
export const filterEntitiesByConnection = (
  entities,
  query,
) => entities && entities.filter(
  // consider replacing with .every()
  (entity) => asList(query).every(
    (queryArg) => {
      const pathValue = queryArg.split(':');
      const path = pathValue[0].split('_')[0];
      return entity.get(path)
        && testEntityEntityAssociation(entity, path, pathValue[1]);
    },
  )
);

// query is object not string!
export const filterEntitiesByAttributes = (entities, query) => entities
  && entities.filter(
    (entity) => every(
      query,
      (value, attribute) => attribute === 'id'
        ? qe(entity.get('id'), value)
        : qe(entity.getIn(['attributes', attribute]), value),
    )
  );

export const filterEntitiesByKeywords = (
  entities,
  query,
  searchAttributes,
) => {
  try {
    const regex = new RegExp(regExMultipleWords(query), 'i');
    return entities && entities.filter(
      (entity) => regex.test(
        prepareEntitySearchTarget(
          entity,
          searchAttributes,
          query.length,
        )
      )
    );
  } catch (e) {
    return entities;
  }
};

export const entitiesSetCategoryIds = (
  entities,
  associationsGrouped,
  categories
) => entities && entities.map(
  (entity) => entity.set(
    'categories',
    getEntityCategories(
      parseInt(entity.get('id'), 10),
      associationsGrouped,
      categories,
    )
  )
);


const entitySetAssociated = (
  entity, // associated entity
  associations,
  // associationId,
) => {
  if (associations) {
    const entityAssociationKey = associations.findKey(
      (association) => qe(association, entity.get('id'))
    );
    if (entityAssociationKey) {
      return entity.set('associated', entityAssociationKey);
    }
  }
  return entity.set('associated', false);
};
export const entitiesSetAssociated = (
  entities,
  associationsGrouped,
  associationId,
) => {
  const associations = associationsGrouped.get(
    parseInt(associationId, 10)
  );
  return entities && entities.map(
    (entity) => entitySetAssociated(
      entity,
      associations,
    ),
  );
};

const entitySetAssociatedCategory = (
  entityCategorised,
  categoryId,
) => {
  if (entityCategorised.get('categories')) {
    const associationKey = entityCategorised.get('categories').findKey(
      (id) => qe(id, categoryId)
    );
    return entityCategorised.set('associated', associationKey);
  }
  return entityCategorised.set('associated', false);
};
export const entitiesSetAssociatedCategory = (
  entitiesCategorised,
  categoryId,
) => entitiesCategorised && entitiesCategorised.map(
  (entity) => entitySetAssociatedCategory(entity, categoryId)
);

export const entitiesSetSingle = (
  entities,
  related,
  key,
  relatedKey,
) => entities && entities.map(
  (entity) => entitySetSingle(entity, related, key, relatedKey)
);

export const entitySetSingle = (
  entity,
  related,
  key,
  relatedKey,
) => entity
  && entity.set(
    key,
    related.find(
      (r) => qe(entity.getIn(['attributes', relatedKey]), r.get('id'))
    )
  );

export const entitySetUser = (entity, users) => entity
  && entitySetSingle(entity, users, 'user', 'updated_by_id');

export const entitySetSingles = (entity, singles) => entity
  && singles.reduce(
    (memo, { related, key, relatedKey }) => entitySetSingle(
      memo,
      related,
      key,
      relatedKey,
    ),
    entity,
  );

// taxonomies or parent taxonomies
export const filterTaxonomiesTags = (
  taxonomies,
  tagsKey,
  includeParents = true,
) => taxonomies && taxonomies.filter(
  (tax, key, list) => tax.getIn(['attributes', tagsKey])
    && (
      includeParents
      // only non-parents
      || !list.some(
        (other) => other.getIn(['attributes', tagsKey])
          && qe(tax.get('id'), other.getIn(['attributes', 'parent_id']))
      )
    )
);
export const filterTaxonomies = (
  taxonomies,
  includeParents = true,
) => taxonomies && taxonomies.filter(
  (tax, key, list) => includeParents
    // only non-parents
    || !list.some(
      (otherTax) => qe(tax.get('id'), otherTax.getIn(['attributes', 'parent_id']))
    )
);

export const prepareTaxonomiesIsAssociated = (
  taxonomies,
  categories,
  associations,
  tagsKey,
  associationKey,
  associationId,
  includeParents = true,
) => {
  const filteredAssociations = associations && associations.filter(
    (association) => qe(
      association.getIn(['attributes', associationKey]),
      associationId
    )
  );
  const filteredTaxonomies = taxonomies && filterTaxonomies(
    taxonomies,
    includeParents,
  ).map(
    (tax) => tax.set(
      'tags',
      tax.getIn(['attributes', tagsKey])
      // set categories
    )
  );
  return filteredTaxonomies.map(
    (tax) => {
      const childTax = includeParents
        && taxonomies.find((potential) => qe(
          potential.getIn(['attributes', 'parent_id']),
          tax.get('id')
        ));
      return tax.set(
        'categories',
        categories.filter(
          (cat) => qe(
            cat.getIn(['attributes', 'taxonomy_id']),
            tax.get('id')
          )
        ).filter(
          (cat) => {
            const hasAssociations = filteredAssociations && filteredAssociations.some(
              (association) => qe(
                association.getIn(['attributes', 'category_id']),
                cat.get('id')
              )
            );
            if (hasAssociations) {
              return true;
            }
            if (!includeParents) {
              return false;
            }
            return childTax && categories.filter(
              (childCat) => qe(
                childCat.getIn(['attributes', 'taxonomy_id']),
                childTax.get('id'),
              )
            ).filter(
              (childCat) => qe(
                childCat.getIn(['attributes', 'parent_id']),
                cat.get('id'),
              )
            ).some(
              (child) => filteredAssociations && filteredAssociations.find(
                (association) => qe(
                  association.getIn(['attributes', 'category_id']),
                  child.get('id')
                )
              )
            ); // some
          }
        ) // filter
      ); // set
    },
  ); // map/return
};

const getTaxCategories = (categories, taxonomy, tagsKey) => categories.filter(
  (cat) => qe(
    cat.getIn(['attributes', 'taxonomy_id']),
    taxonomy.get('id')
  ) && (
    !cat.getIn(['attributes', 'user_only']) || tagsKey === 'tags_users'
  )
);

export const prepareTaxonomiesAssociated = (
  taxonomies,
  categories,
  associationsGrouped,
  tagsKey,
  associationId,
  includeParents = true,
) => taxonomies
  && filterTaxonomies(taxonomies, includeParents).map(
    (tax) => {
      const taxCategories = getTaxCategories(categories, tax, tagsKey);
      const catsAssociated = entitiesSetAssociated(
        taxCategories,
        associationsGrouped,
        associationId
      );
      return tax.set(
        'tags',
        tax.getIn(['attributes', tagsKey]),
      ).set('categories', catsAssociated);
    }
  );

// TODO deal with conflicts
export const prepareTaxonomiesMultipleTags = (
  taxonomies,
  categories,
  tagsKeys,
  includeParents = true,
) => reduce(
  tagsKeys,
  (memo, tagsKey) => memo.merge(
    prepareTaxonomiesTags(
      taxonomies,
      categories,
      tagsKey,
      includeParents,
    )
  ),
  Map(),
);
export const prepareTaxonomiesTags = (
  taxonomies,
  categories,
  tagsKey,
  includeParents = true,
) => taxonomies
  && filterTaxonomiesTags(taxonomies, tagsKey, includeParents).map(
    (tax) => {
      const taxCategories = getTaxCategories(categories, tax, tagsKey);
      return tax.set(
        'tags',
        tax.getIn(['attributes', tagsKey])
      ).set('categories', taxCategories);
    }
  );
export const prepareTaxonomies = (
  taxonomies,
  categories,
  includeParents = true,
) => taxonomies
  && filterTaxonomies(taxonomies, includeParents).map(
    (tax) => tax.set(
      'categories',
      getTaxCategories(categories, tax),
    )
  );

export const prepareCategory = (
  category,
  users,
  taxonomies,
) => {
  if (category) {
    const catWithTaxonomy = category.set(
      'taxonomy',
      taxonomies.find(
        (tax) => qe(
          category.getIn(['attributes', 'taxonomy_id']),
          tax.get('id')
        ),
      ),
    );
    return entitySetUser(
      catWithTaxonomy,
      users,
    );
  }
  return null;
};

export const usersByRole = (
  users,
  userRoles,
  roleId,
) => users && users.filter(
  (user) => {
    const roles = userRoles.filter(
      (association) => qe(
        association.getIn(['attributes', 'role_id']),
        roleId,
      ) && qe(
        association.getIn(['attributes', 'user_id']),
        user.get('id')
      )
    );
    return roles && roles.size > 0;
  }
);

export const getEntityTitle = (entity, labels, contextIntl) => {
  if (labels && contextIntl) {
    const label = find(labels, { value: parseInt(entity.get('id'), 10) });
    if (label && label.message) {
      return appMessage(contextIntl, label.message);
    }
  }
  return entity.getIn(['attributes', 'title'])
    || entity.getIn(['attributes', 'name']);
};
export const getEntityTitleTruncated = (
  entity,
  labels,
  contextIntl,
) => truncateText(
  getEntityTitle(entity, labels, contextIntl),
  TEXT_TRUNCATE.META_TITLE,
);

export const getEntityReference = (entity, defaultToId = false) => defaultToId
  ? (
    entity.getIn(['attributes', 'reference'])
    || entity.getIn(['attributes', 'code'])
    || entity.getIn(['attributes', 'number'])
    || entity.get('id')
  )
  : (entity.getIn(['attributes', 'reference']) || null);

export const getCategoryShortTitle = (category) => truncateText(
  category.getIn(['attributes', 'short_title'])
  && category.getIn(['attributes', 'short_title']).trim().length > 0
    ? category.getIn(['attributes', 'short_title'])
    : (
      category.getIn(['attributes', 'title'])
      || category.getIn(['attributes', 'name'])
    ),
  TEXT_TRUNCATE.ENTITY_TAG
);

export const getCategoryTitle = (cat) => cat.getIn(['attributes', 'code'])
  ? `${cat.getIn(['attributes', 'code'])}. ${cat.getIn(['attributes', 'title']) || cat.getIn(['attributes', 'name'])}`
  : (cat.getIn(['attributes', 'title']) || cat.getIn(['attributes', 'name']));

export const getEntityParentId = (cat) => cat.getIn(['attributes', 'parent_id'])
  && cat.getIn(['attributes', 'parent_id']).toString();

export const getEntityCategories = (
  entityId,
  associationsGrouped,
  categories,
) => {
  if (!associationsGrouped) return Map();
  // directly associated categories
  const categoryIds = associationsGrouped.get(
    parseInt(entityId, 10)
  );

  // include parent categories of associated categories when categories present
  if (categories && categoryIds) {
    const parentCategoryIds = categoryIds.reduce(
      (memo, id, key) => {
        // if any of categories children
        const parentId = categories.getIn([
          id.toString(),
          'attributes',
          'parent_id',
        ]);
        return parentId
          ? memo.set(`${key}-${id}`, parseInt(parentId, 10))
          : memo;
      },
      Map(),
    );
    return categoryIds.merge(parentCategoryIds);
  }
  return categoryIds;
};

export const getTaxonomyCategories = (
  taxonomy,
  categories,
  relationship,
  groupedAssociations, // grouped by category
) => {
  if (!groupedAssociations) return null;
  const taxCategories = categories.filter(
    (category) => qe(
      category.getIn(['attributes', 'taxonomy_id']),
      taxonomy.get('id')
    )
  );
  return taxCategories.map(
    (category) => {
      let categoryAssocations = groupedAssociations.get(parseInt(category.get('id'), 10));

      // figure out child categories if not directly tagging connection
      const childCategories = categories.filter(
        (item) => qe(
          category.get('id'),
          item.getIn(['attributes', 'parent_id']),
        ),
      );
      if (childCategories && childCategories.size > 0) {
        categoryAssocations = childCategories.reduce(
          (memo, child) => {
            if (!groupedAssociations.get(parseInt(child.get('id'), 10))) {
              return memo;
            }
            return memo.merge(
              groupedAssociations.get(parseInt(child.get('id'), 10))
            );
          },
          categoryAssocations || Map(),
        );
      }
      return categoryAssocations
        ? category.set(
          relationship.path,
          // consider reduce for combined filter and map
          categoryAssocations.map(
            (association) => association.getIn(['attributes', relationship.key])
          )
        )
        : category;
    }
  );
};


const checkAttribute = (typeId, att, attributes) => {
  if (typeId && attributes && attributes[att]) {
    if (attributes[att].optional) {
      return attributes[att].optional.indexOf(typeId.toString()) > -1;
    }
    if (attributes[att].required) {
      return attributes[att].required.indexOf(typeId.toString()) > -1;
    }
  }
  return false;
};

const checkRequired = (typeId, att, attributes) => {
  if (typeId && attributes && attributes[att] && attributes[att].required) {
    return attributes[att].required.indexOf(typeId.toString()) > -1;
  }
  return false;
};
export const checkActionAttribute = (typeId, att) => ACTION_FIELDS
  && ACTION_FIELDS.ATTRIBUTES
  && checkAttribute(
    typeId,
    att,
    ACTION_FIELDS.ATTRIBUTES,
  );

export const checkActionRequired = (typeId, att) => ACTION_FIELDS
  && ACTION_FIELDS.ATTRIBUTES
  && checkRequired(
    typeId,
    att,
    ACTION_FIELDS.ATTRIBUTES,
  );

export const checkActorAttribute = (typeId, att) => ACTOR_FIELDS
  && ACTOR_FIELDS.ATTRIBUTES
  && checkAttribute(
    typeId,
    att,
    ACTOR_FIELDS.ATTRIBUTES,
  );

export const checkActorRequired = (typeId, att) => ACTOR_FIELDS
  && ACTOR_FIELDS.ATTRIBUTES
  && checkRequired(
    typeId,
    att,
    ACTOR_FIELDS.ATTRIBUTES,
  );
export const checkResourceAttribute = (typeId, att) => RESOURCE_FIELDS
  && RESOURCE_FIELDS.ATTRIBUTES
  && checkAttribute(
    typeId,
    att,
    RESOURCE_FIELDS.ATTRIBUTES,
  );

export const checkResourceRequired = (typeId, att) => RESOURCE_FIELDS
  && RESOURCE_FIELDS.ATTRIBUTES
  && checkRequired(
    typeId,
    att,
    RESOURCE_FIELDS.ATTRIBUTES,
  );
