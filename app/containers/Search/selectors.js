import { createSelector } from 'reselect';
import { Map, List, fromJS } from 'immutable';
// import { reduce } from 'lodash/collection';

import {
  selectEntitiesAll,
  selectSearchQuery,
  selectSortByQuery,
  selectSortOrderQuery,
  selectTaxonomies,
  selectReady,
  selectLocationQuery,
} from 'containers/App/selectors';

import { filterEntitiesByKeywords } from 'utils/entities';
import { qe } from 'utils/quasi-equals';

import { sortEntities, getSortOption } from 'utils/sort';

import { CONFIG, DEPENDENCIES } from './constants';


const selectPathQuery = createSelector(
  selectLocationQuery,
  (locationQuery) => locationQuery && locationQuery.get('path')
);

// kicks off series of cascading selectors
export const selectEntitiesByQuery = createSelector(
  (state) => selectReady(state, { path: DEPENDENCIES }),
  selectSearchQuery,
  selectEntitiesAll,
  selectTaxonomies,
  selectPathQuery,
  selectSortByQuery,
  selectSortOrderQuery,
  (ready, searchQuery, allEntities, taxonomies, path, sort, order) => {
    if (!ready) return null;
    // let active = false;// || CONFIG.search[0].targets[0].path;
    return fromJS(CONFIG.search).map((group) => {
      if (group.get('group') === 'taxonomies') {
        return group.set('targets', taxonomies.map((tax) => {
          const categories = allEntities
            .get('categories')
            .filter(
              (cat) => qe(tax.get('id'), cat.getIn(['attributes', 'taxonomy_id']))
            )
            .map(
              (cat) => group.get('search').reduce(
                (memo, attribute) => memo.setIn(
                  ['attributes', attribute.get('as')],
                  tax.getIn(['attributes', attribute.get('attribute')])
                ),
                cat
              )
            );

          const filteredCategories = searchQuery
            ? filterEntitiesByKeywords(
              categories,
              searchQuery,
              group.get('categorySearch').valueSeq().toArray()
            )
            : categories;
          if (
            path === `taxonomies-${tax.get('id')}`
            // || (!path && !active && filteredCategories.size > 0)
          ) {
            const sortOption = getSortOption(group.get('sorting') && group.get('sorting').toJS(), sort);
            return Map()
              .set('path', `taxonomies-${tax.get('id')}`)
              .set('optionPath', `taxonomies-${tax.get('id')}`)
              // .set('icon', `taxonomy_${tax.get('id')}`)
              .set('clientPath', 'category')
              .set('taxId', tax.get('id'))
              .set('active', true)
              .set('sorting', group.get('sorting'))
              .set('results', sortEntities(filteredCategories,
                order || (sortOption ? sortOption.order : 'desc'),
                sort || (sortOption ? sortOption.attribute : 'id'),
                sortOption ? sortOption.type : 'number'));
          }
          return Map()
            .set('path', `taxonomies-${tax.get('id')}`)
            .set('optionPath', `taxonomies-${tax.get('id')}`)
            .set('clientPath', 'category')
            .set('taxId', tax.get('id'))
            .set('results', filteredCategories);
        }));
      }
      return group.set(
        'targets',
        group.get('targets')
          .filter((target) => !!target)
          .reduce(
            (memo, target) => {
              const targetEntties = allEntities.get(target.get('path'));
              // targets grouped by type
              if (target.get('groupByType') && target.get('typeAttribute') && target.get('typePath')) {
                const types = allEntities.get(target.get('typePath'));
                return types.reduce((innerMemo, type) => {
                  const typeEntities = targetEntties
                    .filter(
                      (entity) => qe(
                        entity.getIn(['attributes', target.get('typeAttribute')]),
                        type.get('id'),
                      )
                    );
                  const filteredEntities = searchQuery
                    ? filterEntitiesByKeywords(
                      typeEntities,
                      searchQuery,
                      target.get('search').valueSeq().toArray()
                    )
                    : typeEntities;
                  const typeTargetPath = `${target.get('optionPath') || target.get('path')}_${type.get('id')}`;
                  const typeTarget = target
                    .set('clientPath', target.get('clientPath'))
                    .set('optionPath', typeTargetPath)
                    .set('path', target.get('path'));

                  // if filtered by path
                  if (
                    path === typeTargetPath
                  // || (
                  //   !path
                  //   && !active
                  //   && filteredEntities.size > 0
                  // )
                  ) {
                    // only sort the active entities that will be displayed
                    const sortOption = getSortOption(typeTarget.get('sorting') && typeTarget.get('sorting').toJS(), sort);
                    return innerMemo.push(
                      typeTarget
                        .set('active', true)
                        .set('results', sortEntities(
                          filteredEntities,
                          order || (sortOption ? sortOption.order : 'desc'),
                          sort || (sortOption ? sortOption.attribute : 'id'),
                          sortOption ? sortOption.type : 'number'
                        ))
                    );
                  }
                  return innerMemo.push(typeTarget.set('results', filteredEntities));
                }, memo);
              }

              // regular target
              const filteredEntities = searchQuery
                ? filterEntitiesByKeywords(
                  targetEntties,
                  searchQuery,
                  target.get('search').valueSeq().toArray()
                )
                : allEntities.get(target.get('path'));

              // if filtered by path
              if (
                path === target.get('path')
              // || (
              //   !path
              //   && !active
              //   && filteredEntities.size > 0
              // )
              ) {
                // only sort the active entities that will be displayed
                const sortOption = getSortOption(target.get('sorting') && target.get('sorting').toJS(), sort);
                return memo.push(
                  target
                    .set('active', true)
                    .set('optionPath', target.get('path'))
                    .set('results', sortEntities(
                      filteredEntities,
                      order || (sortOption ? sortOption.order : 'desc'),
                      sort || (sortOption ? sortOption.attribute : 'id'),
                      sortOption ? sortOption.type : 'number'
                    ))
                );
              }
              return memo.push(
                target
                  .set('results', filteredEntities)
                  .set('optionPath', target.get('path'))
              );
            },
            List(),
          )
      );
    });
  }
);
