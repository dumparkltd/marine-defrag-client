/*
 *
 * EntitiesListView
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Map, List } from 'immutable';
import { Box, Text } from 'grommet';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';

import {
  ROUTES,
  API,
  ACTORTYPES,
  ACTIONTYPE_ACTORTYPES,
  ACTIONTYPE_TARGETTYPES,
  ACTIONTYPES_CONFIG,
  ACTORTYPES_CONFIG,
  USER_ACTIONTYPES,
  FF_ACTIONTYPE,
  ACTIONTYPES,
} from 'themes/config';
import { CONTENT_LIST } from 'containers/App/constants';
import { jumpToComponent } from 'utils/scroll-to-component';
import ContainerWrapper from 'components/styled/Container/ContainerWrapper';
import Container from 'components/styled/Container';
import ContentSimple from 'components/styled/ContentSimple';
import BoxPrint from 'components/styled/BoxPrint';
import PrintHide from 'components/styled/PrintHide';
import Loading from 'components/Loading';
import EntityListViewOptions from 'components/EntityListViewOptions';
import MapSubjectOptions from 'containers/MapControl/MapInfoOptions/MapSubjectOptions';
import MapOption from 'containers/MapControl/MapInfoOptions/MapOption';
import EntityListTable from 'containers/EntityListTable';
import ButtonPill from 'components/buttons/ButtonPill';

import ContentHeader from 'containers/ContentHeader';
import HeaderPrint from 'components/Header/HeaderPrint';

import qe from 'utils/quasi-equals';
import appMessages from 'containers/App/messages';

import { getActorsForEntities } from './utils';

const getActivityColumns = (mapSubject, typeId) => {
  let actionTypeIds;
  if (mapSubject === 'actors') {
    actionTypeIds = Object.keys(ACTIONTYPE_ACTORTYPES).filter(
      (actionTypeId) => {
        if (qe(actionTypeId, FF_ACTIONTYPE)) return false;
        const actiontypeActortypeId = ACTIONTYPE_ACTORTYPES[actionTypeId];
        return actiontypeActortypeId.indexOf(typeId.toString()) > -1;
      }
    ).sort(
      (a, b) => {
        const orderA = ACTIONTYPES_CONFIG[parseInt(a, 10)].order;
        const orderB = ACTIONTYPES_CONFIG[parseInt(b, 10)].order;
        return orderA > orderB ? 1 : -1;
      }
    );
  } else {
    actionTypeIds = Object.keys(ACTIONTYPE_TARGETTYPES).filter(
      (actionTypeId) => {
        const actiontypeActortypeId = ACTIONTYPE_TARGETTYPES[actionTypeId];
        return actiontypeActortypeId.indexOf(typeId.toString()) > -1;
      }
    ).sort(
      (a, b) => {
        const orderA = ACTIONTYPES_CONFIG[parseInt(a, 10)].order;
        const orderB = ACTIONTYPES_CONFIG[parseInt(b, 10)].order;
        return orderA > orderB ? 1 : -1;
      }
    );
  }

  return actionTypeIds.map(
    (id) => ({
      id: `action_${id}`,
      type: 'actiontype',
      subject: mapSubject,
      actiontype_id: id,
      actions: mapSubject === 'actors'
        ? 'actionsByType'
        : 'targetingActionsByType',
      actionsMembers: mapSubject === 'actors'
        ? 'actionsAsMembersByType'
        : 'targetingActionsAsMemberByType',
    })
  );
};
class EntitiesListView extends React.Component { // eslint-disable-line react/prefer-stateless-function
  constructor(props) {
    super(props);
    this.ScrollContainer = React.createRef();
    this.ScrollTarget = React.createRef();
    this.ScrollReference = React.createRef();
    this.state = {
      viewType: ACTORTYPES.COUNTRY,
    };
  }

  scrollToTop = () => {
    jumpToComponent(
      this.ScrollTarget.current,
      this.ScrollReference.current,
      this.ScrollContainer.current
    );
  };

  setType = (type) => {
    this.setState({ viewType: type });
  };

  render() {
    const {
      config,
      entityTitle,
      dataReady,
      isManager,
      isAnalyst,
      taxonomies,
      connections,
      connectedTaxonomies,
      entities,
      errors,
      actortypes,
      headerStyle,
      viewOptions,
      hasFilters,
      showCode,
      entityIdsSelected,
      listUpdating,
      onEntityClick,
      onEntitySelect,
      onEntitySelectAll,
      onDismissError,
      typeId,
      mapSubject,
      onSetMapSubject,
      onSetIncludeActorMembers,
      onSetIncludeTargetMembers,
      includeActorMembers,
      includeTargetMembers,
      actiontypes,
      intl,
      resourcetypes,
      allEntityCount,
      headerOptions,
      isPrintView,
      isAdmin,
    } = this.props;
    const { viewType } = this.state;

    let type;
    let hasByTarget;
    let hasByUser;
    let isTarget;
    let isActive;
    let subjectOptions;
    let memberOption;
    let entityActors;
    let columns;
    let headerColumnsUtility;
    let mapSubjectClean = mapSubject;
    let includeTargetMembersClean = includeTargetMembers;
    // ACTIONS =================================================================

    if (config.types === 'actiontypes' && dataReady) {
      columns = ACTIONTYPES_CONFIG[typeId] && ACTIONTYPES_CONFIG[typeId].columns;
      type = actiontypes.find((at) => qe(at.get('id'), typeId));
      hasByTarget = type.getIn(['attributes', 'has_target']);
      hasByUser = isAdmin && USER_ACTIONTYPES && USER_ACTIONTYPES.indexOf(typeId) > -1;
      if (!hasByTarget && mapSubject === 'targets') {
        mapSubjectClean = null;
      }
      if (!hasByUser && mapSubject === 'users') {
        mapSubjectClean = null;
      }
      if (qe(ACTIONTYPES.INTL, typeId)) {
        mapSubjectClean = null;
      }
      if (!qe(ACTIONTYPES.INTL, typeId)) {
        subjectOptions = [
          {
            type: 'secondary',
            title: 'Activities',
            onClick: () => onSetMapSubject(),
            active: !mapSubjectClean,
            printHide: true,
            disabled: !mapSubjectClean,
          },
        ];
        if (hasByTarget) {
          subjectOptions = [
            ...subjectOptions,
            {
              type: 'secondary',
              title: qe(ACTIONTYPES.DONOR, typeId) ? 'By recipient' : 'By target',
              onClick: () => onSetMapSubject('targets'),
              active: mapSubjectClean === 'targets',
              disabled: mapSubjectClean === 'targets',
            },
          ];
        }
        if (hasByUser) {
          subjectOptions = [
            ...subjectOptions,
            {
              type: 'secondary',
              title: 'By user',
              onClick: () => onSetMapSubject('users'),
              active: mapSubjectClean === 'users',
              disabled: mapSubjectClean === 'users',
            },
          ];
        }
      }
      if (mapSubjectClean === 'targets' && qe(viewType, ACTORTYPES.COUNTRY)) {
        memberOption = {
          active: includeTargetMembers,
          onClick: () => onSetIncludeTargetMembers(includeTargetMembers ? '0' : '1'),
          label: 'Include activities targeting regions, intergovernmental organisations and classes (countries belong to)',
        };
      } else if (mapSubjectClean === 'actors' && qe(viewType, ACTORTYPES.COUNTRY)) {
        memberOption = {
          active: includeActorMembers,
          onClick: () => {
            onSetIncludeActorMembers(includeActorMembers ? '0' : '1');
          },
          label: 'Include activities of intergovernmental organisations (countries belong to)',
        };
      }
      entityActors = mapSubjectClean && getActorsForEntities(
        entities,
        connections && connections.get('actors'),
        mapSubjectClean,
        mapSubjectClean === 'actors' ? includeActorMembers : includeTargetMembers,
        mapSubjectClean === 'actors' && qe(ACTIONTYPES.DONOR, typeId), // trackAttributes
      );
      entityActors = entityActors && entityActors.groupBy(
        (actor) => actor.getIn(['attributes', 'actortype_id'])
      );

      // ACTORS ================================================================
      //
    } else if (config.types === 'actortypes' && dataReady) {
      if (qe(typeId, ACTORTYPES.ORG)) {
        includeTargetMembersClean = false;
      }

      type = actortypes.find((at) => qe(at.get('id'), typeId));
      isTarget = type.getIn(['attributes', 'is_target']);
      isActive = type.getIn(['attributes', 'is_active']);
      if (isTarget && isActive) {
        mapSubjectClean = mapSubject || 'targets';
      } else if (isTarget && !isActive) {
        mapSubjectClean = 'targets';
      } else if (!isTarget && isActive) {
        mapSubjectClean = 'actors';
      }
      subjectOptions = [];
      const actionColumns = getActivityColumns(
        mapSubjectClean,
        typeId,
        includeActorMembers,
        includeTargetMembersClean,
      );
      const typeColumns = ACTORTYPES_CONFIG[typeId].columns || [];
      columns = [
        {
          id: 'main',
          type: 'main',
          sort: 'title',
          attributes: ['code', 'title'],
        },
        ...typeColumns,
        ...actionColumns,
      ];
      headerColumnsUtility = actionColumns.length > 0
        ? [
          {
            type: 'main',
            content: '',
          },
          ...typeColumns.map(() => ({ type: 'spacer', content: '' })),
          {
            type: 'options',
            span: actionColumns.length,
          },
        ]
        : null;
      if (isTarget) {
        subjectOptions = [
          ...subjectOptions,
          {
            type: 'secondary',
            title: 'As targets',
            onClick: () => onSetMapSubject('targets'),
            active: mapSubjectClean === 'targets',
            disabled: mapSubjectClean === 'targets',
          },
        ];
      }
      if (isActive) {
        subjectOptions = [
          ...subjectOptions,
          {
            type: 'secondary',
            title: 'As actors',
            onClick: () => onSetMapSubject('actors'),
            active: mapSubjectClean === 'actors',
            disabled: mapSubjectClean === 'actors',
          },
        ];
      }
      if (mapSubjectClean === 'targets' && qe(typeId, ACTORTYPES.COUNTRY)) {
        memberOption = {
          active: includeTargetMembersClean,
          onClick: () => onSetIncludeTargetMembers(includeTargetMembersClean ? '0' : '1'),
          label: 'Include activities targeting regions, intergovernmental organisations and classes (countries belong to)',
        };
      } else if (mapSubjectClean === 'actors' && qe(typeId, ACTORTYPES.COUNTRY)) {
        memberOption = {
          active: includeActorMembers,
          onClick: () => onSetIncludeActorMembers(includeActorMembers ? '0' : '1'),
          label: 'Include activities of intergovernmental organisations (countries belong to)',
        };
      }
      // RESOURCES ================================================================
      //
    } else if (config.types === 'resourcetypes' && dataReady) {
      type = resourcetypes.find((at) => qe(at.get('id'), typeId));
      columns = [
        {
          id: 'main',
          type: 'main',
          sort: 'title',
          attributes: ['code', 'title'],
        },
        {
          id: 'resourceActions',
          type: 'resourceActions',
        },
      ];
    } else if (config.types === 'users' && dataReady) {
      columns = [
        {
          id: 'main',
          type: 'main',
          sort: 'name',
          attributes: ['name'],
        },
        {
          id: 'userrole',
          type: 'userrole',
        },
      ];
    } else if (config.types === 'pages' && dataReady) {
      columns = [
        {
          id: 'main',
          type: 'main',
          sort: 'name',
          attributes: ['menu_title', 'title'],
        },
      ];
    }
    let headerTitle;
    let headerSubTitle;
    if (entityTitle) {
      headerTitle = entities
        ? `${entities.size} ${entities.size === 1 ? entityTitle.single : entityTitle.plural}`
        : entityTitle.plural;
    }
    if (hasFilters) {
      headerSubTitle = `of ${allEntityCount} total`;
    }
    return (
      <ContainerWrapper
        headerStyle={headerStyle}
        ref={this.ScrollContainer}
        isPrint={isPrintView}
      >
        {isPrintView && (
          <HeaderPrint />
        )}
        {dataReady && viewOptions && viewOptions.length > 1 && (
          <PrintHide>
            <EntityListViewOptions isPrintView={isPrintView} options={viewOptions} />
          </PrintHide>
        )}
        <Container ref={this.ScrollReference} isPrint={isPrintView}>
          <ContentSimple isPrint={isPrintView}>
            {!dataReady && <Loading />}
            {dataReady && (
              <div>
                <ContentHeader
                  type={CONTENT_LIST}
                  title={headerTitle}
                  subTitle={headerSubTitle}
                  hasViewOptions={viewOptions && viewOptions.length > 1}
                  info={headerOptions && headerOptions.info}
                />
                {config.types === 'actiontypes' && (
                  <Box>
                    {subjectOptions && (
                      <MapSubjectOptions inList options={subjectOptions} />
                    )}
                  </Box>
                )}
                {entityActors && (
                  <Box>
                    <BoxPrint
                      isPrint={isPrintView}
                      printHide
                      direction="row"
                      gap="xsmall"
                      margin={{ vertical: 'small' }}
                      wrap
                    >
                      {mapSubject === 'actors'
                        && ACTIONTYPE_ACTORTYPES[typeId].length > 1
                        && ACTIONTYPE_ACTORTYPES[typeId].map(
                          (actortypeId) => (
                            <ButtonPill
                              key={actortypeId}
                              onClick={() => this.setType(actortypeId)}
                              active={qe(viewType, actortypeId)}
                            >
                              <Text size="small">
                                <FormattedMessage {...appMessages.entities[`actors_${actortypeId}`].pluralShort} />
                              </Text>
                            </ButtonPill>
                          )
                        )}
                      {mapSubject === 'targets'
                        && ACTIONTYPE_TARGETTYPES[typeId].length > 1
                        && ACTIONTYPE_TARGETTYPES[typeId].map(
                          (actortypeId) => (
                            <ButtonPill
                              key={actortypeId}
                              onClick={() => this.setType(actortypeId)}
                              active={qe(viewType, actortypeId)}
                            >
                              <Text size="small">
                                <FormattedMessage {...appMessages.entities[`actors_${actortypeId}`].pluralShort} />
                              </Text>
                            </ButtonPill>
                          )
                        )}
                    </BoxPrint>
                    {memberOption && (
                      <Box margin={{ bottom: 'small' }}>
                        <MapOption option={memberOption} type="member" />
                      </Box>
                    )}
                    {entityActors.get(parseInt(viewType, 10)) && (
                      <EntityListTable
                        paginate
                        hasSearch
                        columns={[
                          {
                            id: 'main',
                            type: 'main',
                            sort: 'title',
                            attributes: ['code', 'title'],
                          },
                          {
                            id: 'actorActions',
                            type: 'actorActions',
                            subject: mapSubject,
                            actions: mapSubject === 'actors'
                              ? 'actions'
                              : 'targetingActions',
                          },
                          {
                            id: 'actorActionsAsMember',
                            type: 'actorActions',
                            members: true,
                            subject: mapSubject,
                            actions: mapSubject === 'actors'
                              ? 'actionsMembers'
                              : 'targetingActionsAsMember',
                            skip: !(memberOption
                              && (
                                (mapSubject === 'actors' && includeActorMembers)
                                || (mapSubject === 'targets' && includeTargetMembersClean)
                              )),
                          },
                        ]}
                        entities={entityActors.get(parseInt(viewType, 10))}
                        entityPath={ROUTES.ACTOR}
                        onEntityClick={onEntityClick}
                        entityTitle={{
                          single: intl.formatMessage(appMessages.entities[`actors_${viewType}`].single),
                          plural: intl.formatMessage(appMessages.entities[`actors_${viewType}`].plural),
                        }}
                        onResetScroll={this.scrollToTop}
                        config={{
                          types: 'actortypes',
                          clientPath: ROUTES.ACTOR,
                          views: {
                            list: {
                              search: ['code', 'title', 'description'],
                            },
                          },
                          connections: {
                            actions: { // filter by associated entity
                              entityType: 'actions', // filter by actor connection
                              path: API.ACTIONS, // filter by actor connection
                              clientPath: ROUTES.ACTION,
                              actionTypeId: typeId,
                            },
                            actionsMembers: { // filter by associated entity
                              entityType: 'actions', // filter by actor connection
                              entityTypeAs: 'actionsMembers',
                              path: API.ACTIONS, // filter by actor connection
                              clientPath: ROUTES.ACTION,
                              actionTypeId: typeId,
                            },
                            targets: { // filter by associated entity
                              entityType: 'actions', // filter by actor connection
                              entityTypeAs: 'targetingActions',
                              path: API.ACTIONS, // filter by actor connection
                              clientPath: ROUTES.ACTION,
                              actionTypeId: typeId,
                            },
                            targetsMembers: { // filter by associated entity
                              entityType: 'actions', // filter by actor connection
                              entityTypeAs: 'targetingActionsAsMember',
                              path: API.ACTIONS, // filter by actor connection
                              clientPath: ROUTES.ACTION,
                              actionTypeId: typeId,
                            },
                          },
                        }}
                        connections={connections}
                      />
                    )}
                  </Box>
                )}
                {!entityActors && (
                  <EntityListTable
                    paginate
                    hasSearch
                    columns={columns}
                    headerColumnsUtility={headerColumnsUtility}
                    memberOption={memberOption && <MapOption align="end" option={memberOption} type="member" />}
                    subjectOptions={subjectOptions && (
                      <MapSubjectOptions
                        inList
                        align="end"
                        isPrintView={isPrintView}
                        options={subjectOptions}
                      />
                    )}
                    listUpdating={listUpdating}
                    entities={entities}
                    errors={errors}
                    taxonomies={taxonomies}
                    actortypes={actortypes}
                    connections={connections}
                    connectedTaxonomies={connectedTaxonomies}
                    entityIdsSelected={entityIdsSelected}
                    config={config}
                    entityTitle={entityTitle}

                    dataReady={dataReady}
                    canEdit={isManager}
                    isAnalyst={isAnalyst}

                    onEntitySelect={onEntitySelect}
                    onEntitySelectAll={onEntitySelectAll}
                    onResetScroll={this.scrollToTop}
                    onEntityClick={onEntityClick}
                    onDismissError={onDismissError}
                    typeId={typeId}
                    showCode={showCode}
                    includeMembers={mapSubjectClean === 'actors'
                      ? includeActorMembers
                      : includeTargetMembersClean
                    }
                  />
                )}
              </div>
            )}
          </ContentSimple>
        </Container>
      </ContainerWrapper>
    );
  }
}

EntitiesListView.propTypes = {
  hasFilters: PropTypes.bool,
  isPrintView: PropTypes.bool,
  showCode: PropTypes.bool,
  dataReady: PropTypes.bool,
  isManager: PropTypes.bool,
  isAnalyst: PropTypes.bool,
  includeActorMembers: PropTypes.bool,
  includeTargetMembers: PropTypes.bool,
  listUpdating: PropTypes.bool,
  isAdmin: PropTypes.bool,
  entities: PropTypes.instanceOf(List),
  taxonomies: PropTypes.instanceOf(Map),
  actortypes: PropTypes.instanceOf(Map),
  resourcetypes: PropTypes.instanceOf(Map),
  actiontypes: PropTypes.instanceOf(Map),
  targettypes: PropTypes.instanceOf(Map),
  connections: PropTypes.instanceOf(Map),
  connectedTaxonomies: PropTypes.instanceOf(Map),
  entityIdsSelected: PropTypes.instanceOf(List),
  errors: PropTypes.instanceOf(Map),
  // object/arrays
  config: PropTypes.object,
  viewOptions: PropTypes.array,
  entityTitle: PropTypes.object, // single/plural
  headerOptions: PropTypes.object, // single/plural
  intl: intlShape.isRequired,
  // primitive
  headerStyle: PropTypes.string,
  typeId: PropTypes.string,
  mapSubject: PropTypes.string,
  allEntityCount: PropTypes.number,
  // functions
  onEntityClick: PropTypes.func.isRequired,
  onEntitySelect: PropTypes.func.isRequired,
  onEntitySelectAll: PropTypes.func.isRequired,
  onDismissError: PropTypes.func.isRequired,
  onSetMapSubject: PropTypes.func,
  onSetIncludeActorMembers: PropTypes.func,
  onSetIncludeTargetMembers: PropTypes.func,
};

export default injectIntl(EntitiesListView);
// export default EntitiesListView;
