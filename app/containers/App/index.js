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
import { palette } from 'styled-theme';
import Header from 'components/Header';
import EntityNew from 'containers/EntityNew';

import { sortEntities } from 'utils/sort';
import { ROUTES, API } from 'themes/config';

import {
  selectIsSignedIn,
  selectIsUserManager,
  selectIsUserAnalyst,
  selectSessionUserAttributes,
  selectReady,
  selectEntitiesWhere,
  selectNewEntityModal,
} from './selectors';

import {
  validateToken,
  loadEntitiesIfNeeded,
  updatePath,
  openNewEntityModal,
} from './actions';

import { DEPENDENCIES } from './constants';

import messages from './messages';

const Main = styled.div`
  position: ${(props) => props.isHome ? 'relative' : 'absolute'};
  top: ${(props) => props.isHome
    ? 0
    : props.theme.sizes.header.banner.heightMobile + props.theme.sizes.header.nav.heightMobile
}px;
  left: 0;
  right: 0;
  bottom:0;
  background-color: ${(props) => props.isHome ? 'transparent' : palette('light', 0)};
  overflow: hidden;

  @media (min-width: ${(props) => props.theme.breakpoints.small}) {
    top: ${(props) => props.isHome
    ? 0
    : props.theme.sizes.header.banner.height + props.theme.sizes.header.nav.height
}px;
  }
  @media print {
    background: white;
    position: static;
  }
`;
// overflow: ${(props) => props.isHome ? 'auto' : 'hidden'};

class App extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  UNSAFE_componentWillMount() {
    this.props.validateToken();
    this.props.loadEntitiesIfNeeded();
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    // reload entities if invalidated
    if (!nextProps.dataReady) {
      this.props.loadEntitiesIfNeeded();
    }
  }

  preparePageMenuPages = (pages) => sortEntities(
    pages,
    'asc',
    'order',
    'number'
  )
    .map((page) => ({
      path: `${ROUTES.PAGES}/${page.get('id')}`,
      title: page.getIn(['attributes', 'menu_title']) || page.getIn(['attributes', 'title']),
    }))
    .toArray();

  prepareMainMenuItems = (
    isManager,
    isAnalyst,
    currentPath,
  ) => {
    const { intl } = this.context;
    let navItems = [
      {
        path: ROUTES.ACTIONS,
        title: intl.formatMessage(messages.nav.actions),
        active: currentPath.startsWith(ROUTES.ACTION),
      },
      {
        path: ROUTES.ACTORS,
        title: intl.formatMessage(messages.nav.actors),
        active: currentPath.startsWith(ROUTES.ACTOR),
      },
    ];
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
    if (isAnalyst) {
      navItems = navItems.concat([
        {
          path: ROUTES.BOOKMARKS,
          title: intl.formatMessage(messages.nav.bookmarks),
          isAdmin: true,
          active: currentPath === ROUTES.BOOKMARKS,
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
    } = this.props;
    const { intl } = this.context;
    const title = intl.formatMessage(messages.app.title);
    const isHomeOrAuth = location.pathname === '/'
      || location.pathname.startsWith(ROUTES.LOGIN)
      || location.pathname.startsWith(ROUTES.REGISTER)
      || location.pathname.startsWith(ROUTES.LOGOUT)
      || location.pathname.startsWith(ROUTES.UNAUTHORISED);
    return (
      <div>
        <Helmet titleTemplate={`${title} - %s`} defaultTitle={title} />
        <Header
          isSignedIn={isUserSignedIn}
          user={user}
          pages={pages && this.preparePageMenuPages(pages)}
          navItems={this.prepareMainMenuItems(
            isUserSignedIn && isManager,
            isUserSignedIn && isAnalyst,
            location.pathname,
          )}
          search={{
            path: ROUTES.SEARCH,
            title: intl.formatMessage(messages.nav.search),
            active: location.pathname.startsWith(ROUTES.SEARCH),
            icon: 'search',
          }}
          onPageLink={onPageLink}
          isHome={location.pathname === '/'}
          isAuth={
            location.pathname.startsWith(ROUTES.LOGIN)
            || location.pathname.startsWith(ROUTES.REGISTER)
            || location.pathname.startsWith(ROUTES.LOGOUT)
            || location.pathname.startsWith(ROUTES.UNAUTHORISED)
          }
        />
        <Main isHome={isHomeOrAuth}>
          {React.Children.toArray(children)}
        </Main>
        {newEntityModal
          && (
            <ReactModal
              isOpen
              contentLabel={newEntityModal.get('path')}
              onRequestClose={this.props.onCloseModal}
              className="new-entity-modal"
              overlayClassName="new-entity-modal-overlay"
              style={{
                overlay: { zIndex: 99999999 },
              }}
            >
              <EntityNew
                path={newEntityModal.get('path')}
                attributes={newEntityModal.get('attributes')}
                onSaveSuccess={this.props.onCloseModal}
                onCancel={this.props.onCloseModal}
                inModal
              />
            </ReactModal>
          )
        }
        <GlobalStyle />
      </div>
    );
  }
}

App.propTypes = {
  children: PropTypes.node,
  isUserSignedIn: PropTypes.bool,
  isManager: PropTypes.bool,
  isAnalyst: PropTypes.bool,
  user: PropTypes.object,
  pages: PropTypes.object,
  validateToken: PropTypes.func,
  loadEntitiesIfNeeded: PropTypes.func,
  onPageLink: PropTypes.func.isRequired,
  location: PropTypes.object.isRequired,
  newEntityModal: PropTypes.object,
  onCloseModal: PropTypes.func,
};
App.contextTypes = {
  intl: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  isManager: selectIsUserManager(state),
  isAnalyst: selectIsUserAnalyst(state),
  isUserSignedIn: selectIsSignedIn(state),
  user: selectSessionUserAttributes(state),
  pages: selectEntitiesWhere(state, {
    path: API.PAGES,
    where: { draft: false },
  }),
  newEntityModal: selectNewEntityModal(state),
});

export function mapDispatchToProps(dispatch) {
  return {
    validateToken: () => {
      dispatch(validateToken()); // Maybe this could move to routes.js or App wrapper
    },
    loadEntitiesIfNeeded: () => {
      DEPENDENCIES.forEach((path) => dispatch(loadEntitiesIfNeeded(path)));
    },
    onPageLink: (path, args) => {
      dispatch(updatePath(path, args));
    },
    onCloseModal: () => {
      dispatch(openNewEntityModal(null));
    },
  };
}


export default connect(mapStateToProps, mapDispatchToProps)(App);
