import { Map, List } from 'immutable';

import { filter } from 'lodash/collection';

import {
  getEntityTitle,
  getEntityReference,
  getCategoryShortTitle,
} from 'utils/entities';
import qe from 'utils/quasi-equals';

import { getCheckedValuesFromOptions, getCheckedOptions } from 'components/forms/MultiSelectControl';
import validateDateFormat from 'components/forms/validators/validate-date-format';
import validateRequired from 'components/forms/validators/validate-required';
import validateNumber from 'components/forms/validators/validate-number';
import validateEmailFormat from 'components/forms/validators/validate-email-format';
import validateMinLength from 'components/forms/validators/validate-min-length';
import validateMaxLength from 'components/forms/validators/validate-max-length';

import {
  PUBLISH_STATUSES,
  USER_ROLES,
  DATE_FORMAT,
  API,
  ACTIONTYPES_CONFIG,
  ACTORTYPES_CONFIG,
} from 'themes/config';

import appMessages from 'containers/App/messages';

export const entityOption = (entity, defaultToId, hasTags) => Map({
  value: entity.get('id'),
  label: getEntityTitle(entity),
  reference: getEntityReference(entity, defaultToId),
  checked: !!entity.get('associated'), // convert to boolean
  association: !!entity.get('associated') && entity.get('association'),
  tags: hasTags && entity.get('categories'),
  draft: entity.getIn(['attributes', 'draft']),
});

export const entityOptions = (entities, defaultToId = true, hasTags = true) => entities
  ? entities.toList().map(
    (entity) => entityOption(entity, defaultToId, hasTags)
  )
  : List();

export const userOption = (entity, activeUserId) => Map({
  value: entity.get('id'),
  label: entity.getIn(['attributes', 'name']),
  checked: activeUserId ? entity.get('id') === activeUserId.toString() : false,
});

export const userOptions = (entities, activeUserId) => entities
  ? entities.reduce((options, entity) => options.push(userOption(entity, activeUserId)), List())
  : List();

export const parentCategoryOption = (entity, activeParentId) => Map({
  value: entity.get('id'),
  label: entity.getIn(['attributes', 'title']),
  checked: activeParentId ? entity.get('id') === activeParentId.toString() : false,
});
export const parentCategoryOptions = (entities, activeParentId) => entities
  ? entities.reduce((options, entity) => options.push(parentCategoryOption(entity, activeParentId)), List())
  : List();

export const parentActionOption = (entity, activeParentId) => Map({
  value: entity.get('id'),
  label: getEntityTitle(entity),
  draft: entity.getIn(['attributes', 'draft']),
  checked: activeParentId ? entity.get('id') === activeParentId.toString() : false,
}).set(
  'attributes',
  entity.get('attributes'),
);

export const parentActionOptions = (entities, activeParentId) => entities
  ? entities.reduce((options, entity) => options.push(parentActionOption(entity, activeParentId)), List())
  : List();

export const dateOption = (entity, activeDateId) => Map({
  value: entity.get('id'),
  // TODO replace due_date
  label: entity.getIn(['attributes', 'due_date']),
  checked: activeDateId ? entity.get('id') === activeDateId.toString() : false,
});

export const taxonomyOptions = (taxonomies) => taxonomies
  ? taxonomies.toList().reduce(
    (values, tax) => values.set(
      tax.get('id'),
      entityOptions(tax.get('categories'), false, false)
    ),
    Map(),
  )
  : Map();

const getTaxTitle = (id, contextIntl) => contextIntl ? contextIntl.formatMessage(appMessages.entities.taxonomies[id].single) : '';

// turn taxonomies into multiselect options
export const makeTagFilterGroups = (taxonomies, contextIntl) => taxonomies
  && taxonomies.toList().map((taxonomy) => ({
    title: getTaxTitle(parseInt(taxonomy.get('id'), 10), contextIntl),
    palette: ['taxonomies', parseInt(taxonomy.get('id'), 10)],
    options: taxonomy.get('categories').map((category) => ({
      reference: getEntityReference(category, false),
      label: getEntityTitle(category),
      filterLabel: getCategoryShortTitle(category),
      showCount: false,
      value: category.get('id'),
    })).valueSeq().toArray(),
  })).toArray();

