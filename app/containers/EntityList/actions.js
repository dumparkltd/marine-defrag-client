/*
 *
 * EntityListForm actions
 *
 */

import {
  SHOW_PANEL,
  SAVE,
  SAVE_MULTIPLE,
  NEW_CONNECTION,
  NEW_MULTIPLE_CONNECTIONS,
  DELETE_CONNECTION,
  DELETE_MULTIPLE_CONNECTIONS,
  RESET_STATE,
  RESET_PROGRESS,
  ENTITY_SELECTED,
  ENTITIES_SELECT,
  UPDATE_QUERY,
  UPDATE_GROUP,
  PATH_CHANGE,
  DISMISS_ERROR,
  DISMISS_ALL_ERRORS,
  RESET_FILTERS,
} from './constants';

export function setClientPath(path) {
  return {
    type: PATH_CHANGE,
    path,
  };
}
export function showPanel(activePanel) {
  return {
    type: SHOW_PANEL,
    activePanel,
  };
}

export function save(data) {
  return {
    type: SAVE,
    data,
  };
}
export function saveMultiple(path, data) {
  return {
    type: SAVE_MULTIPLE,
    path,
    data,
  };
}
export function newConnection(data) {
  return {
    type: NEW_CONNECTION,
    data,
  };
}
export function newMultipleConnections(path, data) {
  return {
    type: NEW_MULTIPLE_CONNECTIONS,
    path,
    data,
  };
}
export function deleteConnection(data) {
  return {
    type: DELETE_CONNECTION,
    data,
  };
}
export function deleteMultipleConnections(path, data) {
  return {
    type: DELETE_MULTIPLE_CONNECTIONS,
    path,
    data,
  };
}

export function resetState(path) {
  return {
    type: RESET_STATE,
    path,
  };
}

export function resetProgress() {
  return {
    type: RESET_PROGRESS,
  };
}

export function selectEntity(data) {
  return {
    type: ENTITY_SELECTED,
    data,
  };
}

export function selectMultipleEntities(ids) {
  return {
    type: ENTITIES_SELECT,
    ids,
  };
}

export function updateQuery(value) {
  return {
    type: UPDATE_QUERY,
    value,
  };
}

export function resetFilters(values) {
  return {
    type: RESET_FILTERS,
    values,
  };
}

export function updateGroup(value) {
  return {
    type: UPDATE_GROUP,
    value,
  };
}

export function dismissError(key) {
  return {
    type: DISMISS_ERROR,
    key,
  };
}
export function dismissAllErrors(key) {
  return {
    type: DISMISS_ALL_ERRORS,
    key,
  };
}
