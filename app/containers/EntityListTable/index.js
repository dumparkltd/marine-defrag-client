import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { connect } from 'react-redux';
import styled from 'styled-components';
import isNumber from 'utils/is-number';

import {
  OrderedMap, Map, List, fromJS,
} from 'immutable';

import {
  selectSortByQuery,
  selectSortOrderQuery,
  selectPageItemsQuery,
  selectPageNoQuery,
  selectSearchQuery,
  selectActortypes,
  selectCategories,
  selectResources,
} from 'containers/App/selectors';
import { updateQuery } from 'containers/EntityList/actions';
import EntityListSearch from 'components/EntityListSearch';

import ToggleAllItems from 'components/fields/ToggleAllItems';
import appMessages from 'containers/App/messages';

import Messages from 'components/Messages';
import { filterEntitiesByKeywords } from 'utils/entities';
import qe from 'utils/quasi-equals';

import EntitiesTable from './EntitiesTable';

import EntityListFooter from './EntityListFooter';

import { getPager } from './pagination';
import {
  prepareEntities,
  prepareHeader,
  getListHeaderLabel,
  getSelectedState,
} from './utils';
import messages from './messages';

import {
  updatePage,
  updatePageItems,
  updateSort,
} from './actions';

const ListEntitiesMain = styled.div`
  padding-top: 0.5em;
`;
const ListEntitiesEmpty = styled.div``;
const EntityListSearchWrapper = styled.div`
  padding-top: 1em;
  padding-bottom: 12px;
  @media (min-width: ${(props) => props.theme && props.theme.breakpoints ? props.theme.breakpoints.small : '769px'}) {
    padding-top: 2em;
  }
`;
const CONNECTIONMAX = 5;
const PAGE_SIZE = 20;
const PAGE_SIZE_MAX = 100;

const transformMessage = (msg, entityId, intl) => intl
  ? intl.formatMessage(messages.entityNoLongerPresent, { entityId })
  : msg;

