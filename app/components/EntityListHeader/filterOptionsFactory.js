import { List } from 'immutable';
import { find, forEach } from 'lodash/collection';
import { upperFirst } from 'lodash/string';
import { lowerCase, startsWith } from 'utils/string';
import isNumber from 'utils/is-number';
import asArray from 'utils/as-array';
import asList from 'utils/as-list';

import appMessages from 'containers/App/messages';

import {
  testEntityCategoryAssociation,
  getEntityTitle,
  getEntityReference,
  getEntityParentId,
} from 'utils/entities';

import { makeTagFilterGroups } from 'utils/forms';

import {
  optionChecked,
  attributeOptionChecked,
} from './utils';

export const makeActiveFilterOptions = ({
  entities,
  config,
  locationQuery,
  taxonomies,
  connections,
  connectedTaxonomies,
  activeFilterOption,
  contextIntl,
  messages,
  typeId,
}) => {
  // create filterOptions
  switch (activeFilterOption.group) {
    case 'taxonomies':
      return makeTaxonomyFilterOptions(
        entities,
        config.taxonomies,
        taxonomies,
        activeFilterOption.optionId,
        locationQuery,
        messages,
        contextIntl,
      );
    case 'connections':
      return makeConnectionFilterOptions(
        entities,
        config.connections,
        connections,
        connectedTaxonomies,
        activeFilterOption.optionId,
        locationQuery,
        messages,
        contextIntl,
        activeFilterOption.group,
      );
    case 'targets':
      return makeConnectionFilterOptions(
        entities,
        config.targets,
        connections,
        connectedTaxonomies,
        activeFilterOption.optionId,
        locationQuery,
        messages,
        contextIntl,
        activeFilterOption.group,
      );
    case 'members':
      return makeConnectionFilterOptions(
        entities,
        config.members,
        connections,
        connectedTaxonomies,
        activeFilterOption.optionId,
        locationQuery,
        messages,
        contextIntl,
        activeFilterOption.group,
      );
    case 'associations':
      return makeConnectionFilterOptions(
        entities,
        config.associations,
        connections,
        connectedTaxonomies,
        activeFilterOption.optionId,
        locationQuery,
        messages,
        contextIntl,
        activeFilterOption.group,
      );
    case 'parents':
      return makeSimpleConnectionFilterOptions(
        entities,
        config.parents,
        connections,
        activeFilterOption.optionId,
        locationQuery,
        messages,
        contextIntl,
        activeFilterOption.group,
        typeId,
      );
    case 'resources':
      return makeConnectionFilterOptions(
        entities,
        config.resources,
        connections,
        connectedTaxonomies,
        activeFilterOption.optionId,
        locationQuery,
        messages,
        contextIntl,
        activeFilterOption.group,
      );
    case 'attributes':
      return makeAttributeFilterOptions(
        entities,
        config.attributes,
        activeFilterOption.optionId,
        locationQuery.get('where'),
        messages,
      );
    default:
      return null;
  }
};

export const makeAttributeFilterOptions = (entities, config, activeOptionId, locationQueryValue, messages) => {
  const filterOptions = {
    groupId: 'attributes',
    options: {},
    multiple: true,
    required: false,
    search: true,
    selectAll: false,
  };
  // the attribute option
  const option = find(config.options, (o) => o.attribute === activeOptionId);
  if (option) {
    filterOptions.messagePrefix = messages.titlePrefix;
    filterOptions.message = option.message;
    filterOptions.search = option.search;
    if (entities.size === 0) {
      if (locationQueryValue && option.options) {
        asList(locationQueryValue).forEach((queryValue) => {
          if (attributeOptionChecked(queryValue, option.attribute)) {
            const locationQueryValueAttribute = queryValue.split(':');
            if (locationQueryValueAttribute.length > 1) {
              const locationAttribute = locationQueryValueAttribute[1];
              forEach(option.options, (attributeOption) => {
                if (attributeOption.value.toString() === locationAttribute) {
                  filterOptions.options[attributeOption.value] = {
                    label: attributeOption.label ? attributeOption.label : upperFirst(attributeOption.value),
                    message: attributeOption.message,
                    showCount: true,
                    value: `${option.attribute}:${attributeOption.value}`,
                    count: 0,
                    query: 'where',
                    checked: true,
                  };
                }
              });
            }
          }
        });
      }
    } else {
      entities.forEach((entity) => {
        if (typeof entity.getIn(['attributes', option.attribute]) !== 'undefined'
        && entity.getIn(['attributes', option.attribute]) !== null) {
          const value = entity.getIn(['attributes', option.attribute]).toString();
          const queryValue = `${option.attribute}:${value}`;
          // add connected entities if not present otherwise increase count
          if (filterOptions.options[value]) {
            filterOptions.options[value].count += 1;
          } else if (option.reference && !!entity.get(option.reference.key)) {
            filterOptions.options[value] = {
              label: entity.getIn([option.reference.key, 'attributes', option.reference.label]),
              showCount: true,
              value: queryValue,
              count: 1,
              query: 'where',
              checked: optionChecked(locationQueryValue, queryValue),
            };
          } else if (option.options) {
            const attributeOption = find(option.options, (o) => o.value.toString() === value);
            const label = attributeOption ? attributeOption.label : upperFirst(value);
            filterOptions.options[value] = {
              label,
              message: attributeOption.message,
              showCount: true,
              value: queryValue,
              count: 1,
              query: 'where',
              checked: optionChecked(locationQueryValue, queryValue),
            };
          }
        } else if (option.reference && option.reference.without) {
          if (filterOptions.options.without) {
            // no connection present
            // add without option
            filterOptions.options.without.count += 1;
          } else {
            const queryValue = `${option.attribute}:null`;
            filterOptions.options.without = {
              messagePrefix: messages.without,
              message: option.message,
              showCount: true,
              labelBold: true,
              value: queryValue,
              count: 1,
              query: 'where',
              checked: optionChecked(locationQueryValue, queryValue),
            };
          }
        }
      }); // for each entities
    } // if (entities.length === 0) {
  } // if option
  return filterOptions;
};


