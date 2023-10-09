/*
 *
 * PageView
 *
 */

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import styled from 'styled-components';
import { palette } from 'styled-theme';

import {
  loadEntitiesIfNeeded,
  updatePath,
  printView,
  // closeEntity
} from 'containers/App/actions';

import { keydownHandlerPrint } from 'utils/print';

import { CONTENT_PAGE, PRINT_TYPES } from 'containers/App/constants';
import { ROUTES } from 'themes/config';

import Footer from 'containers/Footer';
import Loading from 'components/Loading';
import Container from 'components/styled/Container';
import ContainerWrapper from 'components/styled/Container/ContainerWrapper';
import EntityView from 'components/EntityView';

import {
  selectReady,
  selectIsUserAdmin,
  selectIsUserAnalyst,
  selectIsUserManager,
  selectIsPrintView,
} from 'containers/App/selectors';

import {
  getStatusField,
  getMetaField,
  getMarkdownField,
} from 'utils/fields';

import messages from './messages';
import { selectViewEntity } from './selectors';
import { DEPENDENCIES } from './constants';

const StyledContainerWrapper = styled((p) => <ContainerWrapper {...p} />)`
  background-color: ${palette('primary', 4)}
`;

const ViewContainer = styled(Container)`
  min-height: ${({ isPrint }) => isPrint ? '50vH' : '85vH'};
  @media print {
    min-height: 50vH;
  }
`;

const getBodyAsideFields = (entity) => ([{
  fields: [
    getStatusField(entity),
    getMetaField(entity),
  ],
}]);

const getBodyMainFields = (entity) => ([{
  fields: [getMarkdownField(entity, 'content', false)],
}]);

const getFields = (entity, isAdmin, isPrint) => ({
  body: {
    main: getBodyMainFields(entity),
    aside: (isAdmin && !isPrint)
      ? getBodyAsideFields(entity)
      : null,
  },
});

export function PageView({
  onLoadEntitiesIfNeeded,
  page,
  dataReady,
  isAdmin,
  isAnalyst,
  isManager,
  params,
  handleEdit,
  isPrintView,
  onSetPrintView,
  intl,
}) {
  useEffect(() => {
    if (!dataReady) onLoadEntitiesIfNeeded();
  }, [dataReady]);

  const mySetPrintView = () => onSetPrintView({
    printType: PRINT_TYPES.SINGLE,
    printOrientation: 'portrait',
    printSize: 'A4',
  });
  const keydownHandler = (e) => {
    keydownHandlerPrint(e, mySetPrintView);
  };
  useEffect(() => {
    document.addEventListener('keydown', keydownHandler);
    return () => {
      document.removeEventListener('keydown', keydownHandler);
    };
  }, []);

  let buttons = [];
  if (dataReady) {
    if (window.print) {
      buttons = [
        ...buttons,
        {
          type: 'icon',
          onClick: () => mySetPrintView(),
          title: 'Print',
          icon: 'print',
        },
      ];
    }
    if (isAdmin) {
      buttons.push({
        type: 'edit',
        onClick: handleEdit,
      });
    }
  }
  return (
    <div>
      <Helmet
        title={page ? page.getIn(['attributes', 'title']) : `${intl.formatMessage(messages.pageTitle)}: ${params.id}`}
        meta={[
          { name: 'description', content: intl.formatMessage(messages.metaDescription) },
        ]}
      />
      <StyledContainerWrapper
        className={`content-${CONTENT_PAGE}`}
      >
        <ViewContainer isNarrow={!isAnalyst} isPrint={isPrintView}>
          {!dataReady && <Loading />}
          {!page && dataReady && (
            <div>
              <FormattedMessage {...messages.notFound} />
            </div>
          )}
          {page && dataReady && (
            <EntityView
              header={{
                title: page ? page.getIn(['attributes', 'title']) : '',
                type: CONTENT_PAGE,
                buttons,
              }}
              fields={getFields(page, isManager, isPrintView)}
              seamless
            />
          )}
        </ViewContainer>
        <Footer />
      </StyledContainerWrapper>
    </div>
  );
}


PageView.propTypes = {
  onLoadEntitiesIfNeeded: PropTypes.func,
  handleEdit: PropTypes.func,
  onSetPrintView: PropTypes.func,
  page: PropTypes.object,
  dataReady: PropTypes.bool,
  isAdmin: PropTypes.bool,
  isAnalyst: PropTypes.bool,
  isManager: PropTypes.bool,
  isPrintView: PropTypes.bool,
  params: PropTypes.object,
  intl: intlShape.isRequired,
};


const mapStateToProps = (state, props) => ({
  isAdmin: selectIsUserAdmin(state),
  isManager: selectIsUserManager(state),
  isAnalyst: selectIsUserAnalyst(state),
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  page: selectViewEntity(state, props.params.id),
  isPrintView: selectIsPrintView(state),
});

function mapDispatchToProps(dispatch, props) {
  return {
    onLoadEntitiesIfNeeded: () => {
      DEPENDENCIES.forEach((path) => dispatch(loadEntitiesIfNeeded(path)));
    },
    handleEdit: () => {
      dispatch(updatePath(`${ROUTES.PAGES}${ROUTES.EDIT}/${props.params.id}`, { replace: true }));
    },
    onSetPrintView: (config) => {
      dispatch(printView(config));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(PageView));
