/*
 *
 * ActorEdit constants
 *
 */
import { fromJS } from 'immutable';
import { API, RESOURCE_FIELDS } from 'themes/config';
export const SAVE = 'impactoss/ActorEdit/SAVE';

export const DEPENDENCIES = [
  API.USERS,
  API.USER_ROLES,
  API.CATEGORIES,
  API.TAXONOMIES,
  API.RESOURCES,
  API.ACTIONS,
  API.RESOURCETYPES,
  API.ACTIONTYPES,
  API.ACTIONTYPE_TAXONOMIES,
  API.ACTION_ACTORS,
  API.ACTION_RESOURCES,
  API.ACTION_CATEGORIES,
  API.PAGES,
];

export const FORM_INITIAL = fromJS({
  id: '',
  attributes: Object.keys(RESOURCE_FIELDS.ATTRIBUTES).reduce((memo, att) => ({
    ...memo,
    [att]: RESOURCE_FIELDS.ATTRIBUTES[att].defaultValue || '',
  }), {}),
  associatedActionsByActiontype: [],
});