const getTaxTitle = (id, contextIntl) => contextIntl.formatMessage(appMessages.entities.taxonomies[id].single);

export const makeTaxonomyFilterOptions = (
  entities,
  config,
  taxonomies,
  activeTaxId,
  locationQuery,
  messages,
  contextIntl,
) => {
  const filterOptions = {
    groupId: 'taxonomies',
    search: config.search,
    options: {},
    multiple: true,
    required: false,
    selectAll: false,
    groups: null,
  };
  // get the active taxonomy
  const taxonomy = taxonomies.get(activeTaxId);
  if (taxonomy && taxonomy.get('categories')) {
    const parentId = getEntityParentId(taxonomy);
    const parent = parentId && taxonomies.get(parentId);
    if (parent) {
      filterOptions.groups = parent.get('categories').map((cat) => getEntityTitle(cat));
    }
    filterOptions.title = `${messages.titlePrefix} ${lowerCase(getTaxTitle(parseInt(taxonomy.get('id'), 10), contextIntl))}`;
    if (entities.size === 0) {
      if (locationQuery.get(config.query)) {
        const locationQueryValue = locationQuery.get(config.query);
        forEach(asArray(locationQueryValue), (queryValue) => {
          const value = parseInt(queryValue, 10);
          const category = taxonomy.getIn(['categories', value]);
          if (category) {
            filterOptions.options[value] = {
              reference: getEntityReference(category, false),
              label: getEntityTitle(category),
              group: parent && getEntityParentId(category),
              showCount: true,
              value,
              count: 0,
              query: config.query,
              checked: true,
              draft: category && category.getIn(['attributes', 'draft']),
            };
          }
        });
      }
      // check for checked without options
      if (locationQuery.get('without')) {
        const locationQueryValue = locationQuery.get('without');
        asList(locationQueryValue).forEach((queryValue) => {
          // numeric means taxonomy
          if (isNumber(queryValue) && taxonomy.get('id') === queryValue) {
            const value = parseInt(queryValue, 10);
            filterOptions.options[value] = {
              label: `${messages.without} ${lowerCase(getTaxTitle(parseInt(taxonomy.get('id'), 10), contextIntl))}`,
              showCount: true,
              labelBold: true,
              value,
              count: 0,
              query: 'without',
              checked: true,
            };
          }
        });
      }
    } else {
      entities.forEach((entity) => {
        const taxCategoryIds = [];
        // if entity has categories
        if (entity.get('categories')) {
          // add categories from entities if not present otherwise increase count
          taxonomy.get('categories').forEach((category, catId) => {
            // if entity has category of active taxonomy
            if (testEntityCategoryAssociation(entity, catId)) {
              taxCategoryIds.push(catId);
              // if category already added
              if (filterOptions.options[catId]) {
                filterOptions.options[catId].count += 1;
              } else {
                filterOptions.options[catId] = {
                  reference: getEntityReference(category, false),
                  label: getEntityTitle(category),
                  group: parent && getEntityParentId(category),
                  showCount: true,
                  value: catId,
                  count: 1,
                  query: config.query,
                  checked: optionChecked(locationQuery.get(config.query), catId),
                  draft: category && category.getIn(['attributes', 'draft']),
                };
              }
            }
          });
        }
        if (taxCategoryIds.length === 0) {
          if (filterOptions.options.without) {
            filterOptions.options.without.count += 1;
          } else {
            filterOptions.options.without = {
              label: `${messages.without} ${lowerCase(getTaxTitle(parseInt(taxonomy.get('id'), 10), contextIntl))}`,
              showCount: true,
              labelBold: true,
              value: taxonomy.get('id'),
              count: 1,
              query: 'without',
              checked: optionChecked(locationQuery.get('without'), taxonomy.get('id')),
            };
          }
        }
      }); // for each entities
    }
  }
  return filterOptions;
};

