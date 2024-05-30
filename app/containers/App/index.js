/**
 *
 * App.js
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import ReactModal from 'react-modal';
import GlobalStyle from 'global-styles';

import styled from 'styled-components';
import Header from 'components/Header';
import EntityNew from 'containers/EntityNew';
import PrintUI from 'containers/PrintUI';

import { sortEntities } from 'utils/sort';
import { ROUTES, API, PRINT } from 'themes/config';

import {
  selectIsSignedIn,
  selectIsUserManager,
  selectIsUserAnalyst,
  selectSessionUserAttributes,
  // selectReady,
  selectEntitiesWhere,
  selectNewEntityModal,
  selectIsPrintView,
  selectPrintConfig,
} from './selectors';

import {
  validateToken,
  // loadEntitiesIfNeeded,
  updatePath,
  openNewEntityModal,
} from './actions';

// import { DEPENDENCIES } from './constants';

import { PrintContext } from './PrintContext';
import messages from './messages';

const Main = styled.div`
  position: ${({ isHome, isPrintView }) => {
    if (isPrintView) {
      return 'absolute';
    }
    if (isHome) {
      return 'absolute';
    }
    return 'absolute';
  }};
  top: ${({ isHome, theme }) => isHome
    ? 0
    : theme.sizes.header.banner.heightMobile
}px;
  left: 0;
  right: 0;
  bottom:0;
  overflow-x: ${({ isPrint }) => isPrint ? 'auto' : 'hidden'};
  overflow-y: auto;
  width: auto;
  overflow-y: auto;
  @media (min-width: ${({ theme }) => theme.breakpoints.medium}) {
    top: ${({ isHome, theme }) => isHome
    ? 0
    : theme.sizes.header.banner.height
}px;
  }
  @media print {
    background: transparent;
    position: static;
    overflow: hidden;
  }
`;
// A4 595 × 842
// A3 842 x 1190
/* eslint-disable prefer-template */
const getPrintHeight = ({
  isPrint,
  orient = 'portrait',
  size = 'A4',
  fixed = false,
}) => {
  if (fixed && isPrint) {
    return PRINT.SIZES[size][orient].H + 'pt';
  }
  if (isPrint) {
    return 'auto';
  }
  return '100%';
};

const getPrintWidth = ({
  isPrint,
  orient = 'portrait',
  size = 'A4',
}) => {
  if (isPrint) {
    return PRINT.SIZES[size][orient].W + 'pt';
  }
  return '100%';
};
const PrintWrapperInner = styled.div`
  position: ${({ isPrint, fixed = false }) => (isPrint && fixed) ? 'absolute' : 'static'};
  top: ${({ isPrint }) => isPrint ? 20 : 0}px;
  bottom: ${({ isPrint, fixed = false }) => {
    if (isPrint && fixed) {
      return '20px';
    }
    if (isPrint) {
      return 'auto';
    }
    return 0;
  }};
  right: ${({ isPrint }) => isPrint ? 20 : 0}px;
  left: ${({ isPrint }) => isPrint ? 20 : 0}px;
  @media print {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: ${(props) => props.fixed ? getPrintWidth(props) : '100%'};
    height: ${(props) => getPrintHeight(props)};;
  }
`;
const PrintWrapper = styled.div`
  position: relative;
  margin-bottom: ${({ isPrint }) => isPrint ? '140px' : '0px'};
  margin-right: ${({ isPrint }) => isPrint ? 'auto' : '0px'};
  margin-left: ${({ isPrint }) => isPrint ? 'auto' : '0px'};
  bottom: ${({ isPrint, fixed = false }) => {
    if (isPrint && fixed) {
      return 0;
    }
    if (isPrint) {
      return 'auto';
    }
    return 0;
  }};
  width: ${(props) => getPrintWidth(props)};
  height: ${(props) => getPrintHeight(props)};
  min-height: ${(props) => props.isPrint ? getPrintHeight({ ...props, fixed: true }) : 'auto'};
  box-shadow: ${({ isPrint }) => isPrint ? '0px 0px 5px 0px rgb(0 0 0 / 50%)' : 'none'};
  padding: ${({ isPrint }) => isPrint ? 20 : 0}px;
  @media print {
    position: static;
    box-shadow: none;
    padding: 0;
    margin: 0;
    bottom: 0;
    background: transparent;
  }
`;
// overflow: hidden;

// overflow: ${(props) => props.isHome ? 'auto' : 'hidden'};