export function EntityListTable({
  entityIdsSelected,
  config,
  columns,
  onEntityClick,
  canEdit,
  onEntitySelect,
  entityTitle,
  onEntitySelectAll,
  entities,
  errors,
  categories,
  connections,
  entityPath,
  url,
  paginate,
  moreLess,
  onSort,
  onDismissError,
  onPageSelect,
  onPageItemsSelect,
  sortBy,
  sortOrder,
  pageItems,
  pageNo,
  intl,
  onResetScroll,
  searchQuery = '',
  onSearch,
  hasSearch,
  inSingleView,
  label,
  actortypes,
  taxonomies,
  resources,
}) {
  const [showAllConnections, setShowAllConnections] = useState(false);

  // filter entitities by keyword
  const searchAttributes = (
    config.views
    && config.views.list
    && config.views.list.search
  ) || ['title'];

  let searchedEntities = entities;

  if (hasSearch && searchQuery.length > 2) {
    searchedEntities = filterEntitiesByKeywords(
      searchedEntities,
      searchQuery,
      searchAttributes,
    );
  }

  // warning converting List to Array
  const entityRows = prepareEntities({
    entities: searchedEntities,
    columns,
    config,
    connections,
    categories,
    intl,
    entityIdsSelected,
    url,
    entityPath,
    onEntityClick,
    onEntitySelect,
    actortypes,
    taxonomies,
    resources,
  });
  const errorsWithoutEntities = errors && errors.filter(
    (error, id) => !searchedEntities.find((entity) => qe(entity.get('id'), id))
  );
  // sort entities
  const sortOption = sortBy || 'main';
  const sortedEntities = inSingleView
    ? entityRows
    : entityRows && entityRows.sort(
      (a, b) => {
        const aSortValue = a[sortOption] && a[sortOption].sortValue;
        const aHasSortValue = aSortValue || isNumber(aSortValue);
        const bSortValue = b[sortOption] && b[sortOption].sortValue;
        const bHasSortValue = bSortValue || isNumber(bSortValue);
        // always prefer values over none, regardless of order
        if (aHasSortValue && !bHasSortValue) {
          return -1;
        }
        if (bHasSortValue && !aHasSortValue) {
          return 1;
        }
        let result;
        if (aHasSortValue && bHasSortValue) {
          if (isNumber(aSortValue) && !isNumber(bSortValue)) {
            result = -1;
          } else if (isNumber(bSortValue) && !isNumber(aSortValue)) {
            result = 1;
          } else if (
            isNumber(bSortValue)
            && isNumber(aSortValue)
            && a[sortOption].type !== 'amount'
            && a[sortOption].type !== 'amount'
          ) {
            result = aSortValue < bSortValue ? 1 : -1;
          } else {
            result = aSortValue > bSortValue ? 1 : -1;
          }
        }
        return sortOrder === 'desc' ? result * -1 : result;
      }
    );

  let pageSize = PAGE_SIZE_MAX;
  let entitiesOnPage = sortedEntities;
  let pager;
  const isSortedOrPaged = !!pageNo || !!pageItems || !!sortBy || !!sortOrder;
  if (paginate) {
    if (pageItems) {
      if (pageItems === 'all') {
        pageSize = sortedEntities.length;
      } else {
        pageSize = Math.min(
          (pageItems && parseInt(pageItems, 10)),
          PAGE_SIZE_MAX
        );
      }
    } else {
      pageSize = Math.min(PAGE_SIZE, PAGE_SIZE_MAX);
    }
    // grouping and paging
    // if grouping required
    if (sortedEntities.length > pageSize) {
      // get new pager object for specified page
      pager = getPager(
        sortedEntities.length,
        pageNo && parseInt(pageNo, 10),
        pageSize
      );
      entitiesOnPage = sortedEntities.slice(pager.startIndex, pager.endIndex + 1);
    }
  } else if (moreLess) {
    entitiesOnPage = showAllConnections
      ? sortedEntities
      : (sortedEntities.slice(0, CONNECTIONMAX));
  }
  const entityIdsOnPage = entitiesOnPage.map((entity) => entity.id);

  const headerColumns = (label || !inSingleView) && prepareHeader({
    columns,
    // config,
    sortBy: sortOption,
    sortOrder,
    onSort: !inSingleView && onSort,
    onSelectAll: (checked) => canEdit
      && onEntitySelectAll(checked ? entityIdsOnPage : []),
    selectedState: canEdit && getSelectedState(
      entityIdsSelected.size,
      entityIdsOnPage.length === entityIdsSelected.size,
    ),
    title: label || getListHeaderLabel({
      intl,
      entityTitle,
      pageTotal: entityIdsOnPage.length,
      entitiesTotal: sortedEntities.length,
      selectedTotal: canEdit && entityIdsSelected && entityIdsSelected.size,
      allSelectedOnPage: canEdit && entityIdsOnPage.length === entityIdsSelected.size,
      messages,
    }),
    intl,
  });
  return (
    <div>
      {hasSearch && (
        <EntityListSearchWrapper>
          <EntityListSearch
            searchQuery={searchQuery}
            onSearch={onSearch}
          />
        </EntityListSearchWrapper>
      )}
      <EntitiesTable
        entities={entitiesOnPage}
        columns={columns}
        headerColumns={headerColumns}
        canEdit={canEdit}
        onEntityClick={onEntityClick}
      />
      <ListEntitiesMain>
        {entityIdsOnPage.length === 0
          && isSortedOrPaged
          && (!errors || errors.size === 0)
          && (
            <ListEntitiesEmpty>
              <FormattedMessage {...messages.listEmptyAfterQuery} />
            </ListEntitiesEmpty>
          )
        }
        {entityIdsOnPage.length === 0
          && !isSortedOrPaged
          && (!errors || errors.size === 0)
          && (
            <ListEntitiesEmpty>
              <FormattedMessage {...messages.listEmpty} />
            </ListEntitiesEmpty>
          )
        }
        {entityIdsOnPage.length === 0
          && isSortedOrPaged
          && errorsWithoutEntities
          && errorsWithoutEntities.size > 0
          && errors
          && errors.size > 0
          && (
            <ListEntitiesEmpty>
              <FormattedMessage {...messages.listEmptyAfterQueryAndErrors} />
            </ListEntitiesEmpty>
          )
        }
        {errorsWithoutEntities
          && errorsWithoutEntities.size > 0
          && !isSortedOrPaged
          && errorsWithoutEntities.map((entityErrors, entityId) => (
            entityErrors.map((updateError, i) => (
              <Messages
                key={i}
                type="error"
                messages={updateError
                  .getIn(['error', 'messages'])
                  .map((msg) => transformMessage(msg, entityId, intl))
                  .valueSeq()
                  .toArray()
                }
                onDismiss={() => onDismissError(updateError.get('key'))}
                preMessage={false}
              />
            ))
          )).toList()
        }
      </ListEntitiesMain>
      {entitiesOnPage.length > 0 && paginate && (
        <EntityListFooter
          pageSize={pageItems === 'all' ? 'all' : pageSize}
          pager={pager}
          onPageSelect={(page) => {
            onResetScroll();
            onPageSelect(page);
          }}
          onPageItemsSelect={(no) => {
            onResetScroll();
            onPageItemsSelect(no);
          }}
        />
      )}
      {moreLess && searchedEntities.size > CONNECTIONMAX && (
        <ToggleAllItems
          onClick={() => setShowAllConnections(!showAllConnections)}
        >
          {showAllConnections && (
            <FormattedMessage {...appMessages.entities.showLess} />
          )}
          {!showAllConnections && (
            <FormattedMessage {...appMessages.entities.showAll} />
          )}
        </ToggleAllItems>
      )}
    </div>
  );
}

