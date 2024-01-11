/*
 *
 * EntityList
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { palette } from 'styled-theme';

import { Map, List, fromJS } from 'immutable';
import ReactModal from 'react-modal';

// import { getEntityReference } from 'utils/entities';
import Messages from 'components/Messages';
import Loading from 'components/Loading';

import EntityListHeader from 'components/EntityListHeader';
import EntityListDownload from 'components/EntityListDownload';

import {
  selectHasUserRole,
  selectCurrentPathname,
  selectAllTaxonomiesWithCategories,
  selectIncludeMembersForFiltering,
  selectMapSubjectQuery,
  selectIncludeActorMembers,
  selectIncludeTargetMembers,
  selectIsPrintView,
  selectSearchQuery,
} from 'containers/App/selectors';

import {
  updatePath,
  openNewEntityModal,
  setView,
  updateRouteQuery,
  setIncludeMembersForFiltering,
  setMapSubject,
  setIncludeActorMembers,
  setIncludeTargetMembers,
} from 'containers/App/actions';
import appMessages from 'containers/App/messages';

import { USER_ROLES, ACTION_FIELDS, ACTOR_FIELDS } from 'themes/config';

import EntitiesMap from './EntitiesMap';
import EntitiesListView from './EntitiesListView';
import EntitiesOverTime from './EntitiesOverTime';

import {
  selectDomain,
  selectProgress,
  selectActivePanel,
  selectSelectedEntities,
  selectProgressTypes,
} from './selectors';

import messages from './messages';

import {
  resetProgress,
  saveMultiple,
  newMultipleConnections,
  deleteMultipleConnections,
  selectEntity,
  selectMultipleEntities,
  updateQuery,
  setClientPath,
  dismissError,
  dismissAllErrors,
  resetFilters,
} from './actions';

import { currentFilters, currentFilterArgs } from './current-filters';

const Progress = styled.div`
  position: absolute;
  width: 100%;
  display: block;
  background: white;
  bottom: 0;
  box-shadow: 0px 0px 15px 0px rgba(0,0,0,0.2);
  background-color: ${palette('primary', 4)};
  padding: ${(props) => props.error ? 0 : 40}px;
  z-index: 200;
`;

const ProgressText = styled.div`
  font-weight: bold;
  font-size: 1em;
  color: ${palette('primary', 2)};
  margin-bottom: 0.25em;
  margin-top: -0.5em;
  overflow: hidden;
  @media print {
    font-size: ${(props) => props.theme.sizes.print.default};
  }
`;

const STATE_INITIAL = {
  downloadActive: false,
  visibleFilters: null,
  visibleEditOptions: null,
};

export class EntityList extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();
    this.state = STATE_INITIAL;
  }

  UNSAFE_componentWillMount() {
    this.props.updateClientPath();
  }

  onShowFilters = (evt) => {
    if (evt !== undefined && evt.preventDefault) evt.preventDefault();
    this.setState({
      visibleFilters: true,
      visibleEditOptions: null,
    });
  };

  onHideFilters = (evt) => {
    if (evt !== undefined && evt.preventDefault) evt.preventDefault();
    this.setState({ visibleFilters: false });
  };

  onShowEditOptions = (evt) => {
    if (evt !== undefined && evt.preventDefault) evt.preventDefault();
    this.setState({
      visibleEditOptions: true,
      visibleFilters: null,
    });
  };

  onResetEditOptions = (evt) => {
    if (evt !== undefined && evt.preventDefault) evt.preventDefault();
    this.setState({
      visibleEditOptions: null,
    });
  };

  onHideEditOptions = (evt) => {
    if (evt !== undefined && evt.preventDefault) evt.preventDefault();
    this.setState({ visibleEditOptions: false });
  };

  onClearFilters = () => {
    // TODO: broken
    this.props.onResetFilters(currentFilterArgs(
      this.props.config,
      this.props.locationQuery,
    ));
    this.props.onDismissAllErrors();
  };

  onDownloadClick = () => {
    this.setState({ downloadActive: true });
  };

  onDownloadDismiss = () => {
    this.setState({ downloadActive: false });
  };

  getMessageForType = (type) => {
    switch (type) {
      case 'new':
        return messages.createSuccess;
      case 'delete':
        return messages.deleteSuccess;
      default:
        return messages.updatesSuccess;
    }
  };

  getFields = (type) => {
    switch (type) {
      case 'actiontypes':
        return ACTION_FIELDS;
      case 'actortypes':
        return ACTOR_FIELDS;
      default:
        return null;
    }
  };

  mapError = (error, key) => fromJS({
    type: error.data.type,
    error: error.error,
    key,
  });

  mapErrors = (errors) => errors.reduce((errorMap, error, key) => {
    const entityId = error.data.saveRef;
    return errorMap.has(entityId) // check if error already present for entity
      ? errorMap.set(entityId, errorMap.get(entityId).push(this.mapError(error, key)))
      : errorMap.set(entityId, List().push(this.mapError(error, key)));
  }, Map());

  filterByError = (entities, errors) => entities.filter((entity) => errors.has(entity.get('id')));

  render() {
    const { intl } = this.context;
    // make sure selected entities are still actually on page
    const {
      entityIdsSelected,
      progress,
      viewDomain,
      canEdit,
      progressTypes,
      allTaxonomies,
      config,
      locationQuery,
      connections,
      onTagClick,
      actortypes,
      actiontypes,
      targettypes,
      resourcetypes,
      typeOptions,
      onSelectType,
      onSetView,
      typeId,
      view = 'list',
      hasList,
      hasMapOption,
      hasTimelineOption,
      onEntitySelectAll,
      dataReady,
      showCode,
      onUpdateQuery,
      includeMembers,
      onSetFilterMemberOption,
      mapSubject,
      onSetMapSubject,
      onSetIncludeActorMembers,
      onSetIncludeTargetMembers,
      includeActorMembers,
      includeTargetMembers,
      columns,
      headerColumnsUtility,
      headerOptions,
      taxonomies,
      connectedTaxonomies,
      includeHeader,
      headerStyle,
      entityTitle,
      hasUserRole,
      onEntitySelect,
      onDismissError,
      onEntityClick,
      onResetProgress,
      actiontypesForTarget,
      membertypes,
      associationtypes,
      handleEditSubmit,
      onCreateOption,
      allEntityCount,
      isPrintView,
      searchQuery,
    } = this.props;
    // detect print to avoid expensive rendering
    const printing = isPrintView || !!(
      typeof window !== 'undefined'
      && window.matchMedia
      && window.matchMedia('print').matches
    );

    const sending = viewDomain.get('sending');
    const success = viewDomain.get('success');
    const errors = viewDomain.get('errors').size > 0 ? this.mapErrors(viewDomain.get('errors')) : Map();

    const entities = (dataReady && errors.size > 0)
      ? this.filterByError(this.props.entities, errors)
      : this.props.entities;

    const entityIdsSelectedFiltered = entityIdsSelected.size > 0 && entities
      ? entityIdsSelected.filter((id) => entities.map((entity) => entity.get('id')).includes(id))
      : entityIdsSelected;
    const isManager = hasUserRole[USER_ROLES.MANAGER.value];
    const isManagerAndCanEdit = canEdit && isManager;

    const filters = currentFilters(
      {
        config,
        entities,
        taxonomies: allTaxonomies,
        connections,
        locationQuery,
        onTagClick,
        errors,
        actortypes,
        intl,
        isManager,
      },
      intl.formatMessage(messages.filterFormWithoutPrefix),
      intl.formatMessage(messages.filterFormAnyPrefix),
      intl.formatMessage(messages.filterFormError),
    );

    const showList = view === 'list';
    const showMap = view === 'map';
    const showTimeline = view === 'time';

    let headerActions = [];
    headerActions = headerOptions && headerOptions.actions && headerOptions.actions.filter(
      (action) => {
        if (!showList) {
          return !action.showOnListOnly;
        }
        if (!showTimeline) {
          return !action.showOnTimelineOnly;
        }
        if (!showMap) {
          return !action.showOnMapOnly;
        }
        return true;
      },
    );

    if (config.downloadCSV) {
      headerActions = [
        ...headerActions,
        {
          type: 'icon',
          onClick: () => this.onDownloadClick(),
          title: 'Download CSV',
          icon: 'download',
        },
      ];
    }

    let viewOptions = [];
    if (hasList && (hasMapOption || hasTimelineOption)) {
      if (hasTimelineOption) {
        viewOptions = [
          ...viewOptions,
          {
            type: 'primaryGroup',
            title: intl.formatMessage(messages.viewOptionTimeline),
            onClick: () => onSetView('time'),
            active: showTimeline,
            disabled: showTimeline,
            isFirst: true,
          },
        ];
      }
      if (hasMapOption) {
        viewOptions = [
          ...viewOptions,
          {
            type: 'primaryGroup',
            title: intl.formatMessage(messages.viewOptionMap),
            onClick: () => onSetView('map'),
            active: showMap,
            disabled: showMap,
            isFirst: !hasTimelineOption,
          },
        ];
      }
      viewOptions = [
        ...viewOptions,
        {
          type: 'primaryGroup',
          title: intl.formatMessage(messages.viewOptionList),
          onClick: () => onSetView('list'),
          active: showList,
          disabled: showList,
          isLast: true,
          isFirst: !hasMapOption && !hasTimelineOption,
        },
      ];
    }


    return (
      <div>
        {config.downloadCSV && this.state.downloadActive && (
          <ReactModal
            isOpen
            contentLabel="test"
            onRequestClose={() => this.onDownloadDismiss()}
            className="download-csv-modal"
            overlayClassName="download-csv-modal-overlay"
            style={{
              overlay: { zIndex: 99999999 },
            }}
            appElement={document.getElementById('app')}
          >
            <EntityListDownload
              config={config}
              fields={this.getFields(config.types)}
              typeId={typeId}
              entities={entities}
              taxonomies={taxonomies}
              connections={connections}
              onClose={() => this.onDownloadDismiss()}
              typeNames={{
                actiontypes: actiontypes.map((type) => intl.formatMessage(appMessages.entities[`actions_${type.get('id')}`].single)).toJS(),
                actortypes: actortypes.map((type) => intl.formatMessage(appMessages.entities[`actors_${type.get('id')}`].single)).toJS(),
              }}
              isAdmin={isManager}
              searchQuery={searchQuery}
            />
          </ReactModal>
        )}
        {headerStyle === 'types' && !printing && (
          <EntityListHeader
            typeId={typeId}
            dataReady={dataReady}
            currentFilters={filters}
            listUpdating={progress !== null && progress >= 0 && progress < 100}
            entities={entities}
            entityIdsSelected={entityIdsSelected}
            taxonomies={taxonomies}
            actortypes={actortypes}
            resourcetypes={resourcetypes}
            actiontypes={actiontypes}
            targettypes={targettypes}
            actiontypesForTarget={actiontypesForTarget}
            membertypes={membertypes}
            connections={connections}
            associationtypes={associationtypes}
            connectedTaxonomies={connectedTaxonomies}
            config={config}
            locationQuery={locationQuery}
            canEdit={isManagerAndCanEdit && showList}
            isManager={isManager}
            hasUserRole={hasUserRole}
            onCreateOption={onCreateOption}
            onUpdate={
              (associations, activeEditOption) => handleEditSubmit(
                associations,
                activeEditOption,
                entityIdsSelected,
                viewDomain.get('errors'),
              )}
            showFilters={this.state.visibleFilters}
            showEditOptions={isManagerAndCanEdit && showList && this.state.visibleEditOptions}
            onShowFilters={this.onShowFilters}
            onHideFilters={this.onHideFilters}
            onHideEditOptions={this.onHideEditOptions}
            onShowEditOptions={this.onShowEditOptions}
            onSelectType={(type) => {
              // reset selection
              onEntitySelectAll([]);
              onSelectType(type);
            }}
            typeOptions={typeOptions}
            hasFilters={filters && filters.length > 0}
            onUpdateQuery={onUpdateQuery}
            includeMembers={includeMembers}
            onSetFilterMemberOption={onSetFilterMemberOption}
            headerActions={headerActions}
            isPrintView={isPrintView}
          />
        )}
        {headerStyle === 'simple' && (
          <EntityListHeader
            headerStyle={headerStyle}
            dataReady={dataReady}
            config={config}
            canEdit={isManagerAndCanEdit && showList}
            isManager={isManager}
            hasUserRole={hasUserRole}
            headerActions={headerActions}
            isPrintView={isPrintView}
          />
        )}
        {showList && (
          <EntitiesListView
            searchQuery={searchQuery}
            isPrintView={isPrintView}
            headerOptions={headerOptions}
            allEntityCount={allEntityCount}
            viewOptions={viewOptions}
            hasHeader={includeHeader}
            headerStyle={headerStyle}
            listUpdating={progress !== null && progress >= 0 && progress < 100}
            entities={entities}
            errors={errors}
            taxonomies={taxonomies}
            actortypes={actortypes}
            actiontypes={actiontypes}
            targettypes={targettypes}
            resourcetypes={resourcetypes}
            connections={connections}
            connectedTaxonomies={connectedTaxonomies}
            entityIdsSelected={entityIdsSelectedFiltered}

            config={config}
            columns={columns}
            headerColumnsUtility={headerColumnsUtility}
            entityTitle={entityTitle}

            dataReady={dataReady}
            isManager={isManagerAndCanEdit}
            isAnalyst={hasUserRole[USER_ROLES.ANALYST.value]}

            onEntitySelect={(id, checked) => {
              // show options when selected and not hidden
              if (checked && this.state.visibleEditOptions !== false) {
                this.onShowEditOptions();
              }
              // reset when unchecking last selected item
              if (!checked && !this.state.visibleEditOptions && entityIdsSelected.size === 1) {
                this.onResetEditOptions();
              }
              onEntitySelect(id, checked);
            }}
            onEntitySelectAll={(ids) => {
              // show options when selected and not hidden
              if (this.state.visibleEditOptions !== false && ids && ids.length > 0) {
                this.onShowEditOptions();
              }
              // reset when unchecking last selected item
              if (!this.state.visibleEditOptions && (!ids || ids.length === 0)) {
                this.onResetEditOptions();
              }
              onEntitySelectAll(ids);
            }}
            onEntityClick={(id, path) => onEntityClick(
              id, path, viewDomain.get('errors')
            )}
            onDismissError={onDismissError}
            typeId={typeId}
            hasFilters={filters && filters.length > 0}
            showCode={showCode}
            mapSubject={mapSubject}
            onSetMapSubject={onSetMapSubject}
            onSetIncludeActorMembers={onSetIncludeActorMembers}
            onSetIncludeTargetMembers={onSetIncludeTargetMembers}
            includeActorMembers={includeActorMembers}
            includeTargetMembers={includeTargetMembers}
          />
        )}
        {showMap && (
          <EntitiesMap
            viewOptions={viewOptions}
            entities={entities}
            actortypes={actortypes}
            actiontypes={actiontypes}
            targettypes={targettypes}
            config={config}
            dataReady={dataReady}
            onEntityClick={(id, path) => onEntityClick(
              id, path, viewDomain.get('errors')
            )}
            typeId={typeId}
            hasFilters={filters && filters.length > 0}
            mapSubject={mapSubject}
            onSetMapSubject={onSetMapSubject}
            onSetIncludeActorMembers={onSetIncludeActorMembers}
            onSetIncludeTargetMembers={onSetIncludeTargetMembers}
            includeActorMembers={includeActorMembers}
            includeTargetMembers={includeTargetMembers}
            isPrintView={isPrintView}
          />
        )}
        {showTimeline && (
          <EntitiesOverTime
            viewOptions={viewOptions}
            entities={entities}
            actortypes={actortypes}
            actiontypes={actiontypes}
            targettypes={targettypes}
            config={config}
            entityTitle={entityTitle}
            allEntityCount={allEntityCount}
            dataReady={dataReady}
            onEntityClick={(id, path) => onEntityClick(
              id, path, viewDomain.get('errors')
            )}
            headerOptions={headerOptions}
            typeId={typeId}
            hasFilters={filters && filters.length > 0}
            mapSubject={mapSubject}
            onSetMapSubject={onSetMapSubject}
            onSetIncludeActorMembers={onSetIncludeActorMembers}
            onSetIncludeTargetMembers={onSetIncludeTargetMembers}
            includeActorMembers={includeActorMembers}
            includeTargetMembers={includeTargetMembers}
            isPrintView={isPrintView}
          />
        )}
        {isManagerAndCanEdit && (progress !== null && progress < 100) && (
          <Progress>
            <ProgressText>
              <FormattedMessage
                {...messages.processingUpdates}
                values={{
                  processNo: Math.min(success.size + errors.size + 1, sending.size),
                  totalNo: sending.size,
                  types:
                    intl.formatMessage(messages[
                      `type_${progressTypes.size === 1 ? progressTypes.first() : 'save'}`
                    ]),
                }}
              />
            </ProgressText>
            <Loading
              progress={progress}
            />
          </Progress>
        )}
        {isManagerAndCanEdit && (viewDomain.get('errors').size > 0 && progress >= 100) && (
          <Progress error>
            <Messages
              type="error"
              message={
                intl.formatMessage(
                  messages.updatesFailed,
                  {
                    errorNo: viewDomain.get('errors').size,
                    types:
                      intl.formatMessage(messages[
                        `type_${progressTypes.size === 1 ? progressTypes.first() : 'save'}`
                      ]),
                  },
                )
              }
              onDismiss={onResetProgress}
              preMessage={false}
            />
          </Progress>
        )}
        {isManagerAndCanEdit && (viewDomain.get('errors').size === 0 && progress >= 100) && (
          <Progress error>
            <Messages
              type="success"
              message={
                intl.formatMessage(
                  this.getMessageForType(
                    progressTypes.size === 1 ? progressTypes.first() : 'save',
                    viewDomain.get('success').size,
                  ),
                  {
                    successNo: viewDomain.get('success').size,
                  },
                )
              }
              onDismiss={onResetProgress}
              autoDismiss={2000}
            />
          </Progress>
        )}
      </div>
    );
  }
}

EntityList.defaultProps = {
  includeHeader: true,
  canEdit: true,
  headerStyle: 'types',
};

EntityList.propTypes = {
  // wrapper props
  entities: PropTypes.instanceOf(List).isRequired,
  taxonomies: PropTypes.instanceOf(Map),
  allTaxonomies: PropTypes.instanceOf(Map),
  actortypes: PropTypes.instanceOf(Map),
  resourcetypes: PropTypes.instanceOf(Map),
  actiontypes: PropTypes.instanceOf(Map),
  targettypes: PropTypes.instanceOf(Map),
  actiontypesForTarget: PropTypes.instanceOf(Map),
  membertypes: PropTypes.instanceOf(Map),
  associationtypes: PropTypes.instanceOf(Map),
  connections: PropTypes.instanceOf(Map),
  connectedTaxonomies: PropTypes.instanceOf(Map),
  config: PropTypes.object,
  columns: PropTypes.array,
  headerColumnsUtility: PropTypes.array,
  dataReady: PropTypes.bool,
  headerOptions: PropTypes.object,
  locationQuery: PropTypes.instanceOf(Map),
  entityTitle: PropTypes.object, // single/plural
  entityIcon: PropTypes.func,
  // selector props
  activePanel: PropTypes.string,
  hasUserRole: PropTypes.object, // { 1: isAdmin, 2: isManager, 3: isAnalyst}
  entityIdsSelected: PropTypes.object,
  viewDomain: PropTypes.object,
  progress: PropTypes.number,
  typeId: PropTypes.string,
  progressTypes: PropTypes.instanceOf(List),
  // dispatch props
  handleEditSubmit: PropTypes.func.isRequired,
  onEntitySelect: PropTypes.func.isRequired,
  onEntitySelectAll: PropTypes.func.isRequired,
  onTagClick: PropTypes.func.isRequired,
  onResetFilters: PropTypes.func.isRequired,
  onEntityClick: PropTypes.func.isRequired,
  onResetProgress: PropTypes.func.isRequired,
  updateClientPath: PropTypes.func.isRequired,
  onCreateOption: PropTypes.func.isRequired,
  onDismissError: PropTypes.func.isRequired,
  onDismissAllErrors: PropTypes.func.isRequired,
  onUpdateQuery: PropTypes.func.isRequired,
  canEdit: PropTypes.bool,
  includeHeader: PropTypes.bool,
  headerStyle: PropTypes.string,
  showCode: PropTypes.bool,
  includeMembers: PropTypes.bool,
  typeOptions: PropTypes.array,
  onSelectType: PropTypes.func,
  onSetView: PropTypes.func,
  onSetFilterMemberOption: PropTypes.func,
  view: PropTypes.string,
  hasList: PropTypes.bool,
  hasMapOption: PropTypes.bool,
  hasTimelineOption: PropTypes.bool,
  mapSubject: PropTypes.string,
  onSetMapSubject: PropTypes.func,
  onSetIncludeActorMembers: PropTypes.func,
  onSetIncludeTargetMembers: PropTypes.func,
  includeActorMembers: PropTypes.bool,
  includeTargetMembers: PropTypes.bool,
  isPrintView: PropTypes.bool,
  allEntityCount: PropTypes.number,
  searchQuery: PropTypes.string,
};

EntityList.contextTypes = {
  intl: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  hasUserRole: selectHasUserRole(state),
  activePanel: selectActivePanel(state),
  entityIdsSelected: selectSelectedEntities(state),
  viewDomain: selectDomain(state),
  progress: selectProgress(state),
  progressTypes: selectProgressTypes(state),
  currentPath: selectCurrentPathname(state),
  allTaxonomies: selectAllTaxonomiesWithCategories(state),
  includeMembers: selectIncludeMembersForFiltering(state),
  mapSubject: selectMapSubjectQuery(state),
  includeActorMembers: selectIncludeActorMembers(state),
  includeTargetMembers: selectIncludeTargetMembers(state),
  isPrintView: selectIsPrintView(state),
  searchQuery: selectSearchQuery(state),
});

function mapDispatchToProps(dispatch, props) {
  return {
    onDismissError: (key) => {
      dispatch(resetProgress());
      dispatch(dismissError(key));
    },
    onDismissAllErrors: () => {
      dispatch(resetProgress());
      dispatch(dismissAllErrors());
    },
    onResetProgress: () => {
      dispatch(resetProgress());
    },
    updateClientPath: () => {
      dispatch(setClientPath(props.config.clientPath));
    },
    onEntitySelect: (id, checked) => {
      dispatch(selectEntity({ id, checked }));
    },
    onEntityClick: (id, path, errors) => {
      if (errors && errors.size) {
        dispatch(resetProgress());
        errors.forEach((error, key) => {
          if (error.data.saveRef === id) {
            dispatch(dismissError(key));
          }
        });
      }
      dispatch(updatePath(`${path || props.config.clientPath}/${id}`));
    },
    onEntitySelectAll: (ids) => {
      dispatch(selectMultipleEntities(ids));
    },
    onTagClick: (value) => {
      dispatch(updateQuery(fromJS([value])));
    },
    onResetFilters: (values) => {
      dispatch(resetFilters(values));
    },
    onCreateOption: (args) => {
      dispatch(openNewEntityModal(args));
    },
    onUpdateQuery: (args) => {
      dispatch(updateRouteQuery(args));
    },
    onSetView: (view) => {
      dispatch(setView(view));
    },
    onSetFilterMemberOption: (view) => {
      dispatch(setIncludeMembersForFiltering(view));
    },
    onSetMapSubject: (subject) => {
      dispatch(setMapSubject(subject));
    },
    onSetIncludeTargetMembers: (active) => {
      dispatch(setIncludeTargetMembers(active));
    },
    onSetIncludeActorMembers: (active) => {
      dispatch(setIncludeActorMembers(active));
    },
    handleEditSubmit: (formData, activeEditOption, entityIdsSelected, errors) => {
      dispatch(resetProgress());

      const entities = props.entities.filter(
        (entity) => entityIdsSelected.includes(entity.get('id'))
      );
      // figure out changes
      const changes = formData.get('values').filter((option) => option.get('hasChanged'));
      // figure out updates (either new attribute values or new connections)
      const creates = changes
        .filter((option) => option.get('checked') === true)
        .map((option) => option.get('value'));

      // attributes
      if (activeEditOption.group === 'attributes') {
        if (creates.size > 0) {
          // take the first
          // TODO multiselect should be run in single value mode and only return 1 value
          const newValue = creates.first();
          entities.forEach((entity) => {
            // not exactly sure what is happening here?
            if (errors && errors.size) {
              errors.forEach((error, key) => {
                if (error.data.saveRef === entity.get('id')) {
                  dispatch(dismissError(key));
                }
              });
            }
          });
          dispatch(saveMultiple(
            props.config.serverPath,
            entities.filter(
              (entity) => entity.getIn(['attributes', activeEditOption.optionId]) !== newValue
            ).map(
              (entity) => Map()
                .set('path', props.config.serverPath)
                .set('entity', entity.setIn(['attributes', activeEditOption.optionId], newValue))
                .set('saveRef', entity.get('id'))
            ).toJS()
          ));
        }
        // connections
      } else {
        // figure out connection deletions (not necessary for attributes as deletions will be overridden)
        const deletes = changes
          .filter((option) => option.get('checked') === false)
          .map((option) => option.get('value'));

        entities.forEach(
          (entity) => {
            if (errors && errors.size) {
              errors.forEach((error, key) => {
                if (error.data.saveRef === entity.get('id')) {
                  dispatch(dismissError(key));
                }
              });
            }
          }
        );
        const updates = entities.reduce(
          (memo, entity) => {
            let entityCreates = List();
            let entityDeletes = List();
            let existingAssignments;
            switch (activeEditOption.group) {
              case ('taxonomies'):
                existingAssignments = entity.get('categories');
                break;
              case ('actions'):
              case ('actors'):
              case ('targets'):
              case ('members'):
              case ('associations'):
              case ('resources'):
                existingAssignments = entity.get(activeEditOption.connection);
                break;
              default:
                existingAssignments = List();
                break;
            }
            // create connections
            if (creates.size > 0) {
              // exclude existing relations from the changeSet
              entityCreates = !!existingAssignments && existingAssignments.size > 0
                ? creates.filter(
                  (id) => !existingAssignments.includes(parseInt(id, 10))
                )
                : creates;
              entityCreates = entityCreates.map(
                (id) => fromJS({
                  path: activeEditOption.path,
                  entity: {
                    attributes: {
                      [activeEditOption.ownKey]: entity.get('id'),
                      [activeEditOption.key]: id,
                    },
                  },
                  saveRef: entity.get('id'),
                })
              );
            }
            // delete connections
            if (
              deletes.size > 0
              && !!existingAssignments
              && existingAssignments.size > 0
            ) {
              entityDeletes = existingAssignments.filter(
                (assigned) => deletes.includes(assigned.toString())
              ).map(
                (assigned, id) => fromJS({
                  path: activeEditOption.path,
                  id,
                  saveRef: entity.get('id'),
                })
              ).toList();
            }
            return memo
              .set('creates', memo.get('creates').concat(entityCreates))
              .set('deletes', memo.get('deletes').concat(entityDeletes));
          },
          Map().set('creates', List()).set('deletes', List()),
        ); // reduce entities

        // associations
        if (updates.get('creates') && updates.get('creates').size > 0) {
          dispatch(newMultipleConnections(
            activeEditOption.path,
            updates.get('creates').toJS(),
          ));
        }
        if (updates.get('deletes') && updates.get('deletes').size > 0) {
          dispatch(deleteMultipleConnections(
            activeEditOption.path,
            updates.get('deletes').toJS(),
          ));
        }
        // entityCreates.forEach((id) => dispatch(newConnection({
        //   path: activeEditOption.path,
        //   entity: {
        //     attributes: {
        //       [activeEditOption.ownKey]: entity.get('id'),
        //       [activeEditOption.key]: id,
        //     },
        //   },
        //   saveRef: entity.get('id'),
        // })));
        // existingAssignments
        //   .forEach((assigned, id) => dispatch(deleteConnection({
        //     path: activeEditOption.path,
        //     id,
        //     saveRef: entity.get('id'),
        //   })));
      }
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(EntityList);
