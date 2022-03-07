/*
 *
 * ActorView
 *
 */

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { Map } from 'immutable';
import { Box, Text, Button } from 'grommet';
import styled from 'styled-components';

import {
  getTitleField,
  getStatusField,
  getMetaField,
  getMarkdownField,
  getInfoField,
  getLinkField,
  getNumberField,
  getTaxonomyFields,
  hasTaxonomyCategories,
  getActorConnectionField,
} from 'utils/fields';
import qe from 'utils/quasi-equals';

import { getEntityTitleTruncated, checkActorAttribute } from 'utils/entities';

import {
  loadEntitiesIfNeeded,
  updatePath,
  closeEntity,
  setSubject,
  setActiontype,
} from 'containers/App/actions';

import { CONTENT_SINGLE } from 'containers/App/constants';
import { ROUTES, ACTORTYPES } from 'themes/config';

import Loading from 'components/Loading';
import Content from 'components/Content';
import ContentHeader from 'components/ContentHeader';
// import EntityView from 'components/EntityView';
import Main from 'components/EntityView/Main';
import Aside from 'components/EntityView/Aside';
import ViewWrapper from 'components/EntityView/ViewWrapper';
import ViewPanel from 'components/EntityView/ViewPanel';
import ViewPanelInside from 'components/EntityView/ViewPanelInside';
import FieldGroup from 'components/fields/FieldGroup';

import {
  selectReady,
  selectIsUserManager,
  selectTaxonomiesWithCategories,
  selectActionConnections,
  selectActorConnections,
  selectSubjectQuery,
  selectActiontypeQuery,
  selectActortypes,
  selectActiontypes,
} from 'containers/App/selectors';

import appMessages from 'containers/App/messages';
import messages from './messages';
import Activities from './Activities';
import Members from './Members';
import CountryMap from './CountryMap';
import CountryFacts from './CountryFacts';

import {
  selectViewEntity,
  selectViewTaxonomies,
  selectActionsByType,
  selectActionsAsTargetByType,
  selectMembersByType,
  selectAssociationsByType,
  selectActionsAsMemberByActortype,
  selectActionsAsTargetAsMemberByActortype,
  selectActorIndicators,
} from './selectors';

import { DEPENDENCIES } from './constants';

const SubjectButton = styled((p) => <Button plain {...p} />)`
  padding: 2px 4px;
  border-bottom: 2px solid;
  border-bottom-color: ${({ active }) => active ? 'brand' : 'transparent'};
  background: none;
`;

