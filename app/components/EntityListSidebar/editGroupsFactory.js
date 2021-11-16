import { reduce } from 'lodash/collection';
// import { sortEntities } from 'utils/sort';
import { qe } from 'utils/quasi-equals';
import { API } from 'themes/config';

export const makeEditGroups = ({
  config,
  taxonomies,
  activeEditOption,
  hasUserRole,
  messages,
  actortypes,
  actiontypes,
}) => {
  const editGroups = {};
  // const selectedActortypes = actortypes && actortypes.filter(
  //   (actortype) => selectedActortypeIds.find((id) => qe(id, actortype.get('id'))),
  // );
  // taxonomy option group
  if (config.taxonomies && taxonomies) {
    // first prepare taxonomy options
    editGroups.taxonomies = {
      id: 'taxonomies', // filterGroupId
      label: messages.taxonomyGroup,
      show: true,
      icon: 'categories',
      options:
        // all selectedActortypeIds must be included in tax.actortypeIds
        taxonomies
          .filter(
            // exclude parent taxonomies
            (tax) => !taxonomies.some(
              (otherTax) => qe(
                tax.get('id'),
                otherTax.getIn(['attributes', 'parent_id']),
              )
            )
          )
          .reduce(
            (memo, taxonomy) => memo.concat([
              {
                id: taxonomy.get('id'), // filterOptionId
                label: messages.taxonomies(taxonomy.get('id')),
                path: config.taxonomies.connectPath,
                key: config.taxonomies.key,
                ownKey: config.taxonomies.ownKey,
                active: !!activeEditOption && activeEditOption.optionId === taxonomy.get('id'),
                create: {
                  path: API.CATEGORIES,
                  attributes: { taxonomy_id: taxonomy.get('id') },
                },
              },
            ]),
            [],
          ),
    };
  }

  // connections option group
  if (config.connections) {
    // first prepare taxonomy options
    editGroups.connections = {
      id: 'connections', // filterGroupId
      label: messages.connections(config.connections.type),
      show: true,
      options: reduce(
        config.connections.options,
        (optionsMemo, option) => {
          // exclude connections not applicabel for all actortypes
          // if (
          //   option.typeFilter
          //   && option.editForActortypes
          //   && actortypes
          //   && !selectedActortypes.every((actortype) => actortype.getIn(['attributes', option.typeFilter]))
          // ) {
          //   return optionsMemo;
          // }
          if (option.groupByType && actortypes) {
            return actortypes
              .filter((actortype) => !option.typeFilter || actortype.getIn(['attributes', option.typeFilter]))
              .reduce(
                (memo, actortype) => {
                  const id = `${option.query}_${actortype.get('id')}`;
                  return memo.concat({
                    id, // filterOptionId
                    label: option.label,
                    message: (option.message && option.message.indexOf('{typeid}') > -1)
                      ? option.message.replace('{typeid}', actortype.get('id'))
                      : option.message,
                    path: option.connectPath,
                    connection: option.query,
                    key: option.key,
                    ownKey: option.ownKey,
                    icon: id,
                    active: !!activeEditOption && activeEditOption.optionId === id,
                    create: { path: option.path },
                    color: option.query,
                  });
                },
                optionsMemo,
              );
          }
          if (option.groupByType && actiontypes) {
            return actiontypes
              .filter((actiontype) => !option.actiontypeFilter || actiontype.getIn(['attributes', option.actiontypeFilter]))
              .reduce(
                (memo, actiontype) => {
                  const id = `${option.query}_${actiontype.get('id')}`;
                  return memo.concat({
                    id, // filterOptionId
                    label: option.label,
                    message: (option.message && option.message.indexOf('{typeid}') > -1)
                      ? option.message.replace('{typeid}', actiontype.get('id'))
                      : option.message,
                    path: option.connectPath,
                    connection: option.query,
                    key: option.key,
                    ownKey: option.ownKey,
                    icon: id,
                    active: !!activeEditOption
                      && activeEditOption.group === 'targets'
                      && activeEditOption.optionId === id,
                    create: { path: option.path },
                    color: option.query,
                  });
                },
                optionsMemo,
              );
          }
          return typeof option.edit === 'undefined' || option.edit
            ? optionsMemo.concat({
              id: option.query, // filterOptionId
              label: option.label,
              message: option.message,
              path: option.connectPath,
              connection: option.query,
              key: option.key,
              ownKey: option.ownKey,
              icon: option.query,
              active: !!activeEditOption && activeEditOption.optionId === option.query,
              create: { path: option.path },
            })
            : optionsMemo;
        },
        [],
      ),
    };
  }
  // targets option group
  if (config.targets) {
    // first prepare taxonomy options
    editGroups.targets = {
      id: 'targets', // filterGroupId
      label: messages.targets,
      show: true,
      options: reduce(
        config.targets.options,
        (optionsMemo, option) => {
          let connectedTypes;
          if (config.connections.type === 'actors') {
            connectedTypes = actortypes;
          } else if (config.connections.type === 'actions') {
            connectedTypes = actiontypes;
          }
          if (option.groupByType && connectedTypes) {
            return connectedTypes
              .filter((type) => !option.typeFilter || type.getIn(['attributes', option.typeFilter]))
              .reduce(
                (memo, type) => {
                  const id = `${option.query}_${type.get('id')}`;
                  return memo.concat({
                    id, // filterOptionId
                    label: option.label,
                    message: (option.message && option.message.indexOf('{typeid}') > -1)
                      ? option.message.replace('{typeid}', type.get('id'))
                      : option.message,
                    path: option.connectPath,
                    connection: option.query,
                    key: option.key,
                    ownKey: option.ownKey,
                    icon: id,
                    active: !!activeEditOption && activeEditOption.optionId === id,
                    create: { path: option.path },
                    color: option.query,
                  });
                },
                optionsMemo,
              );
          }
          return typeof option.edit === 'undefined' || option.edit
            ? optionsMemo.concat({
              id: option.query, // filterOptionId
              label: option.label,
              message: option.message,
              path: option.connectPath,
              connection: option.query,
              key: option.key,
              ownKey: option.ownKey,
              icon: option.query,
              active: !!activeEditOption && activeEditOption.optionId === option.query,
              create: { path: option.path },
            })
            : optionsMemo;
        },
        [],
      ),
    };
  }

  // attributes
  if (config.attributes) {
    // first prepare taxonomy options
    editGroups.attributes = {
      id: 'attributes', // filterGroupId
      label: messages.attributes,
      show: true,
      options: reduce(
        config.attributes.options,
        (optionsMemo, option) => {
          // if (
          //   option.typeFilter
          //   && option.editForActortypes
          //   && actortypes
          //   && !selectedActortypes.every((actortype) => actortype.getIn(['attributes', option.typeFilter]))
          // ) {
          //   return optionsMemo;
          // }
          if (
            (typeof option.edit === 'undefined' || option.edit)
            && (typeof option.role === 'undefined' || hasUserRole[option.role])
          ) {
            return optionsMemo.concat({
              id: option.attribute, // filterOptionId
              label: option.label,
              message: option.message,
              active: !!activeEditOption && activeEditOption.optionId === option.attribute,
            });
          }
          return optionsMemo;
        },
        [],
      ),
    };
  }
  return editGroups;
};
