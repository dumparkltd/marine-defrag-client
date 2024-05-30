/*
 *
 * FeedbackNew constants
 *
 */
import { fromJS } from 'immutable';
import { API } from 'themes/config';
export const SAVE = 'impactoss/FeedbackNew/SAVE';
export const RESET_FORM = 'impactoss/FeedbackNew/RESET_FORM';

export const DEPENDENCIES = [API.USER_ROLES];

export const FORM_INITIAL = fromJS({
  attributes: {
    subject: '',
    message_content: '', // map top content
  },
});
