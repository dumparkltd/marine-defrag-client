/*
 *
 * Taxonomies
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';

// containers
import { loadEntitiesIfNeeded, updatePath } from 'containers/App/actions';
import {
  selectTaxonomiesSorted,
  selectReady,
  selectIsUserManager,
  selectActortypes,
} from 'containers/App/selectors';
import { CONTENT_LIST } from 'containers/App/constants';
import { ROUTES } from 'themes/config';
import appMessages from 'containers/App/messages';

// components
import ContainerWithSidebar from 'components/styled/Container/ContainerWithSidebar';
import Container from 'components/styled/Container';
import Content from 'components/styled/Content';
import Loading from 'components/Loading';

import ContentHeader from 'components/ContentHeader';
import CategoryListItems from 'components/categoryList/CategoryListItems';
import TaxonomySidebar from 'components/categoryList/TaxonomySidebar';
import EntityListSidebarLoading from 'components/EntityListSidebarLoading';

// relative
import messages from './messages';
import { DEPENDENCIES, SORT_OPTIONS } from './constants';
import {
  selectTaxonomy,
  selectCategoryGroups,
  selectUserOnlyCategoryGroups,
} from './selectors';
import { updateSort } from './actions';

const UsersOnly = styled.h4`
  margin-top: 4em;
`;
const Description = styled.p`
  margin-bottom: 2em;
  font-size: 1em;
  @media print {
    font-size: ${(props) => props.theme.sizes.print.default};
  }
`;
const DEFAULT_TAX = '1';

export class CategoryList extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  // make sure to load all data from server
  UNSAFE_componentWillMount() {
    this.props.loadEntitiesIfNeeded();
    // redirect to default taxonomy if needed
    if (this.props.dataReady && typeof this.props.taxonomy === 'undefined') {
      this.props.redirectToDefaultTaxonomy(DEFAULT_TAX);
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    // reload entities if invalidated
    if (!nextProps.dataReady) {
      this.props.loadEntitiesIfNeeded();
    }
    // redirect to default taxonomy if needed
    if (nextProps.dataReady && typeof nextProps.taxonomy === 'undefined') {
      this.props.redirectToDefaultTaxonomy(DEFAULT_TAX);
    }
  }

  /* eslint-disable react/destructuring-assignment */
  getTaxTitle = (id) => this.context.intl.formatMessage(appMessages.entities.taxonomies[id].plural);

  getTaxDescription = (id) => this.context.intl.formatMessage(appMessages.entities.taxonomies[id].description);

  getTaxButtonTitle = (id) => this.context.intl.formatMessage(
    appMessages.entities.taxonomies[id].shortSingle || appMessages.entities.taxonomies[id].single
  );
  /* eslint-enable react/destructuring-assignment */

  render() {
    const { intl } = this.context;
    const {
      taxonomy,
      taxonomies,
      categoryGroups,
      userOnlyCategoryGroups,
      dataReady,
      isManager,
      onPageLink,
      onTaxonomyLink,
      actortypes,
    } = this.props;
    const reference = taxonomy && taxonomy.get('id');
    const contentTitle = (taxonomy && typeof reference !== 'undefined') ? this.getTaxTitle(reference) : '';
    const contentDescription = (taxonomy && typeof reference !== 'undefined') && this.getTaxDescription(reference);
    const buttons = [];

    if (dataReady) {
      buttons.push({
        type: 'icon',
        onClick: () => window.print(),
        title: 'Print',
        icon: 'print',
      });
      if (isManager && typeof reference !== 'undefined') {
        buttons.push({
          type: 'add',
          title: [
            intl.formatMessage(appMessages.buttons.add),
            {
              title: this.getTaxButtonTitle(reference),
              hiddenSmall: true,
            },
          ],
          onClick: () => this.props.handleNew(reference),
        });
      }
    }

    const hasUserCategories = isManager
      && dataReady
      && userOnlyCategoryGroups
      && userOnlyCategoryGroups.reduce((memo, group) => memo || (group.get('categories') && group.get('categories').size > 0),
        false);

    return (
      <div>
        <Helmet
          title={`${intl.formatMessage(messages.supTitle)}: ${contentTitle}`}
          meta={[
            { name: 'description', content: intl.formatMessage(messages.metaDescription) },
          ]}
        />
        { !dataReady
          && <EntityListSidebarLoading responsiveSmall />
        }
        { taxonomies && actortypes && typeof reference !== 'undefined'
          && (
            <TaxonomySidebar
              taxonomies={taxonomies}
              active={reference}
              actortypes={actortypes}
              onTaxonomyLink={onTaxonomyLink}
            />
          )
        }
        <ContainerWithSidebar sidebarResponsiveSmall>
          <Container>
            <Content>
              <ContentHeader
                type={CONTENT_LIST}
                icon="categories"
                supTitle={intl.formatMessage(messages.supTitle)}
                title={contentTitle}
                buttons={buttons}
              />
              { contentDescription
                && <Description>{contentDescription}</Description>
              }
              { !dataReady
                && <Loading />
              }
              { dataReady && taxonomy
                && (
                  <CategoryListItems
                    taxonomy={taxonomy}
                    actortypes={actortypes}
                    categoryGroups={categoryGroups}
                    onPageLink={onPageLink}
                    onSort={this.props.onSort}
                    sortOptions={SORT_OPTIONS}
                    sortBy={this.props.location.query && this.props.location.query.sort}
                    sortOrder={this.props.location.query && this.props.location.query.order}
                  />
                )
              }
              { hasUserCategories
                && (
                  <UsersOnly>
                    <FormattedMessage {...messages.usersOnly} />
                  </UsersOnly>
                )
              }
              { dataReady && taxonomy && hasUserCategories
                && (
                  <CategoryListItems
                    taxonomy={taxonomy}
                    actortypes={actortypes}
                    categoryGroups={userOnlyCategoryGroups}
                    onPageLink={onPageLink}
                    onSort={this.props.onSort}
                    sortOptions={SORT_OPTIONS}
                    sortBy="title"
                    sortOrder={this.props.location.query && this.props.location.query.order}
                    userOnly
                  />
                )
              }
            </Content>
          </Container>
        </ContainerWithSidebar>
      </div>
    );
  }
}
CategoryList.propTypes = {
  loadEntitiesIfNeeded: PropTypes.func,
  redirectToDefaultTaxonomy: PropTypes.func,
  onPageLink: PropTypes.func,
  onTaxonomyLink: PropTypes.func,
  onSort: PropTypes.func,
  handleNew: PropTypes.func,
  taxonomy: PropTypes.object,
  taxonomies: PropTypes.object,
  categoryGroups: PropTypes.object,
  userOnlyCategoryGroups: PropTypes.object,
  dataReady: PropTypes.bool,
  isManager: PropTypes.bool,
  location: PropTypes.object,
  actortypes: PropTypes.object,
};

