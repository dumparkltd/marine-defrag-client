import { find, forEach } from 'lodash/collection';
import { upperFirst } from 'lodash/string';

import { TEXT_TRUNCATE } from 'themes/config';

import { getCategoryShortTitle } from 'utils/entities';
import { qe } from 'utils/quasi-equals';

import { truncateText } from 'utils/string';
import isNumber from 'utils/is-number';
import asList from 'utils/as-list';

import appMessages from 'containers/App/messages';

export const currentFilterArgs = (config, locationQuery) => {
  let args = [];
  if (config.actortypes && locationQuery.get(config.actortypes.query)) {
    args = args.concat(config.actortypes.query);
  }
  if (config.taxonomies && locationQuery.get(config.taxonomies.query)) {
    args = args.concat(config.taxonomies.query);
  }
  // if (config.connectedTaxonomies && locationQuery.get(config.connectedTaxonomies.query)) {
  //   args = args.concat(config.connectedTaxonomies.query);
  // }
  if (config.connections) {
    Object.keys(config.connections).forEach((connectionKey) => {
      const connectionConfig = config.connections[connectionKey];
      if (locationQuery.get(connectionConfig.query)) {
        args = args.concat(connectionConfig.query);
      }
    });
  }
  if (locationQuery.get('where')) {
    args = args.concat('where');
  }
  if (locationQuery.get('without')) {
    args = args.concat('without');
  }
  return args;
};


export const currentFilters = (
  {
    config,
    entities,
    taxonomies,
    connections,
    locationQuery,
    onTagClick,
    errors,
    // actortypes,
    intl,
  },
  withoutLabel,
  errorLabel,
) => {
  let filterTags = [];
  if (errors && errors.size > 0) {
    filterTags.push(getErrorTag(errorLabel));
  }
  // if (config.actortypes && actortypes && actortypes.size > 1) {
  //   filterTags = filterTags.concat(getCurrentActortypeFilter(
  //     config.actortypes,
  //     actortypes,
  //     locationQuery,
  //     onTagClick
  //   ));
  // }
  if (config.taxonomies && taxonomies) {
    filterTags = filterTags.concat(getCurrentTaxonomyFilters(
      config.taxonomies,
      taxonomies,
      locationQuery,
      onTagClick,
      withoutLabel,
      intl,
    ));
  }
  if (connections && config.connections) {
    Object.keys(config.connections).forEach((connectionKey) => {
      filterTags = filterTags.concat(getCurrentConnectionFilters(
        connectionKey,
        config.connections[connectionKey],
        connections,
        locationQuery,
        onTagClick,
        withoutLabel,
        intl,
      ));
    });
  }
  if (config.attributes) {
    filterTags = filterTags.concat(getCurrentAttributeFilters(
      entities,
      config.attributes.options,
      locationQuery,
      onTagClick,
      withoutLabel,
      intl,
    ));
  }
  return filterTags;
};

const getErrorTag = (label) => ({
  id: 'error',
  type: 'error',
  label,
});
const getConnectionLabel = (connection, value, long) => {
  if (connection) {
    if (long) {
      return truncateText(
        connection.getIn(['attributes', 'title']) || connection.get('id'),
        TEXT_TRUNCATE.CONNECTION_TAG,
      );
    }
    return truncateText(
      connection.getIn(['attributes', 'code']) || connection.getIn(['attributes', 'title']) || connection.get('id'),
      TEXT_TRUNCATE.CONNECTION_TAG,
    );
  }
  return upperFirst(value);
};

const getCategoryLabel = (category) => truncateText(getCategoryShortTitle(category), TEXT_TRUNCATE.ENTITY_TAG);

const getCurrentTaxonomyFilters = (
  taxonomyFilters,
  taxonomies,
  locationQuery,
  onClick,
  withoutLabel,
  intl,
) => {
  const tags = [];
  if (locationQuery.get(taxonomyFilters.query)) {
    const locationQueryValue = locationQuery.get(taxonomyFilters.query);
    taxonomies.forEach(
      (taxonomy) => {
        asList(locationQueryValue).forEach((queryValue) => {
          const value = queryValue.toString();
          if (taxonomy.getIn(['categories', value])) {
            const category = taxonomy.getIn(['categories', value]);
            tags.push({
              label: getCategoryLabel(category),
              type: 'taxonomies',
              id: taxonomy.get('id'),
              group: intl.formatMessage(appMessages.nav.taxonomies),
              inverse: true,
              onClick: () => onClick({
                value,
                query: taxonomyFilters.query,
                checked: false,
              }),
              groupId: 'taxonomies',
              optionId: taxonomy.get('id'),
            });
          }
        });
      }
    );
  }
  if (locationQuery.get('without')) {
    const locationQueryValue = locationQuery.get('without');
    taxonomies.forEach((taxonomy) => {
      asList(locationQueryValue).forEach((queryValue) => {
        // numeric means taxonomy
        if (isNumber(queryValue) && taxonomy.get('id') === queryValue) {
          const value = queryValue.toString();
          tags.push({
            labels: [
              { label: withoutLabel },
              {
                label: `entities.taxonomies.${parseInt(taxonomy.get('id'), 10)}.single`,
                lowerCase: true,
                appMessage: true,
              },
            ],
            type: 'taxonomies',
            group: intl.formatMessage(appMessages.nav.taxonomies),
            id: taxonomy.get('id'),
            onClick: () => onClick({
              value,
              query: 'without',
              checked: false,
            }),
            groupId: 'taxonomies',
            optionId: taxonomy.get('id'),
          });
        }
      });
    });
  }
  return tags;
};