export const makeTypeFilter = (
  types,
  contextIntl,
  attribute,
  typeMessage
) => ({
  title: contextIntl.formatMessage(appMessages.attributes[attribute]),
  attribute,
  options: types.map((typeId) => ({
    label: contextIntl.formatMessage(appMessages[typeMessage][typeId]),
    value: typeId,
  })),
});

export const renderActionControl = ({
  entities,
  taxonomies,
  onCreateOption,
  contextIntl,
  types,
}) => entities
  ? {
    id: 'actions',
    model: '.associatedActions',
    dataPath: ['associatedActions'],
    label: contextIntl.formatMessage(appMessages.entities.actions.plural),
    controlType: 'multiselect',
    options: entityOptions(entities, true),
    advanced: true,
    selectAll: true,
    tagFilterGroups: makeTagFilterGroups(taxonomies, contextIntl),
    typeFilter: types && makeTypeFilter(
      types,
      contextIntl,
      'measuretype_id',
      'actiontypes',
    ),
    onCreate: onCreateOption
      ? () => onCreateOption({ path: API.ACTIONS })
      : null,
  }
  : null;

export const renderActorControl = (
  actortypeId,
  entities,
  taxonomies,
  onCreateOption,
  contextIntl,
) => entities
  ? {
    id: `actors.${actortypeId}`,
    model: `.associatedActorsByActortype.${actortypeId}`,
    dataPath: ['associatedActorsByActortype', actortypeId],
    label: contextIntl.formatMessage(appMessages.entities[`actors_${actortypeId}`].plural),
    controlType: 'multiselect',
    options: entityOptions(entities),
    advanced: true,
    selectAll: true,
    tagFilterGroups: makeTagFilterGroups(taxonomies, contextIntl),
    onCreate: onCreateOption
      ? () => onCreateOption({ path: API.ACTORS })
      : null,
  }
  : null;

// actors grouped by actortype
export const renderActorsByActortypeControl = ({
  entitiesByActortype,
  taxonomies,
  onCreateOption,
  contextIntl,
  connections,
  connectionAttributes,
}) => entitiesByActortype
  ? entitiesByActortype.reduce(
    (controls, entities, typeid) => controls.concat({
      id: `actors.${typeid}`,
      typeId: typeid,
      model: `.associatedActorsByActortype.${typeid}`,
      dataPath: ['associatedActorsByActortype', typeid],
      label: contextIntl.formatMessage(appMessages.entities[`actors_${typeid}`].plural),
      controlType: 'multiselect',
      options: entityOptions(entities),
      advanced: true,
      selectAll: true,
      connections,
      connectionAttributes,
      tagFilterGroups: makeTagFilterGroups(taxonomies, contextIntl),
      onCreate: onCreateOption
        ? () => onCreateOption({
          path: API.ACTORS,
          attributes: { actortype_id: typeid },
        })
        : null,
    }),
    [],
  ).sort((a, b) => {
    const configA = ACTORTYPES_CONFIG[a.typeId];
    const configB = ACTORTYPES_CONFIG[b.typeId];
    return configA.order < configB.order ? -1 : 1;
  })
  : null;
// actors grouped by actortype
export const renderTargetsByActortypeControl = (
  entitiesByActortype,
  taxonomies,
  onCreateOption,
  contextIntl,
) => entitiesByActortype
  ? entitiesByActortype.reduce(
    (controls, entities, typeid) => controls.concat({
      id: `targets.${typeid}`,
      typeId: typeid,
      model: `.associatedTargetsByActortype.${typeid}`,
      dataPath: ['associatedTargetsByActortype', typeid],
      label: contextIntl.formatMessage(appMessages.entities[`actors_${typeid}`].plural),
      controlType: 'multiselect',
      options: entityOptions(entities),
      advanced: true,
      selectAll: true,
      tagFilterGroups: makeTagFilterGroups(taxonomies, contextIntl),
      onCreate: onCreateOption
        ? () => onCreateOption({
          path: API.ACTORS,
          attributes: { actortype_id: typeid },
        })
        : null,
    }),
    [],
  ).sort((a, b) => {
    const configA = ACTORTYPES_CONFIG[a.typeId];
    const configB = ACTORTYPES_CONFIG[b.typeId];
    return configA.order < configB.order ? -1 : 1;
  })
  : null;