CategoryList.contextTypes = {
  intl: PropTypes.object.isRequired,
};

const mapStateToProps = (state, props) => ({
  actortypes: selectActortypes(state),
  isManager: selectIsUserManager(state),
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  taxonomies: selectTaxonomiesSorted(state),
  taxonomy: selectTaxonomy(state, { id: props.params.id }),
  categoryGroups: selectCategoryGroups(
    state,
    {
      id: typeof props.params.id !== 'undefined' ? props.params.id : DEFAULT_TAX,
    },
  ),
  userOnlyCategoryGroups: selectUserOnlyCategoryGroups(
    state,
    {
      id: typeof props.params.id !== 'undefined' ? props.params.id : DEFAULT_TAX,
    },
  ),
});

function mapDispatchToProps(dispatch) {
  return {
    loadEntitiesIfNeeded: () => {
      DEPENDENCIES.forEach((path) => dispatch(loadEntitiesIfNeeded(path)));
    },
    redirectToDefaultTaxonomy: (taxonomyId) => {
      dispatch(updatePath(`${ROUTES.TAXONOMIES}/${taxonomyId}`, { replace: true }));
    },
    handleNew: (taxonomyId) => {
      dispatch(updatePath(`${ROUTES.TAXONOMIES}/${taxonomyId}${ROUTES.NEW}`, { replace: true }));
    },
    onPageLink: (path) => {
      dispatch(updatePath(path));
    },
    onTaxonomyLink: (path) => {
      dispatch(updatePath(path, { keepQuery: true }));
    },
    onSort: (sort, order) => {
      dispatch(updateSort({ sort, order }));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(CategoryList);
