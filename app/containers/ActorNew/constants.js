/*
 *
 * ActorNew constants
 *
 */
import { fromJS } from 'immutable';
import { API, ACTOR_FIELDS } from 'themes/config';

export const SAVE = 'impactoss/ActorNew/SAVE';

export const DEPENDENCIES = [
  API.USER_ROLES,
  API.CATEGORIES,
  API.TAXONOMIES,
  API.ACTORTYPES,
  API.ACTIONTYPES,
  API.ACTOR_CATEGORIES,
  API.ACTION_CATEGORIES,
  API.ACTORTYPE_TAXONOMIES,
  API.ACTIONTYPE_TAXONOMIES,
  API.ACTIONS,
];

export const FORM_INITIAL = fromJS({
  id: '',
  attributes: Object.keys(ACTOR_FIELDS.ATTRIBUTES).reduce((memo, att) => ({
    ...memo,
    [att]: ACTOR_FIELDS.ATTRIBUTES[att].defaultValue || '',
  }), {}),
  associatedTaxonomies: {},
  associatedActionsByActiontype: [],
});