export const renderMembersByActortypeControl = (
  entitiesByActortype,
  taxonomies,
  onCreateOption,
  contextIntl,
) => entitiesByActortype
  ? entitiesByActortype.reduce(
    (controls, entities, typeid) => controls.concat({
      id: `members.${typeid}`,
      typeId: typeid,
      model: `.associatedMembersByActortype.${typeid}`,
      dataPath: ['associatedMembersByActortype', typeid],
      label: contextIntl.formatMessage(appMessages.entities[`actors_${typeid}`].plural),
      controlType: 'multiselect',
      options: entityOptions(entities),
      advanced: true,
      selectAll: true,
      tagFilterGroups: makeTagFilterGroups(taxonomies, contextIntl),
      onCreate: onCreateOption
        ? () => onCreateOption({
          path: API.ACTORS,
          attributes: { actortype_id: typeid },
        })
        : null,
    }),
    [],
  ).sort((a, b) => {
    const configA = ACTORTYPES_CONFIG[a.typeId];
    const configB = ACTORTYPES_CONFIG[b.typeId];
    return configA.order < configB.order ? -1 : 1;
  })
  : null;
export const renderAssociationsByActortypeControl = (
  entitiesByActortype,
  taxonomies,
  onCreateOption,
  contextIntl,
) => entitiesByActortype
  ? entitiesByActortype.reduce(
    (controls, entities, typeid) => controls.concat({
      id: `associations.${typeid}`,
      typeId: typeid,
      model: `.associatedAssociationsByActortype.${typeid}`,
      dataPath: ['associatedAssociationsByActortype', typeid],
      label: contextIntl.formatMessage(appMessages.entities[`actors_${typeid}`].plural),
      controlType: 'multiselect',
      options: entityOptions(entities),
      advanced: true,
      selectAll: true,
      tagFilterGroups: makeTagFilterGroups(taxonomies, contextIntl),
      onCreate: onCreateOption
        ? () => onCreateOption({
          path: API.ACTORS,
          attributes: { actortype_id: typeid },
        })
        : null,
    }),
    [],
  ).sort((a, b) => {
    const configA = ACTORTYPES_CONFIG[a.typeId];
    const configB = ACTORTYPES_CONFIG[b.typeId];
    return configA.order < configB.order ? -1 : 1;
  })
  : null;

export const renderActionsByActiontypeControl = ({
  entitiesByActiontype,
  taxonomies,
  onCreateOption,
  contextIntl,
  connectionAttributesForType,
  model = 'associatedActionsByActiontype',
}) => entitiesByActiontype
  ? entitiesByActiontype.reduce(
    (controls, entities, typeid) => controls.concat({
      id: `actions.${typeid}`,
      typeId: typeid,
      model: `.${model}.${typeid}`,
      dataPath: [model, typeid],
      label: contextIntl.formatMessage(appMessages.entities[`actions_${typeid}`].plural),
      controlType: 'multiselect',
      options: entityOptions(entities),
      advanced: true,
      selectAll: true,
      connectionAttributes: connectionAttributesForType && connectionAttributesForType(typeid),
      tagFilterGroups: makeTagFilterGroups(taxonomies, contextIntl),
      onCreate: onCreateOption
        ? () => onCreateOption({
          path: API.ACTIONS,
          attributes: { measuretype_id: typeid },
        })
        : null,
    }),
    [],
  ).sort((a, b) => {
    const configA = ACTIONTYPES_CONFIG[a.typeId];
    const configB = ACTIONTYPES_CONFIG[b.typeId];
    return configA.order < configB.order ? -1 : 1;
  })
  : null;