EntityListTable.propTypes = {
  entities: PropTypes.instanceOf(List),
  categories: PropTypes.instanceOf(Map),
  resources: PropTypes.instanceOf(Map),
  taxonomies: PropTypes.instanceOf(Map),
  actortypes: PropTypes.instanceOf(OrderedMap),
  connections: PropTypes.instanceOf(Map),
  entityIdsSelected: PropTypes.instanceOf(List),
  // locationQuery: PropTypes.instanceOf(Map),
  errors: PropTypes.instanceOf(Map),
  // showValueForAction: PropTypes.instanceOf(Map),
  entityTitle: PropTypes.object,
  config: PropTypes.object,
  columns: PropTypes.array,
  canEdit: PropTypes.bool,
  onPageSelect: PropTypes.func,
  onPageItemsSelect: PropTypes.func,
  onEntityClick: PropTypes.func.isRequired,
  onEntitySelect: PropTypes.func,
  onEntitySelectAll: PropTypes.func,
  onSort: PropTypes.func,
  onDismissError: PropTypes.func,
  onResetScroll: PropTypes.func,
  showCode: PropTypes.bool,
  inSingleView: PropTypes.bool,
  paginate: PropTypes.bool,
  moreLess: PropTypes.bool,
  entityPath: PropTypes.string,
  url: PropTypes.string,
  intl: intlShape,
  sortBy: PropTypes.string,
  sortOrder: PropTypes.string,
  pageItems: PropTypes.string,
  pageNo: PropTypes.string,
  searchQuery: PropTypes.string,
  onSearch: PropTypes.func,
  hasSearch: PropTypes.bool,
  label: PropTypes.string,
};

const mapStateToProps = (state) => ({
  sortBy: selectSortByQuery(state),
  sortOrder: selectSortOrderQuery(state),
  pageItems: selectPageItemsQuery(state),
  pageNo: selectPageNoQuery(state),
  searchQuery: selectSearchQuery(state),
  actortypes: selectActortypes(state),
  categories: selectCategories(state),
  resources: selectResources(state),
});
function mapDispatchToProps(dispatch) {
  return {
    onPageSelect: (page) => {
      dispatch(updatePage(page));
    },
    onPageItemsSelect: (no) => {
      dispatch(updatePageItems(no));
    },
    onSort: (sort, order) => {
      dispatch(updateSort({ sort, order }));
    },
    onSearch: (value) => {
      dispatch(updateQuery(fromJS([
        {
          query: 'search',
          value,
          replace: true,
          checked: value !== '',
        },
      ])));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(EntityListTable));
