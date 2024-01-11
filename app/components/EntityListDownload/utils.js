import appMessages from 'containers/App/messages';

// const IN_CELL_SEPARATOR = ', \n';
const IN_CELL_SEPARATOR = ', ';

export const getDateSuffix = (datetime) => {
  const date = datetime ? new Date(datetime) : new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is zero-based
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}_${hours}${minutes}${seconds}`;
};

const sanitiseText = (text) => {
  let val = text ? `${text}`.trim() : '';
  if (val.startsWith('-') || val.startsWith('+')) {
    val = `'${val}`;
  }
  return `"${val
    .replaceAll(/“/g, '"')
    .replaceAll(/”/g, '"')
    .replaceAll(/‘/g, "'")
    .replaceAll(/’/g, "'")
    .replaceAll(/"/g, '""')}"`;
};

const getValue = ({
  key, attribute, entity, typeNames, relationships,
}) => {
  const val = entity.getIn(['attributes', key]) || '';
  if (key === 'measuretype_id' && typeNames) {
    return typeNames.actiontypes[val] || val;
  }
  if (key === 'actortype_id' && typeNames) {
    return typeNames.actortypes[val] || val;
  }
  if (attribute.type === 'bool') {
    return val || false;
  }
  if (attribute.type === 'date') {
    if (val && val !== '') {
      const date = new Date(val);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is zero-based
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return '';
  }
  if (attribute.type === 'datetime') {
    if (val && val !== '') {
      return getDateSuffix(val);
    }
    return '';
  }
  if (
    attribute.type === 'markdown'
    || attribute.type === 'text'
  ) {
    return sanitiseText(val);
  }
  if (attribute.type === 'key' && relationships && relationships.get(attribute.table)) {
    const connectedEntity = relationships.getIn([attribute.table, `${val}`]);
    if (connectedEntity) {
      const title = connectedEntity.getIn(['attributes', 'title']) || connectedEntity.getIn(['attributes', 'name']);
      if (title) {
        const email = connectedEntity.getIn(['attributes', 'email']);
        if (email) {
          return `${title} (${email})`;
        }
        return title;
      }
    }
  }
  return val;
};
const getTaxonomyValue = ({ taxonomy, categories }) => {
  const cats = categories.reduce((memo, catId) => {
    if (taxonomy.get('categories') && taxonomy.get('categories').get(`${catId}`)) {
      const catShortTitle = taxonomy.getIn(['categories', `${catId}`, 'attributes', 'short_title']);
      const catTitle = taxonomy.getIn(['categories', `${catId}`, 'attributes', 'title']);
      return [
        ...memo,
        catShortTitle || catTitle,
      ];
    }
    return memo;
  }, []);
  return `"${cats.join(',')}"`;
};

const prepAttributeData = ({
  entity,
  attributes,
  typeNames,
  data,
  relationships,
}) => Object.keys(attributes).reduce((memo, attKey) => {
  if (!attributes[attKey].active) {
    return memo;
  }
  const value = getValue({
    key: attKey,
    attribute: attributes[attKey],
    entity,
    typeNames,
    relationships,
  });
  return ({
    ...memo,
    [attKey]: value,
  });
}, data);

const prepTaxonomyData = ({
  entity,
  taxonomyColumns,
  taxonomies,
  data,
}) => Object.keys(taxonomyColumns).reduce((memo, taxId) => {
  if (!taxonomyColumns[taxId].active) {
    return memo;
  }
  const value = getTaxonomyValue({
    taxonomy: taxonomies.get(taxId),
    categories: entity.get('categories')
      ? entity.get('categories').toList().toJS()
      : [],
  });
  return ({
    ...memo,
    [`taxonomy_${taxId}`]: value,
  });
}, data);
const addWarnings = ({
  value,
  entity,
}) => {
  const draft = entity.getIn(['attributes', 'draft']);
  const isPrivate = entity.getIn(['attributes', 'private']);
  let warnings = [];
  if (draft || isPrivate) {
    if (draft) {
      warnings = [...warnings, 'draft'];
    }
    if (isPrivate) {
      warnings = [...warnings, 'private'];
    }
    return `${value} [${warnings.join('/')}]`;
  }
  return value;
};

const prepActorData = ({
  entity, // Map
  actortypes,
  actors, // Map
  data,
}) => Object.keys(actortypes).reduce((memo, actortypeId) => {
  if (!actortypes[actortypeId].active) {
    return memo;
  }
  const entityActorIds = entity.getIn(['actorsByType', parseInt(actortypeId, 10)]);
  let actorsValue = '';
  // console.log(entityActorIds)
  if (entityActorIds) {
    actorsValue = entityActorIds.reduce((memo2, actorId) => {
      // console.log(actorId)
      const actor = actors.get(actorId.toString());
      if (actor) {
        const title = actor.getIn(['attributes', 'title']);
        const code = actor.getIn(['attributes', 'code']);
        let actorValue = (code && code !== '') ? `${code}|${title}` : title;
        actorValue = addWarnings({
          value: actorValue,
          entity: actor,
        });
        return memo2 === ''
          ? actorValue
          : `${memo2}${IN_CELL_SEPARATOR}${actorValue}`;
      }
      return memo2;
    }, '');
  }
  return ({
    ...memo,
    [`actors_${actortypeId}`]: `"${actorsValue}"`,
  });
}, data);
const prepActionData = ({
  entity, // Map
  actiontypes,
  actions, // Map
  data,
}) => Object.keys(actiontypes).reduce((memo, actiontypeId) => {
  if (!actiontypes[actiontypeId].active) {
    return memo;
  }
  const entityActionIds = entity.getIn(['actionsByType', parseInt(actiontypeId, 10)]);
  let actionsValue = '';
  // console.log(entityActorIds)
  if (entityActionIds) {
    actionsValue = entityActionIds.reduce((memo2, actionId) => {
      // console.log(actionId)
      const action = actions.get(actionId.toString());
      if (action) {
        const title = action.getIn(['attributes', 'title']);
        const code = action.getIn(['attributes', 'code']);
        let actionValue = (code && code !== '') ? `${code}|${title}` : title;
        actionValue = addWarnings({
          value: actionValue,
          entity: action,
        });
        return memo2 === ''
          ? actionValue
          : `${memo2}${IN_CELL_SEPARATOR}${actionValue}`;
      }
      return memo2;
    }, '');
  }
  return ({
    ...memo,
    [`actions_${actiontypeId}`]: sanitiseText(actionsValue),
  });
}, data);
const prepTargetData = ({
  entity,
  targettypes,
  targets,
  data,
}) => Object.keys(targettypes).reduce((memo, actortypeId) => {
  if (!targettypes[actortypeId].active) {
    return memo;
  }
  const entityActorIds = entity.getIn(['targetsByType', parseInt(actortypeId, 10)]);
  let actorsValue = '';
  // console.log(entityActorIds)
  if (entityActorIds) {
    actorsValue = entityActorIds.reduce((memo2, actorId) => {
      // console.log(actorId)
      const actor = targets.get(actorId.toString());
      if (actor) {
        const title = actor.getIn(['attributes', 'title']);
        const code = actor.getIn(['attributes', 'code']);
        let actorValue = (code && code !== '') ? `${code}|${title}` : title;
        actorValue = addWarnings({
          value: actorValue,
          entity: actor,
        });
        return memo2 === ''
          ? actorValue
          : `${memo2}${IN_CELL_SEPARATOR}${actorValue}`;
      }
      return memo2;
    }, '');
  }
  return ({
    ...memo,
    [`targets_${actortypeId}`]: sanitiseText(actorsValue),
  });
}, data);
const prepActionsAsTargetData = ({
  entity,
  actiontypesAsTarget,
  actions,
  data,
}) => Object.keys(actiontypesAsTarget).reduce((memo, actiontypeId) => {
  if (!actiontypesAsTarget[actiontypeId].active) {
    return memo;
  }
  const entityActionIds = entity.getIn(['targetingActionsByType', parseInt(actiontypeId, 10)]);
  let actionsValue = '';
  // console.log(entityActorIds)
  if (entityActionIds) {
    actionsValue = entityActionIds.reduce((memo2, actionId) => {
      // console.log(actorId)
      const action = actions.get(actionId.toString());
      if (action) {
        const title = action.getIn(['attributes', 'title']);
        const code = action.getIn(['attributes', 'code']);
        let actionValue = (code && code !== '') ? `${code}|${title}` : title;
        actionValue = addWarnings({
          value: actionValue,
          entity: action,
        });
        return memo2 === ''
          ? actionValue
          : `${memo2}${IN_CELL_SEPARATOR}${actionValue}`;
      }
      return memo2;
    }, '');
  }
  return ({
    ...memo,
    [`targeted-by-actions_${actiontypeId}`]: sanitiseText(actionsValue),
  });
}, data);

const prepResourceData = ({
  entity, // Map
  resourcetypes,
  resources, // Map
  data,
}) => Object.keys(resourcetypes).reduce((memo, resourcetypeId) => {
  if (!resourcetypes[resourcetypeId].active) {
    return memo;
  }
  const entityParentIds = entity.getIn(['resourcesByType', parseInt(resourcetypeId, 10)]);
  let resourcesValue = '';
  // console.log(entityActorIds)
  if (entityParentIds) {
    resourcesValue = entityParentIds.reduce((memo2, resourceId) => {
      // console.log(actorId)
      const resource = resources && resources.get(resourceId.toString());
      if (resource) {
        const title = resource.getIn(['attributes', 'title']);
        const code = resource.getIn(['attributes', 'code']);
        const url = resource.getIn(['attributes', 'url']);
        let resourceValue = (code && code !== '') ? `${code}|${title}` : title;
        resourceValue = (url && url !== '') ? `${resourceValue}(${url})` : title;
        resourceValue = addWarnings({ value: resourceValue, entity: resource });

        return memo2 === ''
          ? resourceValue
          : `${memo2}${IN_CELL_SEPARATOR}${resourceValue}`;
      }
      return memo2;
    }, '');
  }
  return ({
    ...memo,
    [`resources_${resourcetypeId}`]: sanitiseText(resourcesValue),
  });
}, data);

const prepActorDataAsRows = ({
  entity, // Map
  actortypes,
  actors, // Map
  data,
  typeNames,
}) => {
  if (entity.get('actors') && actortypes) {
    const dataRows = Object.keys(actortypes).reduce((memo, actortypeId) => {
      if (!actortypes[actortypeId].active) {
        return memo;
      }
      const entityActorIds = entity.getIn(['actorsByType', parseInt(actortypeId, 10)]);
      // console.log(entityActorIds)
      if (entityActorIds) {
        const dataTypeRows = entityActorIds.reduce((memo2, actorId) => {
          const actor = actors.get(actorId.toString());
          const dataRow = {
            ...data,
            actor_id: actorId,
            actortype_id: typeNames.actortypes[actortypeId] || actortypeId,
            actor_code: actor.getIn(['attributes', 'code']),
            actor_title: sanitiseText(actor.getIn(['attributes', 'title'])),
            actor_draft: !!actor.getIn(['attributes', 'draft']),
            actor_private: !!actor.getIn(['attributes', 'private']),
          };
          return [
            ...memo2,
            dataRow,
          ];
        }, []);
        return [
          ...memo,
          ...dataTypeRows,
        ];
      }
      return memo;
    }, []);
    return dataRows.length > 0 ? dataRows : [data];
  }
  return [data];
};
const prepActionDataAsRows = ({
  entity, // Map
  actiontypes,
  actions, // Map
  data,
  typeNames,
}) => {
  if (entity.get('actions') && actiontypes) {
    const dataRows = Object.keys(actiontypes).reduce((memo, actiontypeId) => {
      if (!actiontypes[actiontypeId].active) {
        return memo;
      }
      const entityActionIds = entity.getIn(['actionsByType', parseInt(actiontypeId, 10)]);
      // console.log(entityActorIds)
      if (entityActionIds) {
        const dataTypeRows = entityActionIds.reduce((memo2, actionId) => {
          const action = actions.get(actionId.toString());
          const dataRow = {
            ...data,
            action_id: actionId,
            actiontype_id: typeNames.actiontypes[actiontypeId] || actiontypeId,
            action_code: action.getIn(['attributes', 'code']),
            action_title: sanitiseText(action.getIn(['attributes', 'title'])),
            action_draft: !!action.getIn(['attributes', 'draft']),
            action_private: !!action.getIn(['attributes', 'private']),
          };
          return [
            ...memo2,
            dataRow,
          ];
        }, []);
        return [
          ...memo,
          ...dataTypeRows,
        ];
      }
      return [
        ...memo,
      ];
    }, []);
    return dataRows.length > 0 ? dataRows : [data];
  }
  return [data];
};

export const prepareDataForActions = ({
  // typeId,
  // config,
  attributes,
  entities,
  typeNames,
  taxonomies,
  taxonomyColumns,
  relationships,
  hasActors,
  actorsAsRows,
  actortypes,
  hasTargets,
  targettypes,
  hasResources,
  resourcetypes,
}) => entities.reduce((memo, entity) => {
  let data = { id: entity.get('id') };
  // add attribute columns
  if (attributes) {
    data = prepAttributeData({
      entity,
      attributes,
      typeNames,
      data,
      relationships,
    });
  }
  if (taxonomyColumns) {
    data = prepTaxonomyData({
      entity,
      taxonomyColumns,
      taxonomies,
      data,
    });
  }
  if (hasActors && !actorsAsRows) {
    data = prepActorData({
      entity,
      actortypes,
      actors: relationships && relationships.get('actors'),
      data,
    });
  }
  if (hasTargets) {
    data = prepTargetData({
      entity,
      targettypes,
      targets: relationships && relationships.get('actors'),
      data,
    });
  }
  if (hasResources) {
    data = prepResourceData({
      entity,
      resourcetypes,
      resources: relationships && relationships.get('resources'),
      data,
    });
  }
  let dataRows = [data];
  if (hasActors && actorsAsRows) {
    dataRows = prepActorDataAsRows({
      entity,
      actortypes,
      actors: relationships && relationships.get('actors'),
      data,
      typeNames,
    });
  }
  return [...memo, ...dataRows];
}, []);
export const prepareDataForActors = ({
  // typeId,
  // config,
  attributes,
  entities,
  typeNames,
  taxonomies,
  taxonomyColumns,
  relationships,
  hasActions,
  actionsAsRows,
  actiontypes,
  hasActionsAsTarget,
  actiontypesAsTarget,
}) => entities.reduce((memo, entity) => {
  let data = { id: entity.get('id') };
  // add attribute columns
  if (attributes) {
    data = prepAttributeData({
      entity,
      attributes,
      typeNames,
      data,
      relationships,
    });
  }
  if (taxonomyColumns) {
    data = prepTaxonomyData({
      entity,
      taxonomyColumns,
      taxonomies,
      data,
    });
  }
  if (hasActions && !actionsAsRows) {
    data = prepActionData({
      entity,
      actiontypes,
      actions: relationships && relationships.get('measures'),
      data,
    });
  }

  if (hasActionsAsTarget) {
    data = prepActionsAsTargetData({
      entity,
      actiontypesAsTarget,
      actions: relationships && relationships.get('measures'),
      data,
    });
  }

  let dataRows = [data];
  if (hasActions && actionsAsRows) {
    dataRows = prepActionDataAsRows({
      entity,
      actiontypes,
      actions: relationships && relationships.get('measures'),
      data,
      typeNames,
    });
  }
  return [...memo, ...dataRows];
}, []);


export const getAttributes = ({
  typeId,
  fieldAttributes,
  isAdmin,
  intl,
}) => {
  if (fieldAttributes) {
    return Object.keys(fieldAttributes).reduce((memo, attKey) => {
      const attValue = fieldAttributes[attKey];
      const optional = typeof attValue.optional === 'boolean'
        ? attValue.optional
        : attValue.optional && attValue.optional.indexOf(typeId) > -1;
      const required = typeof attValue.required === 'boolean'
        ? attValue.required
        : attValue.required && attValue.required.indexOf(typeId) > -1;
      let passAdmin = true;
      if (
        !isAdmin
        && (
          attValue.exportAdminOnly
          || (attValue.exportAdminOnlyForTypes && attValue.exportAdminOnlyForTypes.indexOf(typeId) > -1)
        )
      ) {
        passAdmin = false;
      }

      if (
        !attValue.skipExport
        // TODO: exportAdminOnlyForTypes
        && passAdmin
        && (optional || required || (!attValue.optional && !attValue.required))
      ) {
        let active = false;
        if (attValue.exportDefault) {
          active = attValue.exportDefault;
        }
        if (attValue.exportRequired) {
          active = true;
        }
        const label = `${intl.formatMessage(appMessages.attributes[attKey])}${attValue.exportRequired ? ' (required)' : ''}`;
        return {
          ...memo,
          [attKey]: {
            ...attValue,
            active,
            column: attValue.exportColumn || attKey,
            label,
          },
        };
      }
      return memo;
    }, {});
  }
  return [];
};
