/*
 * EntityListHeader Messages
 *
 */
import { defineMessages } from 'react-intl';

export default defineMessages({
  header: {
    filter: {
      id: 'app.components.EntityListHeader.header.filter',
      defaultMessage: 'Filter List',
    },
    edit: {
      id: 'app.components.EntityListHeader.header.editedit',
      defaultMessage: 'Edit selected items',
    },
  },
  listOptions: {
    showFilter: {
      id: 'app.components.EntityListHeader.listOptions.showFilter',
      defaultMessage: 'Show filter options',
    },
    showEditOptions: {
      id: 'app.components.EntityListHeader.listOptions.showEditOptions',
      defaultMessage: 'Show edit options',
    },
  },
  groupExpand: {
    show: {
      id: 'app.components.EntityListHeader.groupExpand.show',
      defaultMessage: 'Show group',
    },
    hide: {
      id: 'app.components.EntityListHeader.groupExpand.hide',
      defaultMessage: 'Hide group',
    },
  },
  groupOptionSelect: {
    show: {
      id: 'app.components.EntityListHeader.groupOptionSelect.show',
      defaultMessage: 'Show options',
    },
    hide: {
      id: 'app.components.EntityListHeader.groupOptionSelect.hide',
      defaultMessage: 'Hide options',
    },
  },
  filterGroupLabel: {
    attributes: {
      id: 'app.components.EntityListHeader.filterGroupLabel.attributes',
      defaultMessage: 'By attribute',
    },
    actortypes: {
      id: 'app.components.EntityListHeader.filterGroupLabel.actortypes',
      defaultMessage: 'By actortype',
    },
    taxonomies: {
      id: 'app.components.EntityListHeader.filterGroupLabel.taxonomies',
      defaultMessage: 'By category',
    },
    taxonomiesByActortype: {
      id: 'app.components.EntityListHeader.filterGroupLabel.taxonomiesByActortype',
      defaultMessage: 'By category ({actortype})',
    },
    connections: {
      id: 'app.components.EntityListHeader.filterGroupLabel.connections',
      defaultMessage: 'By connection',
    },
    'connections-action-actors': {
      id: 'app.components.EntityListHeader.filterGroupLabel.connections-action-actors',
      defaultMessage: 'By connection',
    },
    'connections-action-targets': {
      id: 'app.components.EntityListHeader.filterGroupLabel.connections-action-targets',
      defaultMessage: 'By connection',
    },
    'connections-actor-actions': {
      id: 'app.components.EntityListHeader.filterGroupLabel.connections-actor-actions',
      defaultMessage: 'By connection',
    },
    'connections-target-actions': {
      id: 'app.components.EntityListHeader.filterGroupLabel.connections-target-actions',
      defaultMessage: 'By connection',
    },
    'connections-association-members': {
      id: 'app.components.EntityListHeader.filterGroupLabel.connections-association-members',
      defaultMessage: 'By member',
    },
    'connections-member-associations': {
      id: 'app.components.EntityListHeader.filterGroupLabel.connections-member-associations',
      defaultMessage: 'By membership',
    },
    'connections-action-parents': {
      id: 'app.components.EntityListHeader.filterGroupLabel.connections-action-parents',
      defaultMessage: 'By parent activity',
    },
    'connections-action-resources': {
      id: 'app.components.EntityListHeader.filterGroupLabel.connections-action-resources',
      defaultMessage: 'By resource',
    },
    connectedTaxonomies: {
      id: 'app.components.EntityListHeader.filterGroupLabel.connectedTaxonomies',
      defaultMessage: 'By connected category',
    },
  },
  editGroupLabel: {
    attributes: {
      id: 'app.components.EntityListHeader.editGroupLabel.attributes',
      defaultMessage: 'Update attributes',
    },
    taxonomies: {
      id: 'app.components.EntityListHeader.editGroupLabel.taxonomies',
      defaultMessage: 'Update categories',
    },
    connections: {
      id: 'app.components.EntityListHeader.editGroupLabel.connections',
      defaultMessage: 'Update connections',
    },
    'connections-action-actors': {
      id: 'app.components.EntityListHeader.editGroupLabel.connections-action-actors',
      defaultMessage: 'Update actors',
    },
    'connections-action-targets': {
      id: 'app.components.EntityListHeader.editGroupLabel.connections-action-targets',
      defaultMessage: 'Update targets',
    },
    'connections-actor-actions': {
      id: 'app.components.EntityListHeader.editGroupLabel.connections-actor-actions',
      defaultMessage: 'Update activities',
    },
    'connections-association-members': {
      id: 'app.components.EntityListHeader.editGroupLabel.connections-association-members',
      defaultMessage: 'Update members',
    },
    'connections-member-associations': {
      id: 'app.components.EntityListHeader.editGroupLabel.connections-member-associations',
      defaultMessage: 'Update memberships',
    },
    'connections-target-actions': {
      id: 'app.components.EntityListHeader.editGroupLabel.connections-target-actions',
      defaultMessage: 'Update activities',
    },
    'connections-action-resources': {
      id: 'app.components.EntityListHeader.editGroupLabel.connections-action-resources',
      defaultMessage: 'Update resources',
    },
  },
  filterFormTitlePrefix: {
    id: 'app.components.EntityListHeader.filterFormTitlePrefix',
    defaultMessage: 'Filter by',
  },
  filterFormWithoutPrefix: {
    id: 'app.components.EntityListHeader.filterFormWithoutPrefix',
    defaultMessage: 'Without',
  },
  editFormTitlePrefix: {
    id: 'app.components.EntityListHeader.editFormTitlePrefix',
    defaultMessage: 'Update',
  },
  editFormTitlePostfix: {
    id: 'app.components.EntityListHeader.editFormTitlePostfix',
    defaultMessage: 'selected',
  },
  entitiesNotFound: {
    id: 'app.components.EntityListHeader.entitiesNotFound',
    defaultMessage: 'No entities found',
  },
  entitiesNotSelected: {
    id: 'app.components.EntityListHeader.entitiesNotSelected',
    defaultMessage: 'Please select one or more entities from the list for available edit options',
  },
  selectType: {
    id: 'app.components.EntityListHeader.selectType',
    defaultMessage: 'Select {types}',
  },
});