export const renderActionsAsTargetByActiontypeControl = (
  entitiesByActiontype,
  taxonomies,
  onCreateOption,
  contextIntl,
) => entitiesByActiontype
  ? entitiesByActiontype.reduce(
    (controls, entities, typeid) => controls.concat({
      id: `actionsAsTarget.${typeid}`,
      typeId: typeid,
      model: `.associatedActionsAsTargetByActiontype.${typeid}`,
      dataPath: ['associatedActionsAsTargetByActiontype', typeid],
      label: contextIntl.formatMessage(appMessages.entities[`actions_${typeid}`].plural),
      controlType: 'multiselect',
      options: entityOptions(entities),
      advanced: true,
      selectAll: true,
      tagFilterGroups: makeTagFilterGroups(taxonomies, contextIntl),
      onCreate: onCreateOption
        ? () => onCreateOption({
          path: API.ACTIONS,
          attributes: { measuretype_id: typeid },
        })
        : null,
    }),
    [],
  ).sort((a, b) => {
    const configA = ACTIONTYPES_CONFIG[a.typeId];
    const configB = ACTIONTYPES_CONFIG[b.typeId];
    return configA.order < configB.order ? -1 : 1;
  })
  : null;

// actors grouped by actortype
export const renderResourcesByResourcetypeControl = (
  entitiesByResourcetype,
  onCreateOption,
  contextIntl,
) => entitiesByResourcetype
  ? entitiesByResourcetype.reduce(
    (controls, entities, typeid) => controls.concat({
      id: `resources.${typeid}`,
      model: `.associatedResourcesByResourcetype.${typeid}`,
      dataPath: ['associatedResourcesByResourcetype', typeid],
      label: contextIntl.formatMessage(appMessages.entities[`resources_${typeid}`].plural),
      controlType: 'multiselect',
      options: entityOptions(entities),
      advanced: true,
      selectAll: true,
      onCreate: onCreateOption
        ? () => onCreateOption({
          path: API.RESOURCES,
          attributes: { resourcetype_id: typeid },
        })
        : null,
    }),
    [],
  ).sort((a, b) => a.id > b.id ? 1 : -1)
  : null;

// taxonomies with categories "embedded"
export const renderTaxonomyControl = (
  taxonomies,
  onCreateOption,
  contextIntl,
) => taxonomies
  ? taxonomies.toList().reduce(
    (controls, taxonomy) => controls.concat({
      id: taxonomy.get('id'),
      model: `.associatedTaxonomies.${taxonomy.get('id')}`,
      dataPath: ['associatedTaxonomies', taxonomy.get('id')],
      label: getTaxTitle(parseInt(taxonomy.get('id'), 10), contextIntl),
      controlType: 'multiselect',
      multiple: taxonomy.getIn(['attributes', 'allow_multiple']),
      options: entityOptions(taxonomy.get('categories'), false),
      onCreate: onCreateOption
        ? () => onCreateOption({
          path: API.CATEGORIES,
          attributes: { taxonomy_id: taxonomy.get('id') },
        })
        : null,
    }),
    [],
  )
  : [];

export const renderUserControl = (entities, label, activeUserId) => entities
  ? {
    id: 'users',
    model: '.associatedUser',
    dataPath: ['associatedUser'],
    label,
    controlType: 'multiselect',
    multiple: false,
    options: userOptions(entities, activeUserId),
  }
  : null;

export const renderParentCategoryControl = (entities, label, activeParentId) => entities
  ? {
    id: 'associatedCategory',
    model: '.associatedCategory',
    dataPath: ['associatedCategory'],
    label,
    controlType: 'multiselect',
    multiple: false,
    options: parentCategoryOptions(entities, activeParentId),
  }
  : null;
export const renderParentActionControl = ({
  entities,
  label,
  activeParentId,
  types,
  contextIntl,
}) => entities
  ? {
    id: 'associatedParent',
    model: '.associatedParent',
    dataPath: ['associatedParent'],
    label,
    controlType: 'multiselect',
    multiple: false,
    typeFilter: types && makeTypeFilter(
      types,
      contextIntl,
      'measuretype_id',
      'actiontypes',
    ),
    options: parentActionOptions(entities, activeParentId),
  }
  : null;

const getAssociatedEntities = (entities) => entities
  ? entities.reduce(
    (entitiesAssociated, entity) => {
      if (entity && entity.get('associated')) {
        return entitiesAssociated.set(entity.get('id'), entity.get('associated'));
      }
      return entitiesAssociated;
    },
    Map(),
  )
  : Map();