export function ActorView(props) {
  const {
    intl,
    viewEntity,
    dataReady,
    isManager,
    onLoadData,
    params,
    handleEdit,
    handleClose,
    viewTaxonomies,
    associationsByType,
    onEntityClick,
    onUpdatePath,
    subject,
    onSetSubject,
    membersByType,
    actortypes,
    taxonomies,
    actionConnections,
    actorConnections,
    onSetActiontype,
    viewActiontypeId,
    actionsByActiontype,
    actionsAsTargetByActiontype,
    actiontypes,
    actionsAsMemberByActortype,
    actionsAsTargetAsMemberByActortype,
    indicators,
  } = props;
  useEffect(() => {
    // kick off loading of data
    onLoadData();
  }, []);

  const typeId = viewEntity && viewEntity.getIn(['attributes', 'actortype_id']);
  const viewActortype = actortypes && actortypes.find((type) => qe(type.get('id'), typeId));

  let buttons = [];
  if (dataReady) {
    buttons.push({
      type: 'icon',
      onClick: () => window.print(),
      title: 'Print',
      icon: 'print',
    });
    buttons = isManager
      ? buttons.concat([
        {
          type: 'edit',
          onClick: () => handleEdit(params.id),
        },
        {
          type: 'close',
          onClick: () => handleClose(typeId),
        },
      ])
      : buttons.concat([{
        type: 'close',
        onClick: () => handleClose(typeId),
      }]);
  }
  const pageTitle = typeId
    ? intl.formatMessage(appMessages.entities[`actors_${typeId}`].single)
    : intl.formatMessage(appMessages.entities.actors.single);

  const metaTitle = viewEntity
    ? `${pageTitle}: ${getEntityTitleTruncated(viewEntity)}`
    : `${pageTitle}: ${params.id}`;

  const isTarget = viewActortype && viewActortype.getIn(['attributes', 'is_target']);
  const isActive = viewActortype && viewActortype.getIn(['attributes', 'is_active']);
  const hasMembers = viewActortype && viewActortype.getIn(['attributes', 'has_members']);
  const isCountry = qe(typeId, ACTORTYPES.COUNTRY);

  let viewSubject = subject;
  const validViewSubjects = [];
  if (isTarget) {
    validViewSubjects.push('targets');
  }
  if (isActive) {
    validViewSubjects.push('actors');
  }
  if (hasMembers) {
    validViewSubjects.push('members');
  }
  if (isCountry) {
    validViewSubjects.push('facts');
  }
  if (validViewSubjects.indexOf(viewSubject) === -1) {
    viewSubject = validViewSubjects.length > 0 ? validViewSubjects[0] : null;
  }
  return (
    <div>
      <Helmet
        title={metaTitle}
        meta={[
          { name: 'description', content: intl.formatMessage(messages.metaDescription) },
        ]}
      />
      <Content>
        <ContentHeader
          title={pageTitle}
          type={CONTENT_SINGLE}
          buttons={buttons}
        />
        { !dataReady
          && <Loading />
        }
        { !viewEntity && dataReady
          && (
            <div>
              <FormattedMessage {...messages.notFound} />
            </div>
          )
        }
        { viewEntity && dataReady && (
          <ViewWrapper>
            <ViewPanel>
              <ViewPanelInside>
                <Main hasAside={isManager}>
                  <FieldGroup
                    group={{ // fieldGroup
                      fields: [
                        checkActorAttribute(typeId, 'code', isManager) && getInfoField(
                          'code',
                          viewEntity.getIn(['attributes', 'code']),
                        ),
                        checkActorAttribute(typeId, 'title') && getTitleField(viewEntity),
                      ],
                    }}
                  />
                </Main>
                {isManager && (
                  <Aside>
                    <FieldGroup
                      group={{
                        fields: [
                          getStatusField(viewEntity),
                          getMetaField(viewEntity),
                        ],
                      }}
                      aside
                    />
                  </Aside>
                )}
              </ViewPanelInside>
            </ViewPanel>
            <ViewPanel>
              <ViewPanelInside>
                <Main hasAside bottom>
                  <FieldGroup
                    group={{
                      fields: [
                        checkActorAttribute(typeId, 'description')
                          && getMarkdownField(viewEntity, 'description', true),
                        checkActorAttribute(typeId, 'activity_summary')
                          && getMarkdownField(viewEntity, 'activity_summary', true),
                      ],
                    }}
                  />
                  <Box>
                    <Box direction="row" gap="small" margin={{ vertical: 'small', horizontal: 'medium' }}>
                      {hasMembers && (
                        <SubjectButton
                          onClick={() => onSetSubject('members')}
                          active={viewSubject === 'members'}
                        >
                          <Text size="large">Members</Text>
                        </SubjectButton>
                      )}
                      {isActive && (
                        <SubjectButton
                          onClick={() => onSetSubject('actors')}
                          active={viewSubject === 'actors'}
                        >
                          <Text size="large">Activities</Text>
                        </SubjectButton>
                      )}
                      {isTarget && (
                        <SubjectButton
                          onClick={() => onSetSubject('targets')}
                          active={viewSubject === 'targets'}
                        >
                          <Text size="large">Targeted by</Text>
                        </SubjectButton>
                      )}
                      {isCountry && (
                        <SubjectButton
                          onClick={() => onSetSubject('facts')}
                          active={viewSubject === 'facts'}
                        >
                          <Text size="large">Facts & Figures</Text>
                        </SubjectButton>
                      )}
                    </Box>
                    {viewSubject === 'members' && hasMembers && (
                      <Members
                        membersByType={membersByType}
                        onEntityClick={(id) => onEntityClick(id, ROUTES.ACTOR)}
                        taxonomies={taxonomies}
                        actorConnections={actorConnections}
                      />
                    )}
                    {(viewSubject === 'actors' || viewSubject === 'targets') && (
                      <Activities
                        viewEntity={viewEntity}
                        onEntityClick={onEntityClick}
                        viewActortype={viewActortype}
                        viewSubject={viewSubject}
                        taxonomies={taxonomies}
                        actionConnections={actionConnections}
                        hasMembers={hasMembers}
                        onSetActiontype={onSetActiontype}
                        viewActiontypeId={viewActiontypeId}
                        actionsByActiontype={actionsByActiontype}
                        actionsAsTargetByActiontype={actionsAsTargetByActiontype}
                        actiontypes={actiontypes}
                        actionsAsMemberByActortype={actionsAsMemberByActortype}
                        actionsAsTargetAsMemberByActortype={actionsAsTargetAsMemberByActortype}
                      />
                    )}
                    {viewSubject === 'facts' && (
                      <CountryFacts
                        onUpdatePath={onUpdatePath}
                        indicators={indicators}
                        resources={actionConnections && actionConnections.get('resources')}
                      />
                    )}
                  </Box>
                </Main>
                <Aside bottom>
                  {isCountry && (
                    <CountryMap actor={viewEntity} />
                  )}
                  <FieldGroup
                    aside
                    group={{
                      fields: [
                        checkActorAttribute(typeId, 'url')
                          && getLinkField(viewEntity),
                        checkActorAttribute(typeId, 'gdp')
                          && getNumberField(
                            viewEntity,
                            'gdp',
                            {
                              unit: 'US$',
                              unitBefore: true,
                              info: appMessages.attributeInfo.gdp && intl.formatMessage(appMessages.attributeInfo.gdp),
                            },
                          ),
                        checkActorAttribute(typeId, 'population')
                          && getNumberField(
                            viewEntity,
                            'population',
                            {
                              info: appMessages.attributeInfo.population && intl.formatMessage(appMessages.attributeInfo.population),
                            },
                          ),
                      ],
                    }}
                  />
                  {hasTaxonomyCategories(viewTaxonomies) && (
                    <FieldGroup
                      aside
                      group={{ // fieldGroup
                        label: appMessages.entities.taxonomies.plural,
                        fields: getTaxonomyFields(viewTaxonomies),
                      }}
                    />
                  )}
                  {associationsByType && (
                    <FieldGroup
                      aside
                      group={{
                        label: appMessages.nav.associations,
                        fields: associationsByType.reduce(
                          (memo, actors, typeid) => memo.concat([
                            getActorConnectionField({
                              actors,
                              onEntityClick,
                              typeid,
                            }),
                          ]),
                          [],
                        ),
                      }}
                    />
                  )}
                </Aside>
              </ViewPanelInside>
            </ViewPanel>
          </ViewWrapper>
        )}
      </Content>
    </div>
  );
}