//
//
//
export const makeConnectionFilterOptions = (
  entities,
  config,
  connections,
  connectedTaxonomies,
  activeOptionId,
  locationQuery,
  messages,
  contextIntl,
  group,
) => {
  const filterOptions = {
    groupId: group || 'connections',
    options: {},
    multiple: true,
    required: false,
    search: true,
    advanced: true,
    selectAll: false,
  };

  // get the active option
  const option = find(
    config.options,
    (o) => o.groupByType
      ? startsWith(activeOptionId, o.entityType)
      : o.entityType === activeOptionId,
  );
  // if option active
  if (option) {
    const typeid = option.groupByType
      && activeOptionId.indexOf('_') > -1
      && parseInt(activeOptionId.split('_')[1], 10);
    // the option path
    const path = activeOptionId;
    filterOptions.messagePrefix = messages.titlePrefix;
    filterOptions.message = (typeid && option.message && option.message.indexOf('{typeid}') > -1)
      ? option.message.replace('{typeid}', typeid)
      : option.message;
    filterOptions.search = option.search;
    const { query } = config;
    const connectionPath = option.connectionPath || option.entityType;
    let locationQueryValue = locationQuery.get(query);
    // if no entities found show any active options
    if (entities.size === 0) {
      if (locationQueryValue) {
        asList(locationQueryValue).forEach((queryValue) => {
          const locationQueryValueConnection = queryValue.split(':');
          if (locationQueryValueConnection.length > 1) {
            if (path === locationQueryValueConnection[0]) {
              const value = locationQueryValueConnection[1];
              const connection = connections.get(connectionPath) && connections.getIn([connectionPath, value]);
              filterOptions.options[value] = {
                reference: connection ? getEntityReference(connection) : '',
                label: connection ? getEntityTitle(connection, option.labels, contextIntl) : upperFirst(value),
                showCount: true,
                value: `${path}:${value}`,
                count: 0,
                query,
                checked: true,
                tags: connection ? connection.get('categories') : null,
                draft: connection && connection.getIn(['attributes', 'draft']),
              };
            }
          }
        });
      }
      // also check for active without options
      if (locationQuery.get('without')) {
        locationQueryValue = locationQuery.get('without');
        asList(locationQueryValue).forEach((queryValue) => {
          if (path === queryValue) {
            filterOptions.options[queryValue] = {
              messagePrefix: messages.without,
              label: option.label,
              message: option.message,
              showCount: true,
              labelBold: true,
              value: queryValue,
              count: 0,
              query: 'without',
              checked: true,
            };
          }
        });
      }
    } else {
      entities.forEach((entity) => {
        let optionConnections = List();
        const entityConnections = option.groupByType
          ? entity.getIn([`${option.entityType}ByType`, parseInt(typeid, 10)])
          : entity.get(option.entityType);
        // if entity has connected entities
        if (entityConnections) {
          // add connected entities if not present otherwise increase count
          entityConnections.forEach((connectedId) => {
            const connection = connections.getIn([connectionPath, connectedId.toString()]);
            // if not taxonomy already considered
            if (connection) {
              optionConnections = optionConnections.push(connection);
              // if category already added
              if (filterOptions.options[connectedId]) {
                filterOptions.options[connectedId].count += 1;
              } else {
                const value = `${path}:${connectedId}`;
                const reference = getEntityReference(connection);
                const label = getEntityTitle(connection, option.labels, contextIntl);
                filterOptions.options[connectedId] = {
                  label,
                  reference,
                  showCount: true,
                  value: `${path}:${connectedId}`,
                  count: 1,
                  query,
                  checked: optionChecked(locationQueryValue, value),
                  tags: connection.get('categories'),
                  draft: connection.getIn(['attributes', 'draft']),
                };
              }
            }
          });
        }
        if (optionConnections.size === 0) {
          if (filterOptions.options.without) {
            // no connection present
            // add without option
            filterOptions.options.without.count += 1;
          } else {
            let { message } = option;
            if (
              option.groupByType
              && option.message
              && option.message.indexOf('{typeid}') > -1
            ) {
              message = option.message.replace('{typeid}', typeid);
            }
            if (
              option.groupByType
              && option.message
              && option.message.indexOf('{typeid}') > -1
            ) {
              message = option.message.replace('{typeid}', typeid);
            }
            filterOptions.options.without = {
              messagePrefix: messages.without,
              label: option.label,
              message,
              showCount: true,
              labelBold: true,
              value: path,
              count: 1,
              query: 'without',
              checked: optionChecked(locationQuery.get('without'), path),
            };
          }
        }
      }); // for each entities
    }
  }
  filterOptions.tagFilterGroups = option && makeTagFilterGroups(connectedTaxonomies, contextIntl);
  return filterOptions;
};
export const makeSimpleConnectionFilterOptions = (
  entities,
  config,
  connections,
  activeOptionId,
  locationQuery,
  messages,
  contextIntl,
  group,
  typeId,
) => {
  const filterOptions = {
    groupId: group || 'connections',
    options: {},
    multiple: true,
    required: false,
    search: true,
    advanced: true,
    selectAll: false,
  };

  // get the active option
  const option = find(
    config.options,
    (o) => o.groupByType
      ? startsWith(activeOptionId, o.entityType)
      : o.entityType === activeOptionId,
  );

  // if option active
  if (option) {
    // the option path
    const path = activeOptionId;
    filterOptions.messagePrefix = messages.titlePrefix;
    filterOptions.message = (typeId && option.message && option.message.indexOf('{typeid}') > -1)
      ? option.message.replace('{typeid}', typeId)
      : option.message;
    filterOptions.search = option.search;
    const { query } = config;
    const connectionPath = option.connectionPath || option.entityType;
    let locationQueryValue = locationQuery.get(query);
    // if no entities found show any active options
    if (entities.size === 0) {
      if (locationQueryValue) {
        asList(locationQueryValue).forEach((queryValue) => {
          const locationQueryValueConnection = queryValue.split(':');
          if (locationQueryValueConnection.length > 1) {
            if (path === locationQueryValueConnection[0]) {
              const value = locationQueryValueConnection[1];
              const connection = connections.get(connectionPath) && connections.getIn([connectionPath, value]);
              filterOptions.options[value] = {
                reference: connection ? getEntityReference(connection) : '',
                label: connection ? getEntityTitle(connection, option.labels, contextIntl) : upperFirst(value),
                showCount: true,
                value: `${path}:${value}`,
                count: 0,
                query,
                checked: true,
                tags: connection ? connection.get('categories') : null,
                draft: connection && connection.getIn(['attributes', 'draft']),
              };
            }
          }
        });
      }
      // also check for active without options
      if (locationQuery.get('without')) {
        locationQueryValue = locationQuery.get('without');
        asList(locationQueryValue).forEach((queryValue) => {
          if (path === queryValue) {
            filterOptions.options[queryValue] = {
              messagePrefix: messages.without,
              label: option.label,
              message: option.message,
              showCount: true,
              labelBold: true,
              value: queryValue,
              count: 0,
              query: 'without',
              checked: true,
            };
          }
        });
      }
    } else {
      entities.forEach((entity) => {
        // let optionConnections = List();
        const connectedId = entity.getIn(['attributes', 'parent_id']);
        // if entity has connected entities
        if (connectedId) {
          const connection = connections.getIn([connectionPath, connectedId.toString()]);
          // if not taxonomy already considered
          if (connection) {
            // optionConnections = optionConnections.push(connection);
            // if category already added
            if (filterOptions.options[connectedId]) {
              filterOptions.options[connectedId].count += 1;
            } else {
              const value = `${path}:${connectedId}`;
              const reference = getEntityReference(connection);
              const label = getEntityTitle(connection, option.labels, contextIntl);
              filterOptions.options[connectedId] = {
                label,
                reference,
                showCount: true,
                value: `${path}:${connectedId}`,
                count: 1,
                query,
                checked: optionChecked(locationQueryValue, value),
                tags: connection.get('categories'),
                draft: connection.getIn(['attributes', 'draft']),
              };
            }
          }
        }
        // if (optionConnections.size === 0) {
        //   if (filterOptions.options.without) {
        //     // no connection present
        //     // add without option
        //     filterOptions.options.without.count += 1;
        //   } else {
        //     let { message } = option;
        //     if (
        //       option.groupByType
        //       && option.message
        //       && option.message.indexOf('{typeid}') > -1
        //     ) {
        //       message = option.message.replace('{typeid}', typeId);
        //     }
        //     if (
        //       option.groupByType
        //       && option.message
        //       && option.message.indexOf('{typeid}') > -1
        //     ) {
        //       message = option.message.replace('{typeid}', typeId);
        //     }
        //     filterOptions.options.without = {
        //       messagePrefix: messages.without,
        //       label: option.label,
        //       message,
        //       showCount: true,
        //       labelBold: true,
        //       value: path,
        //       count: 1,
        //       query: 'without',
        //       checked: optionChecked(locationQuery.get('without'), path),
        //     };
        //   }
        // }
      }); // for each entities
    }
  }
  // filterOptions.tagFilterGroups = option && makeTagFilterGroups(connectedTaxonomies, contextIntl);
  return filterOptions;
};