const getAssociations = (entities) => entities
  ? entities.reduce(
    (entitiesAssociated, entity) => {
      if (entity && entity.get('associated')) {
        return entitiesAssociated.set(entity.get('id'), entity);
      }
      return entitiesAssociated;
    },
    Map(),
  )
  : Map();

const getAssociatedCategories = (taxonomy) => taxonomy.get('categories')
  ? getAssociatedEntities(taxonomy.get('categories'))
  : Map();

export const getCategoryUpdatesFromFormData = ({
  formData,
  taxonomies,
  createKey,
}) => taxonomies && taxonomies.reduce((updates, tax, taxId) => {
  const formCategoryIds = getCheckedValuesFromOptions(formData.getIn(['associatedTaxonomies', taxId]));

  // store associated cats as { [cat.id]: [association.id], ... }
  // then we can use keys for creating new associations and values for deleting
  const associatedCategories = getAssociatedCategories(tax);
  return Map({
    delete: updates.get('delete').concat(
      associatedCategories.reduce(
        (associatedIds, associatedId, catId) => !formCategoryIds.includes(catId)
          ? associatedIds.push(associatedId)
          : associatedIds,
        List(),
      )
    ),
    create: updates.get('create').concat(formCategoryIds.reduce((payloads, catId) => !associatedCategories.has(catId)
      ? payloads.push(Map({
        category_id: catId,
        [createKey]: formData.get('id'),
      }))
      : payloads,
    List())),
  });
}, Map({ delete: List(), create: List() }));

export const getConnectionUpdatesFromFormData = ({
  formData,
  connections,
  connectionAttribute,
  createConnectionKey,
  createKey,
  connectionAttributes,
}) => {
  // console.log('formData', formData && formData.toJS())
  // // console.log(connections && connections.toJS())
  // // console.log(createKey)
  // console.log('connectionAttribute', connectionAttribute)
  // console.log('formData.getIn(connectionAttribute)', formData.getIn(connectionAttribute))
  let formConnectionIds = List();
  let formConnections = List();
  if (formData) {
    if (Array.isArray(connectionAttribute)) {
      // store associated Actions as [ [action.id] ]
      formConnectionIds = getCheckedValuesFromOptions(formData.getIn(connectionAttribute));
      // store associated Actions as [ action ]
      formConnections = getCheckedOptions(formData.getIn(connectionAttribute));
    } else {
      formConnectionIds = getCheckedValuesFromOptions(formData.get(connectionAttribute));
      formConnections = getCheckedOptions(formData.get(connectionAttribute));
    }
  }
  // store associated Actions as { [action.id]: [association.id], ... }
  const previousConnectionIds = getAssociatedEntities(connections);
  // store associated Actions as { [action.id]: association, ... }
  const previousConnections = getAssociations(connections);
  // console.log(previousConnections && previousConnections.toJS())
  // console.log('previousConnectionIds', previousConnectionIds && previousConnectionIds.toJS())
  // console.log('previousConnections', previousConnections && previousConnections.toJS())
  // console.log('formConnectionIds', formConnectionIds && formConnectionIds.toJS())
  // console.log('formConnections', formConnections && formConnections.toJS())

  // connection ids to be deleted / removed in formData
  const deleteListOfIds = previousConnectionIds.reduce(
    (associatedIds, associationId, id) => !formConnectionIds.includes(id)
      ? associatedIds.push(associationId)
      : associatedIds,
    List()
  );

  // new connections / added in formData
  const createList = formConnections.reduce(
    (payloads, connection) => {
      const id = connection.get('value');
      const payload = connection.get('association') || Map();
      if (!previousConnectionIds.has(id)) {
        return payloads.push(
          payload
            .set(createConnectionKey, id)
            .set(createKey, formData.get('id'))
        );
      }
      return payloads;
    },
    List(),
  );
  const updateList = connectionAttributes
    ? formConnections.reduce(
      (payloads, connection) => {
        const id = connection.get('value');
        if (previousConnectionIds.has(id)) {
          const previousConnection = previousConnections.get(id);
          const attributeChanges = connectionAttributes.reduce(
            (memo, attribute) => {
              const previousValue = previousConnection.getIn(['association', attribute]);
              const formValue = connection.getIn(['association', attribute]);
              if (!qe(previousValue, formValue)) {
                return {
                  ...memo,
                  [attribute]: formValue,
                };
              }
              return memo;
            },
            {},
          );

          if (Object.keys(attributeChanges).length > 0) {
            return payloads.push(
              Map({
                id: previousConnectionIds.get(id),
                attributes: {
                  ...previousConnection.get('association').toJS(),
                  ...attributeChanges,
                },
              })
            );
          }
        }
        return payloads;
      },
      List(),
    )
    : List();
  return Map({
    delete: deleteListOfIds,
    create: createList,
    update: updateList,
  });
};


