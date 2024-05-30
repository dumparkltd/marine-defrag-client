import { createSelector } from 'reselect';

export const selectDomain = createSelector(
  (state) => state.get('feedbackNew'),
  (substate) => substate
);
