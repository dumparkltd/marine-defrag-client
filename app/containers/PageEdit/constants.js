/*
 *
 * PageEdit constants
 *
 */
import { fromJS } from 'immutable';
import { API } from 'themes/config';
export const SAVE = 'impactoss/PageEdit/SAVE';

export const DEPENDENCIES = [
  API.PAGES,
  API.USERS,
  API.USER_ROLES,
  API.PAGES,
];

export const FORM_INITIAL = fromJS({
  id: '',
  attributes: {
    title: '',
    content: '',
    menu_title: '',
    draft: '',
    order: '',
  },
});