// only show the highest rated role (lower role ids means higher)
export const getHighestUserRoleId = (roles) => roles.reduce((currentHighestRoleId, role) => role.get('associated') && parseInt(role.get('id'), 10) < parseInt(currentHighestRoleId, 10)
  ? role.get('id').toString()
  : currentHighestRoleId.toString(),
USER_ROLES.DEFAULT.value);

export const getRoleFormField = (formatMessage, roleOptions) => ({
  id: 'role',
  controlType: 'select',
  model: '.associatedRole',
  label: formatMessage(appMessages.entities.roles.single),
  options: Object.values(filter(USER_ROLES, (userRole) => roleOptions.map((roleOption) => parseInt(roleOption.get('id'), 10)).includes(userRole.value)
    || userRole.value === USER_ROLES.DEFAULT.value)),
});

export const getStatusField = (formatMessage) => ({
  id: 'status',
  controlType: 'select',
  model: '.attributes.draft',
  label: formatMessage(appMessages.attributes.draft),
  options: PUBLISH_STATUSES,
});

export const getTitleFormField = (formatMessage, controlType = 'title', attribute = 'title', required) => getFormField({
  formatMessage,
  controlType,
  attribute,
  required,
});

export const getReferenceFormField = (formatMessage, required = false, isAutoReference = false) => getFormField({
  formatMessage,
  controlType: 'short',
  attribute: 'reference',
  required,
  label: required ? 'reference' : 'referenceOptional',
  hint: isAutoReference ? formatMessage(appMessages.hints.autoReference) : null,
});
export const getCodeFormField = (formatMessage, att = 'code', required = false) => getFormField({
  formatMessage,
  controlType: 'short',
  attribute: att,
  label: att,
  required,
});

export const getAmountFormField = (formatMessage, required, att = 'amount') => getFormField({
  formatMessage,
  controlType: att,
  attribute: att,
  required,
  hint: formatMessage(appMessages.hints.amount),
  // TODO: validate
});
export const getNumberFormField = (formatMessage, required, att = 'value') => getFormField({
  formatMessage,
  controlType: att,
  attribute: att,
  required,
  hint: appMessages.hints[att] && formatMessage(appMessages.hints[att]),
  // TODO: validate
});
export const getLinkFormField = (formatMessage, required, att = 'url') => getFormField({
  formatMessage,
  controlType: att,
  attribute: att,
  required,
  // TODO: validate
});
export const getShortTitleFormField = (formatMessage) => getFormField({
  formatMessage,
  controlType: 'short',
  attribute: 'short_title',
});

export const getMenuTitleFormField = (formatMessage) => getFormField({
  formatMessage,
  controlType: 'short',
  attribute: 'menu_title',
  required: true,
});

export const getMenuOrderFormField = (formatMessage) => {
  const field = getFormField({
    formatMessage,
    controlType: 'short',
    attribute: 'order',
    required: true,
    hint: appMessages.hints.order && formatMessage(appMessages.hints.order),
  });
  field.validators.number = validateNumber;
  field.errorMessages.number = formatMessage(appMessages.forms.numberError);
  return field;
};

