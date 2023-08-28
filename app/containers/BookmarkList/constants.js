// specify the filter and query  options
import { API } from 'themes/config';

export const DEPENDENCIES = [
  API.BOOKMARKS,
  API.USERS,
  API.USER_ROLES,
  API.PAGES,
];

export const UPDATE_QUERY = 'impactoss/BookmarkList/UPDATE_QUERY';
export const RESET_SEARCH_QUERY = 'impactoss/BookmarkList/RESET_SEARCH_QUERY';
export const SORTBY_CHANGE = 'impactoss/BookmarkList/SORTBY_CHANGE';
export const SORTORDER_CHANGE = 'impactoss/BookmarkList/SORTORDER_CHANGE';

export const SORT_OPTION_DEFAULT = {
  field: 'id',
  order: 'desc',
  type: 'number',
};

export const CONFIG = {
  sorting: [
    {
      attribute: 'id', // proxy for created at
      type: 'number',
      order: 'desc',
      default: true,
    },
    {
      attribute: 'title',
      type: 'string',
      order: 'asc',
    },
    {
      attribute: 'updated_at',
      type: 'date',
      order: 'desc',
    },
  ],
};
