/*
 *
 * ActionList
 *
 */

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { List, Map, fromJS } from 'immutable';
import { injectIntl, intlShape } from 'react-intl';

import {
  loadEntitiesIfNeeded,
  updatePath,
  setPrintModal,
} from 'containers/App/actions';
import {
  selectReady,
  selectActiontypeTaxonomiesWithCats,
  selectIsUserManager,
  selectIsUserAnalyst,
  selectActiontypes,
  selectActortypes,
  // selectActortypesForActiontype,
  selectTargettypesForActiontype,
  selectResourcetypesForActiontype,
  selectActiontypeActions,
  selectPrintQuery,
  selectMapLoading,
} from 'containers/App/selectors';

import appMessages from 'containers/App/messages';
import { PRINT_TYPES } from 'containers/App/constants';

import { checkActionAttribute } from 'utils/entities';
import qe from 'utils/quasi-equals';

import { ROUTES, FF_ACTIONTYPE } from 'themes/config';

import EntityList from 'containers/EntityList';
import ActionsFactsOverview from 'containers/ActionsFactsOverview';
import { CONFIG, DEPENDENCIES } from './constants';
import {
  selectConnections,
  selectViewActions,
  selectConnectedTaxonomies,
} from './selectors';

import messages from './messages';

// UNSAFE_componentWillMount() {
//   this.props.loadEntitiesIfNeeded();
// }
//
// UNSAFE_componentWillReceiveProps(nextProps) {
//   // reload entities if invalidated
//   if (!nextProps.dataReady) {
//     this.props.loadEntitiesIfNeeded();
//   }
// }
// componentDidUpdate() {
//   if (
//     this.props.dataReady
//     && !this.props.isMapLoading
//   ) {
//     console.log('data ready', this.props.dataReady, this.props.isMapLoading);
//     if (this.props.isPrintView) {
//       console.log('print')
//       window.print();
//       // setTimeout(
//       //   () => window.print(),
//       //   1000,
//       // );
//     }
//   }
// }
const prepareTypeOptions = (types, activeId, intl) => types.toList().toJS().map((type) => ({
  value: type.id,
  label: intl.formatMessage(appMessages.actiontypes[type.id]),
  active: activeId === type.id,
}));

export function ActionList({
  dataReady,
  entities,
  allEntities,
  taxonomies,
  connections,
  connectedTaxonomies,
  location,
  isManager,
  isAnalyst,
  params, // { id: the action type }
  actiontypes,
  actortypes,
  targettypes,
  resourcetypes,
  onSelectType,
  openPrintModal,
  intl,
  handleImport,
  handleNew,
  isMapLoading,
  onLoadEntitiesIfNeeded,
  isPrintView,
}) {
  useEffect(() => {
    if (!dataReady) onLoadEntitiesIfNeeded();
  }, [dataReady]);

  useEffect(() => {
    if (window.print && isPrintView && dataReady && !isMapLoading) {
      window.print();
    }
  }, [dataReady, isMapLoading]);

  const typeId = params.id;
  const type = `actions_${typeId}`;
  const headerOptions = {
    supTitle: intl.formatMessage(messages.pageTitle),
    actions: [],
    info: appMessages.actiontypes_info[typeId]
      && intl.formatMessage(appMessages.actiontypes_info[typeId]).trim() !== ''
      ? {
        title: 'Please note',
        content: intl.formatMessage(appMessages.actiontypes_info[typeId]),
      }
      : null,
  };
  if (isAnalyst) {
    headerOptions.actions.push({
      type: 'bookmarker',
      title: intl.formatMessage(appMessages.entities[type].plural),
      entityType: type,
    });
  }
  if (window.print) {
    headerOptions.actions.push({
      type: 'icon',
      // onClick: () => window.print(),
      onClick: () => openPrintModal({
        type: PRINT_TYPES.LIST,
      }),
      title: 'Print',
      icon: 'print',
    });
  }
  if (isManager) {
    headerOptions.actions.push({
      title: 'Create new',
      onClick: () => handleNew(typeId),
      icon: 'add',
      isManager,
    });
    headerOptions.actions.push({
      title: intl.formatMessage(appMessages.buttons.import),
      onClick: () => handleImport(),
      icon: 'import',
      isManager,
    });
  }

  return (
    <div>
      <Helmet
        title={intl.formatMessage(messages.pageTitle)}
        meta={[
          { name: 'description', content: intl.formatMessage(messages.metaDescription) },
        ]}
      />
      {!qe(typeId, FF_ACTIONTYPE) && (
        <EntityList
          entities={entities}
          allEntityCount={allEntities && allEntities.size}
          taxonomies={taxonomies}
          connections={connections}
          connectedTaxonomies={connectedTaxonomies}
          config={CONFIG}
          headerOptions={headerOptions}
          dataReady={dataReady}
          entityTitle={{
            single: intl.formatMessage(appMessages.entities[type].single),
            plural: intl.formatMessage(appMessages.entities[type].plural),
          }}
          locationQuery={fromJS(location.query)}
          actortypes={actortypes}
          actiontypes={actiontypes}
          targettypes={targettypes}
          resourcetypes={resourcetypes}
          typeOptions={prepareTypeOptions(actiontypes, typeId, intl)}
          onSelectType={onSelectType}
          typeId={typeId}
          showCode={checkActionAttribute(typeId, 'code', isManager)}
        />
      )}
      {qe(typeId, FF_ACTIONTYPE) && (
        <ActionsFactsOverview
          entities={entities}
          connections={connections}
          dataReady={dataReady}
          isManager={isManager}
        />
      )}
    </div>
  );
}