export const getMarkdownFormField = (formatMessage, required, attribute = 'description', label, placeholder, hint) => getFormField({
  formatMessage,
  controlType: 'markdown',
  required,
  attribute,
  label: label || attribute,
  placeholder: placeholder || attribute,
  hint: hint
    ? (appMessages.hints[hint] && formatMessage(appMessages.hints[hint]))
    : (appMessages.hints[attribute] && formatMessage(appMessages.hints[attribute])),
});

// unused
export const getTextareaField = (formatMessage, attribute = 'description', required, type, maxLength = 2000) => getFormField({
  formatMessage,
  controlType: type || 'textarea',
  attribute,
  required,
  maxLength,
});

export const getDateField = (formatMessage, attribute, required = false, label, onChange) => {
  const field = getFormField({
    formatMessage,
    controlType: 'date',
    attribute,
    required,
    label,
    onChange,
  });
  field.validators.date = validateDateFormat;
  field.errorMessages.date = formatMessage(appMessages.forms.dateFormatError, { format: DATE_FORMAT });
  return field;
};

export const getCheckboxField = (formatMessage, attribute, onChange) => (
  {
    id: attribute,
    controlType: 'checkbox',
    model: `.attributes.${attribute}`,
    label: appMessages.attributes[attribute] && formatMessage(appMessages.attributes[attribute]),
    // value: entity && entity.getIn(['attributes', attribute]) ? entity.getIn(['attributes', attribute]) : false,
    changeAction: onChange,
    hint: appMessages.hints[attribute] && formatMessage(appMessages.hints[attribute]),
  });

export const getUploadField = (formatMessage) => getFormField({
  formatMessage,
  controlType: 'uploader',
  attribute: 'document_url',
  placeholder: 'url',
});

export const getEmailField = (formatMessage, model = '.attributes.email') => {
  const field = getFormField({
    formatMessage,
    controlType: 'email',
    attribute: 'email',
    type: 'email',
    required: true,
    model,
  });
  field.validators.email = validateEmailFormat;
  field.errorMessages.email = formatMessage(appMessages.forms.emailFormatError);
  return field;
};

export const getNameField = (formatMessage, model = '.attributes.name') => {
  const field = getFormField({
    formatMessage,
    controlType: 'input',
    attribute: 'name',
    required: true,
    model,
  });
  return field;
};

export const getPasswordField = (formatMessage, model = '.attributes.password') => {
  const field = getFormField({
    formatMessage,
    controlType: 'input',
    attribute: 'password',
    type: 'password',
    required: true,
    model,
  });
  field.validators.passwordLength = (val) => validateMinLength(val, 6);
  field.errorMessages.passwordLength = formatMessage(appMessages.forms.passwordShortError);
  return field;
};

export const getPasswordCurrentField = (formatMessage, model = '.attributes.password') => {
  const field = getFormField({
    formatMessage,
    controlType: 'input',
    attribute: 'password',
    placeholder: 'passwordCurrent',
    type: 'password',
    required: true,
    model,
  });
  // field.validators.email = validateEmailFormat;
  // field.errorMessages.email = formatMessage(appMessages.forms.emailFormatError);
  return field;
};

export const getPasswordNewField = (formatMessage, model = '.attributes.passwordNew') => {
  const field = getFormField({
    formatMessage,
    controlType: 'input',
    attribute: 'passwordNew',
    type: 'password',
    required: true,
    model,
  });
  field.validators.passwordLength = (val) => validateMinLength(val, 6);
  field.errorMessages.passwordLength = formatMessage(appMessages.forms.passwordShortError);
  // field.validators.email = validateEmailFormat;
  // field.errorMessages.email = formatMessage(appMessages.forms.emailFormatError);
  return field;
};

export const getPasswordConfirmationField = (formatMessage, model = '.attributes.passwordConfirmation') => {
  const field = getFormField({
    formatMessage,
    controlType: 'input',
    attribute: 'passwordConfirmation',
    type: 'password',
    required: true,
    model,
  });
  field.validators.passwordLength = (val) => validateMinLength(val, 6);
  field.errorMessages.passwordLength = formatMessage(appMessages.forms.passwordShortError);
  // field.validators.email = validateEmailFormat;
  // field.errorMessages.email = formatMessage(appMessages.forms.emailFormatError);
  return field;
};

