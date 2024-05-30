/*
 *
 * FeedbackNew actions
 *
 */

import {
  SAVE,
  RESET_FORM,
} from './constants';

export function save(data, onSuccess) {
  return {
    type: SAVE,
    data,
    onSuccess,
  };
}

export function resetForm() {
  return {
    type: RESET_FORM,
  };
}