ActionList.propTypes = {
  onLoadEntitiesIfNeeded: PropTypes.func,
  handleNew: PropTypes.func,
  handleImport: PropTypes.func,
  onSelectType: PropTypes.func,
  openPrintModal: PropTypes.func,
  dataReady: PropTypes.bool,
  isManager: PropTypes.bool,
  entities: PropTypes.instanceOf(List).isRequired,
  taxonomies: PropTypes.instanceOf(Map),
  connectedTaxonomies: PropTypes.instanceOf(Map),
  connections: PropTypes.instanceOf(Map),
  actortypes: PropTypes.instanceOf(Map),
  actiontypes: PropTypes.instanceOf(Map),
  targettypes: PropTypes.instanceOf(Map),
  resourcetypes: PropTypes.instanceOf(Map),
  allEntities: PropTypes.instanceOf(Map),
  location: PropTypes.object,
  isAnalyst: PropTypes.bool,
  isPrintView: PropTypes.bool,
  isMapLoading: PropTypes.bool,
  params: PropTypes.object,
  intl: intlShape,
};

ActionList.contextTypes = {
  intl: PropTypes.object.isRequired,
};

const mapStateToProps = (state, props) => ({
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  entities: selectViewActions(state, { type: props.params.id }), // type
  taxonomies: selectActiontypeTaxonomiesWithCats(state, { type: props.params.id }),
  connections: selectConnections(state),
  connectedTaxonomies: selectConnectedTaxonomies(state),
  isManager: selectIsUserManager(state),
  isAnalyst: selectIsUserAnalyst(state),
  actiontypes: selectActiontypes(state),
  actortypes: selectActortypes(state),
  targettypes: selectTargettypesForActiontype(state, { type: props.params.id }),
  resourcetypes: selectResourcetypesForActiontype(state, { type: props.params.id }),
  allEntities: selectActiontypeActions(state, { type: props.params.id }),
  isPrintView: selectPrintQuery(state),
  isMapLoading: selectMapLoading(state),
});
function mapDispatchToProps(dispatch) {
  return {
    onLoadEntitiesIfNeeded: () => {
      DEPENDENCIES.forEach((path) => dispatch(loadEntitiesIfNeeded(path)));
    },
    handleNew: (typeId) => {
      dispatch(updatePath(`${ROUTES.ACTIONS}/${typeId}${ROUTES.NEW}`, { replace: true }));
    },
    handleImport: () => {
      dispatch(updatePath(`${ROUTES.ACTIONS}${ROUTES.IMPORT}`));
    },
    openPrintModal: (options) => {
      dispatch(setPrintModal({ options }));
    },
    onSelectType: (typeId) => {
      dispatch(updatePath(
        typeId && typeId !== ''
          ? `${ROUTES.ACTIONS}/${typeId}`
          : ROUTES.ACTIONS
      ));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(ActionList));
