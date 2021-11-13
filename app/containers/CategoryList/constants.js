import { API } from 'themes/config';

export const DEPENDENCIES = [
  API.USERS,
  API.USER_ROLES,
  API.CATEGORIES,
  API.TAXONOMIES,
  API.ACTIONS,
  API.ACTIONTYPES,
  API.ACTIONTYPE_TAXONOMIES,
  API.ACTION_CATEGORIES,
  API.ACTORS,
  API.ACTORTYPES,
  API.ACTORTYPE_TAXONOMIES,
  API.ACTOR_CATEGORIES,
  API.ACTOR_MEASURES,
];

export const TAXONOMY_DEFAULT = 1;

export const SORT_OPTIONS = [
  {
    query: 'title',
    field: 'referenceThenTitle',
    order: 'asc',
    type: 'string',
    default: 'true',
  },
  {
    query: 'actions',
    field: 'actions',
    type: 'number',
    order: 'desc',
  },
  {
    query: 'actors',
    field: 'actors',
    type: 'number',
    order: 'desc',
  },
];

export const SORT_CHANGE = 'impactoss/CategoryList/SORT_CHANGE';