ActorView.propTypes = {
  viewEntity: PropTypes.object,
  onLoadData: PropTypes.func,
  dataReady: PropTypes.bool,
  handleEdit: PropTypes.func,
  handleClose: PropTypes.func,
  onEntityClick: PropTypes.func,
  onUpdatePath: PropTypes.func,
  viewTaxonomies: PropTypes.instanceOf(Map),
  indicators: PropTypes.instanceOf(Map),
  taxonomies: PropTypes.instanceOf(Map),
  actionConnections: PropTypes.instanceOf(Map),
  actorConnections: PropTypes.instanceOf(Map),
  actionsByActiontype: PropTypes.instanceOf(Map),
  actionsAsTargetByActiontype: PropTypes.instanceOf(Map),
  membersByType: PropTypes.instanceOf(Map),
  associationsByType: PropTypes.instanceOf(Map),
  params: PropTypes.object,
  isManager: PropTypes.bool,
  intl: intlShape.isRequired,
  subject: PropTypes.string,
  viewActiontypeId: PropTypes.string,
  onSetSubject: PropTypes.func,
  onSetActiontype: PropTypes.func,
  actortypes: PropTypes.instanceOf(Map),
  actiontypes: PropTypes.instanceOf(Map),
  actionsAsMemberByActortype: PropTypes.instanceOf(Map),
  actionsAsTargetAsMemberByActortype: PropTypes.instanceOf(Map),
};

const mapStateToProps = (state, props) => ({
  isManager: selectIsUserManager(state),
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  viewEntity: selectViewEntity(state, props.params.id),
  indicators: selectActorIndicators(state, props.params.id),
  viewTaxonomies: selectViewTaxonomies(state, props.params.id),
  taxonomies: selectTaxonomiesWithCategories(state),
  actionsByActiontype: selectActionsByType(state, props.params.id),
  actionsAsTargetByActiontype: selectActionsAsTargetByType(state, props.params.id),
  actionsAsMemberByActortype: selectActionsAsMemberByActortype(state, props.params.id),
  actionsAsTargetAsMemberByActortype: selectActionsAsTargetAsMemberByActortype(state, props.params.id),
  actionConnections: selectActionConnections(state),
  actorConnections: selectActorConnections(state),
  membersByType: selectMembersByType(state, props.params.id),
  associationsByType: selectAssociationsByType(state, props.params.id),
  subject: selectSubjectQuery(state),
  viewActiontypeId: selectActiontypeQuery(state),
  actortypes: selectActortypes(state),
  actiontypes: selectActiontypes(state),
});

function mapDispatchToProps(dispatch, props) {
  return {
    onLoadData: () => {
      DEPENDENCIES.forEach((path) => dispatch(loadEntitiesIfNeeded(path)));
    },
    handleEdit: () => {
      dispatch(updatePath(`${ROUTES.ACTOR}${ROUTES.EDIT}/${props.params.id}`, { replace: true }));
    },
    handleClose: (typeId) => {
      dispatch(closeEntity(`${ROUTES.ACTORS}/${typeId}`));
    },
    onEntityClick: (id, path) => {
      dispatch(updatePath(`${path}/${id}`));
    },
    onUpdatePath: (path) => {
      dispatch(updatePath(path));
    },
    onSetSubject: (type) => {
      dispatch(setSubject(type));
    },
    onSetActiontype: (type) => {
      dispatch(setActiontype(type));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(ActorView));