class App extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  UNSAFE_componentWillMount() {
    this.props.validateToken();
  }

  preparePageMenuPages = (pages, currentPath) => sortEntities(
    pages.filter(
      (page) => !page.getIn(['attributes', 'order'])
        || page.getIn(['attributes', 'order']) > -1
    ),
    'asc',
    'order',
    'number'
  )
    .map((page) => ({
      path: `${ROUTES.PAGES}/${page.get('id')}`,
      title: page.getIn(['attributes', 'menu_title']) || page.getIn(['attributes', 'title']),
      active: currentPath === `${ROUTES.PAGES}/${page.get('id')}`,
    }))
    .toArray();

  prepareMainMenuItems = (
    isManager,
    isAnalyst,
    currentPath,
  ) => {
    const { intl } = this.context;
    let navItems = [];
    if (isAnalyst) {
      navItems = navItems.concat([
        {
          path: ROUTES.RESOURCES,
          title: intl.formatMessage(messages.nav.resources),
          active: currentPath && currentPath.startsWith(ROUTES.RESOURCE),
        },
      ]);
    }
    if (isManager) {
      navItems = navItems.concat([
        {
          path: ROUTES.PAGES,
          title: intl.formatMessage(messages.nav.pages),
          isAdmin: true,
          active: currentPath === ROUTES.PAGES,
        },
        {
          path: ROUTES.TAXONOMIES,
          title: intl.formatMessage(messages.nav.taxonomies),
          isAdmin: true,
          active: currentPath.startsWith(ROUTES.CATEGORY)
          || currentPath.startsWith(ROUTES.TAXONOMIES),
        },
        {
          path: ROUTES.USERS,
          title: intl.formatMessage(messages.nav.users),
          isAdmin: true,
          active: currentPath === ROUTES.USERS,
        },
      ]);
    }
    return navItems;
  }

  render() {
    const {
      pages,
      onPageLink,
      isUserSignedIn,
      isManager,
      isAnalyst,
      location,
      newEntityModal,
      user,
      children,
      isPrintView,
      onCloseModal,
      printArgs,
    } = this.props;
    const { intl } = this.context;
    const title = intl.formatMessage(messages.app.title);
    const isHome = location.pathname === '/';
    const isAuth = location.pathname.startsWith(ROUTES.LOGIN)
      || location.pathname.startsWith(ROUTES.REGISTER)
      || location.pathname.startsWith(ROUTES.LOGOUT)
      || location.pathname.startsWith(ROUTES.UNAUTHORISED);
    const isHomeOrAuth = isHome || isAuth;

    return (
      <div id="app-inner" className={isPrintView ? 'print-view' : ''}>
        <Helmet titleTemplate={`%s - ${title}`} defaultTitle={title} />
        {!isHome && (
          <Header
            isSignedIn={isUserSignedIn}
            isAnalyst={isAnalyst}
            isPrintView={isPrintView}
            user={user}
            pages={!isPrintView && pages && this.preparePageMenuPages(pages, location.pathname)}
            navItems={!isPrintView && this.prepareMainMenuItems(
              isUserSignedIn && isManager,
              isUserSignedIn && isAnalyst,
              location.pathname,
            )}
            search={!isUserSignedIn
              ? null
              : {
                path: ROUTES.SEARCH,
                title: intl.formatMessage(messages.nav.search),
                active: location.pathname.startsWith(ROUTES.SEARCH),
                icon: 'search',
              }
            }
            onPageLink={onPageLink}
            isAuth={isAuth}
            currentPath={location.pathname}
          />
        )}
        <Main isHome={isHomeOrAuth} isPrint={isPrintView}>
          {isPrintView && (<PrintUI />)}
          <PrintWrapper
            isPrint={isPrintView}
            fixed={printArgs.fixed}
            orient={printArgs.printOrientation}
            size={printArgs.printSize}
          >
            <PrintWrapperInner
              isPrint={isPrintView}
              fixed={printArgs.fixed}
              orient={printArgs.printOrientation}
              size={printArgs.printSize}
            >
              <PrintContext.Provider value={isPrintView}>
                {React.Children.toArray(children)}
              </PrintContext.Provider>
            </PrintWrapperInner>
          </PrintWrapper>
        </Main>
        {newEntityModal && (
          <ReactModal
            isOpen
            contentLabel={newEntityModal.get('path')}
            onRequestClose={onCloseModal}
            className="new-entity-modal"
            overlayClassName="new-entity-modal-overlay"
            style={{
              overlay: { zIndex: 99999999 },
            }}
            appElement={document.getElementById('app')}
          >
            <EntityNew
              path={newEntityModal.get('path')}
              attributes={newEntityModal.get('attributes')}
              onSaveSuccess={onCloseModal}
              onCancel={onCloseModal}
              inModal
            />
          </ReactModal>
        )}
        <GlobalStyle isPrint={isPrintView} />
      </div>
    );
  }
}

App.propTypes = {
  children: PropTypes.node,
  isUserSignedIn: PropTypes.bool,
  isManager: PropTypes.bool,
  isAnalyst: PropTypes.bool,
  isPrintView: PropTypes.bool,
  user: PropTypes.object,
  pages: PropTypes.object,
  validateToken: PropTypes.func,
  // loadEntitiesIfNeeded: PropTypes.func,
  onPageLink: PropTypes.func.isRequired,
  location: PropTypes.object.isRequired,
  newEntityModal: PropTypes.object,
  printArgs: PropTypes.object,
  onCloseModal: PropTypes.func,
};
App.contextTypes = {
  intl: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  // dataReady: selectReady(state, { path: DEPENDENCIES }),
  isManager: selectIsUserManager(state),
  isAnalyst: selectIsUserAnalyst(state),
  isUserSignedIn: selectIsSignedIn(state),
  user: selectSessionUserAttributes(state),
  isPrintView: selectIsPrintView(state),
  pages: selectEntitiesWhere(state, {
    path: API.PAGES,
    where: { draft: false },
  }),
  printArgs: selectPrintConfig(state),
  newEntityModal: selectNewEntityModal(state),
});

export function mapDispatchToProps(dispatch) {
  return {
    validateToken: () => {
      dispatch(validateToken()); // Maybe this could move to routes.js or App wrapper
    },
    // loadEntitiesIfNeeded: () => {
    //   DEPENDENCIES.forEach((path) => dispatch(loadEntitiesIfNeeded(path)));
    // },
    onPageLink: (path, args) => {
      dispatch(updatePath(path, args));
    },
    onCloseModal: () => {
      dispatch(openNewEntityModal(null));
    },
  };
}


export default connect(mapStateToProps, mapDispatchToProps)(App);