export const getFormField = ({
  formatMessage,
  controlType,
  attribute,
  required,
  label,
  placeholder,
  hint,
  onChange,
  type,
  model,
  maxLength = 6000,
}) => {
  const field = {
    id: attribute,
    controlType,
    type,
    model: model || `.attributes.${attribute}`,
    placeholder: appMessages.placeholders[placeholder || attribute] && formatMessage(appMessages.placeholders[placeholder || attribute]),
    label: appMessages.attributes[label || attribute] && formatMessage(appMessages.attributes[label || attribute]),
    validators: {},
    errorMessages: {},
    hint,
  };
  field.validators.maxFieldLength = (val) => validateMaxLength(val, maxLength);
  field.errorMessages.maxFieldLength = formatMessage(appMessages.forms.fieldMaxLengthError, { maxLength });
  if (onChange) {
    field.changeAction = onChange;
  }
  if (required) {
    field.validators.required = typeof required === 'function' ? required : validateRequired;
    field.errorMessages.required = formatMessage(appMessages.forms.fieldRequired);
  }
  return field;
};

const getCategoryFields = (args, formatMessage) => ({
  header: {
    main: [{ // fieldGroup
      fields: [
        getTitleFormField(formatMessage),
      ],
    }],
    aside: args.taxonomy && args.taxonomy.getIn(['attributes', 'tags_users'])
      ? [{
        fields: [
          getCheckboxField(formatMessage, 'user_only'),
          getStatusField(formatMessage),
        ],
      }]
      : [{
        fields: [getStatusField(formatMessage)],
      }],
  },
  body: {
    main: [{
      fields: [getMarkdownFormField(formatMessage)],
    }],
    aside: [{
      fields: [
        (args.categoryParentOptions && args.parentTaxonomy)
          ? renderParentCategoryControl(
            args.categoryParentOptions,
            getEntityTitle(args.parentTaxonomy),
          )
          : null,
      ],
    }],
  },
});

const getActorFields = (formatMessage) => ({
  header: {
    main: [{ // fieldGroup
      fields: [
        getTitleFormField(formatMessage),
      ],
    }],
    aside: [{ // fieldGroup
      fields: [
        getStatusField(formatMessage),
      ],
    }],
  },
  body: {
    main: [{
      fields: [
        getMarkdownFormField(formatMessage),
      ],
    }],
  },
});

const getActionFields = (formatMessage) => ({
  header: {
    main: [{ // fieldGroup
      fields: [
        getTitleFormField(formatMessage),
      ],
    }],
    aside: [{ // fieldGroup
      fields: [
        getStatusField(formatMessage),
      ],
    }],
  },
  body: {
    main: [{
      fields: [
        getMarkdownFormField(formatMessage),
      ],
    }],
    aside: [{ // fieldGroup
      fields: [
        // getDateField(formatMessage, 'target_date'),
        // getTextareaField(formatMessage, 'target_date_comment'),
      ],
    }],
  },
});
const getResourceFields = (formatMessage) => ({
  header: {
    main: [{ // fieldGroup
      fields: [
        getTitleFormField(formatMessage),
      ],
    }],
    aside: [{ // fieldGroup
      fields: [
        getStatusField(formatMessage),
      ],
    }],
  },
  body: {
    main: [{
      fields: [
        getLinkFormField(formatMessage),
        getMarkdownFormField(formatMessage),
      ],
    }],
    aside: [{ // fieldGroup
      fields: [
        getDateField(formatMessage, 'access_date'),
        getDateField(formatMessage, 'publication_date'),
        // getTextareaField(formatMessage, 'target_date_comment'),
      ],
    }],
  },
});

export const getEntityAttributeFields = (path, args, contextIntl) => {
  switch (path) {
    case API.CATEGORIES:
      return getCategoryFields(args.categories, contextIntl.formatMessage);
    case API.ACTIONS:
      return getActionFields(contextIntl.formatMessage);
    case API.ACTORS:
      return getActorFields(contextIntl.formatMessage);
    case API.RESOURCES:
      return getResourceFields(contextIntl.formatMessage);
    default:
      return {};
  }
};
