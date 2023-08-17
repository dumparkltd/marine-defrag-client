/*
 *
 * ActorNew constants
 *
 */
import { fromJS } from 'immutable';
import { API, RESOURCE_FIELDS } from 'themes/config';

export const SAVE = 'impactoss/ActorNew/SAVE';

export const DEPENDENCIES = [
  API.USER_ROLES,
  API.CATEGORIES,
  API.TAXONOMIES,
  API.RESOURCES,
  API.ACTIONS,
  API.RESOURCETYPES,
  API.ACTIONTYPES,
  API.ACTION_CATEGORIES,
  API.ACTIONTYPE_TAXONOMIES,
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
