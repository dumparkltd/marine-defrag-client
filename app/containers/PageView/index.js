/*
 *
 * PageView
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { FormattedMessage } from 'react-intl';
import styled from 'styled-components';
import { palette } from 'styled-theme';

import {
  loadEntitiesIfNeeded,
  updatePath,
  // closeEntity
} from 'containers/App/actions';

import { CONTENT_PAGE } from 'containers/App/constants';
import { ROUTES } from 'themes/config';

import Footer from 'containers/Footer';
import Loading from 'components/Loading';
import Container from 'components/styled/Container';
import ContainerWrapper from 'components/styled/Container/ContainerWrapper';
import ContentHeader from 'components/ContentHeader';
import EntityView from 'components/EntityView';

import {
  selectReady,
  selectIsUserAdmin,
  selectIsUserAnalyst,
  selectIsUserManager,
} from 'containers/App/selectors';

import {
  getStatusField,
  getMetaField,
  getMarkdownField,
} from 'utils/fields';

import messages from './messages';
import { selectViewEntity } from './selectors';
import { DEPENDENCIES } from './constants';

const Styled = styled(ContainerWrapper)`
  background-color: ${palette('primary', 4)}
`;

const ViewContainer = styled(Container)`
  min-height: 85vH;
  @media print {
    min-height: 50vH;
  }
`;

export class PageView extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  UNSAFE_componentWillMount() {
    this.props.loadEntitiesIfNeeded();
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    // reload entities if invalidated
    if (!nextProps.dataReady) {
      this.props.loadEntitiesIfNeeded();
    }
  }

  getBodyAsideFields = (entity) => ([{
    fields: [
      getStatusField(entity),
      getMetaField(entity),
    ],
  }]);

  getBodyMainFields = (entity) => ([{
    fields: [getMarkdownField(entity, 'content', false)],
  }]);

  getFields = (entity, isAdmin) => ({
    body: {
      main: this.getBodyMainFields(entity),
      aside: isAdmin
        ? this.getBodyAsideFields(entity)
        : null,
    },
  })


  render() {
    const { intl } = this.context;
    const {
      page, dataReady, isAdmin, isAnalyst, isManager,
    } = this.props;
    const buttons = [];
    if (dataReady) {
      buttons.push({
        type: 'icon',
        onClick: () => window.print(),
        title: 'Print',
        icon: 'print',
      });
      if (isAdmin) {
        buttons.push({
          type: 'edit',
          onClick: this.props.handleEdit,
        });
      }
    }

    return (
      <div>
        <Helmet
          title={page ? page.getIn(['attributes', 'title']) : `${intl.formatMessage(messages.pageTitle)}: ${this.props.params.id}`}
          meta={[
            { name: 'description', content: intl.formatMessage(messages.metaDescription) },
          ]}
        />
        <Styled className={`content-${CONTENT_PAGE}`}>
          <ViewContainer isNarrow={!isAnalyst}>
            <ContentHeader
              title={page ? page.getIn(['attributes', 'title']) : ''}
              type={CONTENT_PAGE}
              buttons={buttons}
            />
            { !dataReady
              && <Loading />
            }
            { !page && dataReady
              && (
                <div>
                  <FormattedMessage {...messages.notFound} />
                </div>
              )
            }
            { page && dataReady
              && (
                <EntityView
                  fields={this.getFields(page, isManager)}
                  seamless
                />
              )
            }
          </ViewContainer>
          <Footer />
        </Styled>
      </div>
    );
  }
}

PageView.propTypes = {
  loadEntitiesIfNeeded: PropTypes.func,
  handleEdit: PropTypes.func,
  // handleClose: PropTypes.func,
  page: PropTypes.object,
  dataReady: PropTypes.bool,
  isAdmin: PropTypes.bool,
  isAnalyst: PropTypes.bool,
  isManager: PropTypes.bool,
  params: PropTypes.object,
};

PageView.contextTypes = {
  intl: PropTypes.object.isRequired,
};


const mapStateToProps = (state, props) => ({
  isAdmin: selectIsUserAdmin(state),
  isManager: selectIsUserManager(state),
  isAnalyst: selectIsUserAnalyst(state),
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  page: selectViewEntity(state, props.params.id),
});

function mapDispatchToProps(dispatch, props) {
  return {
    loadEntitiesIfNeeded: () => {
      DEPENDENCIES.forEach((path) => dispatch(loadEntitiesIfNeeded(path)));
    },
    handleEdit: () => {
      dispatch(updatePath(`${ROUTES.PAGES}${ROUTES.EDIT}/${props.params.id}`, { replace: true }));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PageView);
