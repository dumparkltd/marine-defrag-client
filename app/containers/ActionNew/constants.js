/*
 *
 * ActionNew constants
 *
 */
import { fromJS } from 'immutable';
import { API, ACTION_FIELDS } from 'themes/config';
export const SAVE = 'impactoss/ActionNew/SAVE';

export const DEPENDENCIES = [
  API.USER_ROLES,
  API.CATEGORIES,
  API.TAXONOMIES,
  API.ACTIONTYPES,
  API.ACTION_CATEGORIES,
  API.ACTIONTYPE_TAXONOMIES,
  API.ACTORS,
  API.ACTORTYPES,
  API.ACTOR_CATEGORIES,
  API.ACTORTYPE_TAXONOMIES,
];

export const FORM_INITIAL = fromJS({
  id: '',
  attributes: Object.keys(ACTION_FIELDS.ATTRIBUTES).reduce((memo, att) => ({
    ...memo,
    [att]: ACTION_FIELDS.ATTRIBUTES[att].defaultValue || '',
  }), {}),
  associatedTaxonomies: {},
  associatedActorsByActortype: {},
  associatedTargetsByActortype: {},
});