// const getCurrentActortypeFilter = (
//   config,
//   actortypes,
//   locationQuery,
//   onClick,
// ) => {
//   const tags = [];
//   if (locationQuery.get(config.query)) {
//     const locationQueryValue = locationQuery.get(config.query);
//     const actortype = actortypes.find((type) => qe(type.get('id'), locationQueryValue));
//     if (actortype) {
//       tags.push({
//         message: `actortypes_short.${actortype.get('id')}`,
//         type: 'actors',
//         id: 0,
//         onClick: () => onClick({
//           value: actortype.get('id'),
//           query: config.query,
//           checked: false,
//         }),
//       });
//     }
//   }
//   return tags;
// };

const getCurrentConnectionFilters = (
  connectionKey,
  option,
  connections,
  locationQuery,
  onClick,
  withoutLabel,
  intl,
) => {
  const tags = [];
  const { query, path } = option;
  if (locationQuery.get(query) && connections.get(path)) {
    const locationQueryValue = locationQuery.get(query);
    asList(locationQueryValue).forEach((queryValue) => {
      // const valueSplit = queryValue.split(':');
      const [optionId, value] = queryValue.split(':');
      if (value) {
        const connection = connections.getIn([path, value]);
        if (connection) {
          tags.push({
            label: getConnectionLabel(connection, value, false),
            labelLong: getConnectionLabel(connection, value, true),
            type: option.entityType,
            group: intl.formatMessage(appMessages.nav[option.entityTypeAs || option.entityType]),
            onClick: () => onClick({
              value: queryValue,
              query,
              checked: false,
            }),
            groupId: connectionKey,
            optionId,
          });
        }
      }
    });
  }

  if (locationQuery.get('without')) {
    const locationQueryValue = locationQuery.get('without');
    asList(locationQueryValue).forEach((queryValue) => {
      // if (option.attribute && startsWith(queryValue, 'att')) {
      //   tags.push({
      //     labels: [
      //       { label: withoutLabel },
      //       {
      //         appMessage: true,
      //         label: option.message,
      //         lowerCase: true,
      //       },
      //       { label: option.label },
      //     ],
      //     type: option.entityType,
      //     group: intl.formatMessage(appMessages.nav[option.entityTypeAs || option.entityType]),
      //     onClick: () => onClick({
      //       value: queryValue,
      //       query: 'without',
      //       checked: false,
      //     }),
      //     groupId: connectionKey,
      //     optionId,
      //   });
      // } else {
      const [entityType, typeId] = queryValue.split('_');
      if (entityType === (option.entityTypeAs || option.entityType)) {
        tags.push({
          labels: [
            { label: withoutLabel },
            {
              appMessage: true,
              label: (
                option.groupByType
                && option.message
                && option.message.indexOf('{typeid}') > -1
              )
                ? option.message.replace('{typeid}', typeId)
                : option.message,
              lowerCase: true,
            },
            { label: option.label },
          ],
          group: intl.formatMessage(appMessages.nav[option.entityTypeAs || option.entityType]),
          type: option.entityType,
          onClick: () => onClick({
            value: queryValue,
            query: 'without',
            checked: false,
          }),
          groupId: connectionKey,
          optionId: typeId,
        });
        // }
      }
    });
  }
  return tags;
};

const getCurrentAttributeFilters = (entities, attributeFiltersOptions, locationQuery, onClick, withoutLabel, intl) => {
  const tags = [];
  if (locationQuery.get('where')) {
    const locationQueryValue = locationQuery.get('where');
    forEach(attributeFiltersOptions, (option) => {
      if (locationQueryValue) {
        asList(locationQueryValue).forEach((queryValue) => {
          const [qAttribute, value] = queryValue.split(':');
          if (qAttribute === option.attribute && value) {
            if (option.reference) {
              // without
              if (value === 'null') {
                tags.push({
                  labels: [
                    { label: withoutLabel },
                    { appMessage: !!option.message, label: option.message || option.label, lowerCase: true },
                  ],
                  type: 'attributes',
                  group: intl.formatMessage(appMessages.nav.attributes),
                  onClick: () => onClick({
                    value: queryValue,
                    query: 'where',
                    checked: false,
                  }),
                });
              } else {
                const referenceEntity = entities.find((entity) => qe(entity.getIn(['attributes', option.attribute]), value));
                const label = referenceEntity && referenceEntity.getIn([option.reference.key, 'attributes', option.reference.label]);
                tags.push({
                  labels: label
                    ? [{ label }]
                    : [
                      { appMessage: !!option.message, label: option.message || option.label, postfix: ':' },
                      { label: value },
                    ],
                  type: 'attributes',
                  group: intl.formatMessage(appMessages.nav.attributes),
                  onClick: () => onClick({
                    value: queryValue,
                    query: 'where',
                    checked: false,
                  }),
                });
              }
            } else if (option.options) {
              const attribute = find(option.options, (o) => o.value.toString() === value.toString());
              let label = attribute ? attribute.message : upperFirst(value);
              label = truncateText(label, TEXT_TRUNCATE.ATTRIBUTE_TAG);
              tags.push({
                labels: [{
                  appMessage: !!attribute.message,
                  label,
                }],
                type: 'attributes',
                group: intl.formatMessage(appMessages.nav.attributes),
                onClick: () => onClick({
                  value: queryValue,
                  query: 'where',
                  checked: false,
                }),
              });
            }
          }
        });
      }
    });
  }
  return tags;
};
