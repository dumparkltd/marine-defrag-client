/*
 *
 * ActionView
 *
 */

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { List } from 'immutable';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { Box } from 'grommet';
import styled from 'styled-components';

import {
  getTitleField,
  getStatusField,
  getMetaField,
  getMarkdownField,
  getDateField,
  getTextField,
  getInfoField,
  getReferenceField,
  getLinkField,
  getNumberField,
  getTaxonomyFields,
  hasTaxonomyCategories,
  getActionConnectionField,
  getResourceConnectionField,
} from 'utils/fields';

import qe from 'utils/quasi-equals';
import {
  getEntityTitleTruncated,
  checkActionAttribute,
} from 'utils/entities';
import { keydownHandlerPrint } from 'utils/print';
import {
  loadEntitiesIfNeeded,
  updatePath,
  closeEntity,
  printView,
} from 'containers/App/actions';

import {
  selectReady,
  selectIsUserManager,
  selectResourceConnections,
  selectTaxonomiesWithCategories,
  selectIsPrintView,
  selectShowFFasCircles,
} from 'containers/App/selectors';

import {
  ROUTES,
  FF_ACTIONTYPE,
  RESOURCE_FIELDS,
} from 'themes/config';
import { PRINT_TYPES } from 'containers/App/constants';
import Loading from 'components/Loading';
import Content from 'components/Content';
import ViewHeader from 'components/EntityView/ViewHeader';
import Main from 'components/EntityView/Main';
import Aside from 'components/EntityView/Aside';
import ViewWrapper from 'components/EntityView/ViewWrapper';
import ViewPanel from 'components/EntityView/ViewPanel';
import ViewPanelInside from 'components/EntityView/ViewPanelInside';
import FieldGroup from 'components/fields/FieldGroup';
import HeaderPrint from 'components/Header/HeaderPrint';

import appMessages from 'containers/App/messages';
import messages from './messages';

import ActionViewDetails from './ActionViewDetails';

import {
  selectViewEntity,
  selectViewTaxonomies,
  selectResourcesByType,
  selectParentAction,
} from './selectors';

import { DEPENDENCIES } from './constants';

const ResourcesWrapper = styled((p) => <Box pad={{ top: 'medium', bottom: 'large' }} {...p} />)`
  border-top: 1px solid;
  border-color: #f1f0f1;
`;

export function ActionView({
  viewEntity,
  dataReady,
  isManager,
  taxonomies,
  viewTaxonomies,
  resourcesByResourcetype,
  onEntityClick,
  resourceConnections,
  parent,
  onLoadData,
  intl,
  handleEdit,
  handleClose,
  params,
  handleTypeClick,
  isPrintView,
  onSetPrintView,
  showFFasCircles,
}) {
  useEffect(() => {
    // kick off loading of data
    onLoadData();
  }, []);
  const mySetPrintView = () => onSetPrintView({
    printType: isIndicator ? PRINT_TYPES.FF : PRINT_TYPES.SINGLE,
    printContentOptions: isIndicator ? null : { tabs: true },
    printMapOptions: (!isIndicator || !showFFasCircles) ? { markers: true } : null,
    printMapMarkers: true,
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
  const typeId = viewEntity && viewEntity.getIn(['attributes', 'measuretype_id']);
  const isIndicator = qe(typeId, FF_ACTIONTYPE);

  let buttons = [];
  if (dataReady) {
    if (window.print) {
      buttons = [
        ...buttons,
        {
          type: 'icon',
          // onClick: () => window.print(),
          onClick: mySetPrintView,
          title: 'Print',
          icon: 'print',
        },
      ];
    }
    if (isManager) {
      buttons = [
        ...buttons,
        {
          type: 'edit',
          onClick: handleEdit,
        },
      ];
    }
  }
  const pageTitle = typeId
    ? intl.formatMessage(appMessages.entities[`actions_${typeId}`].single)
    : intl.formatMessage(appMessages.entities.actions.single);

  const metaTitle = viewEntity
    ? `${pageTitle}: ${getEntityTitleTruncated(viewEntity)}`
    : `${pageTitle}: ${params.id}`;

  // && !qe(typeId, ACTIONTYPES.NATL);
  let hasLandbasedValue;
  if (viewEntity && checkActionAttribute(typeId, 'has_reference_landbased_ml')) {
    if (
      typeof viewEntity.getIn(['attributes', 'has_reference_landbased_ml']) !== 'undefined'
      && viewEntity.getIn(['attributes', 'has_reference_landbased_ml']) !== null
    ) {
      hasLandbasedValue = intl.formatMessage(
        appMessages.ui.checkAttributeStatuses[
          viewEntity.getIn(['attributes', 'has_reference_landbased_ml']).toString()
        ],
      );
    }
  }
  // check date comment for date spceficity
  const DATE_SPECIFICITIES = ['y', 'm', 'd'];
  let dateSpecificity;
  if (
    viewEntity
    && viewEntity.getIn(['attributes', 'date_comment'])
    && DATE_SPECIFICITIES.indexOf(viewEntity.getIn(['attributes', 'date_comment']).trim()) > -1
  ) {
    dateSpecificity = viewEntity.getIn(['attributes', 'date_comment']).trim();
  }
  let datesEqual;
  if (
    viewEntity
    && viewEntity.getIn(['attributes', 'date_start'])
    && viewEntity.getIn(['attributes', 'date_end'])
  ) {
    const [ds] = viewEntity.getIn(['attributes', 'date_start']).split('T');
    const [de] = viewEntity.getIn(['attributes', 'date_end']).split('T');
    datesEqual = ds === de;
  }
  return (
    <div>
      <Helmet
        title={metaTitle}
        meta={[
          { name: 'description', content: intl.formatMessage(messages.metaDescription) },
        ]}
      />
      <Content isSingle isPrint={isPrintView}>
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
          <ViewWrapper isPrint={isPrintView}>
            {isPrintView && (
              <HeaderPrint argsKeep={['am', 'tm', 'subj', 'ac', 'tc']} />
            )}
            <ViewHeader
              isPrintView={isPrintView}
              title={typeId
                ? intl.formatMessage(appMessages.actiontypes[typeId])
                : intl.formatMessage(appMessages.entities.actions.plural)
              }
              buttons={buttons}
              onClose={() => handleClose(typeId)}
              onTypeClick={() => handleTypeClick(typeId)}
            />
            <ViewPanel>
              <ViewPanelInside>
                <Main hasAside={isManager && !isIndicator && !isPrintView}>
                  <FieldGroup
                    group={{ // fieldGroup
                      fields: [
                        checkActionAttribute(typeId, 'code', isManager) && getReferenceField(
                          viewEntity,
                          'code',
                          isManager,
                        ),
                        checkActionAttribute(typeId, 'title') && getTitleField(viewEntity),
                      ],
                    }}
                  />
                </Main>
                {isManager && !isPrintView && (
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
                <Main hasAside={!isIndicator} bottom>
                  <FieldGroup
                    group={{
                      fields: [
                        checkActionAttribute(typeId, 'description')
                          && getMarkdownField(viewEntity, 'description', true),
                        checkActionAttribute(typeId, 'comment')
                          && !isIndicator // (ab)use for unit
                          && getMarkdownField(viewEntity, 'comment', true),
                        checkActionAttribute(typeId, 'status_comment')
                          && getMarkdownField(viewEntity, 'status_comment', true),
                      ],
                    }}
                  />
                  <FieldGroup
                    group={{
                      fields: [
                        checkActionAttribute(typeId, 'reference_ml')
                          && getMarkdownField(viewEntity, 'reference_ml', true),
                        checkActionAttribute(typeId, 'status_lbs_protocol')
                          && getMarkdownField(viewEntity, 'status_lbs_protocol', true),
                        checkActionAttribute(typeId, 'has_reference_landbased_ml')
                          && getInfoField(
                            'has_reference_landbased_ml',
                            hasLandbasedValue,
                          ),
                        checkActionAttribute(typeId, 'reference_landbased_ml')
                          && getMarkdownField(viewEntity, 'reference_landbased_ml', true),
                      ],
                    }}
                  />
                  <ActionViewDetails
                    id={params.id}
                    viewEntity={viewEntity}
                    isManager={isManager}
                    taxonomies={taxonomies}
                    onEntityClick={onEntityClick}
                    typeId={typeId}
                    isIndicator={isIndicator}
                  />
                  {resourcesByResourcetype && (
                    <ResourcesWrapper>
                      <FieldGroup
                        group={{
                          type: 'dark',
                          label: appMessages.nav.resources,
                          fields: resourcesByResourcetype.reduce(
                            (memo, resources, resourcetypeid) => {
                              let columns = [
                                {
                                  id: 'main',
                                  type: 'main',
                                  sort: 'title',
                                  attributes: ['title'],
                                },
                              ];
                              if (RESOURCE_FIELDS.ATTRIBUTES.status.optional.indexOf(resourcetypeid.toString()) > -1) {
                                columns = [
                                  ...columns,
                                  {
                                    id: 'attribute',
                                    type: 'attribute',
                                    attribute: 'status',
                                  },
                                ];
                              }
                              return memo.concat([
                                getResourceConnectionField({
                                  resources,
                                  taxonomies,
                                  onEntityClick,
                                  connections: resourceConnections,
                                  typeid: resourcetypeid,
                                  columns,
                                }),
                              ]);
                            },
                            [],
                          ),
                        }}
                      />
                    </ResourcesWrapper>
                  )}
                </Main>
                {!isIndicator && (
                  <Aside bottom>
                    {hasTaxonomyCategories(viewTaxonomies) && (
                      <FieldGroup
                        aside
                        group={{
                          fields: getTaxonomyFields(viewTaxonomies),
                        }}
                      />
                    )}
                    <FieldGroup
                      aside
                      group={{
                        fields: [
                          checkActionAttribute(typeId, 'url') && getLinkField(viewEntity),
                        ],
                      }}
                    />
                    <FieldGroup
                      aside
                      group={{
                        type: 'dark',
                        fields: [
                          checkActionAttribute(typeId, 'amount')
                            && getNumberField(viewEntity, 'amount', { unit: 'US$', unitBefore: true }),
                          checkActionAttribute(typeId, 'amount_comment') && getTextField(viewEntity, 'amount_comment'),
                        ],
                      }}
                    />
                    <FieldGroup
                      aside
                      group={{
                        type: 'dark',
                        fields: [
                          checkActionAttribute(typeId, 'date_start')
                            && getDateField(
                              viewEntity,
                              'date_start',
                              {
                                specificity: dateSpecificity,
                                attributeLabel: datesEqual ? 'date' : 'date_start',
                              }
                            ),
                          !datesEqual
                            && checkActionAttribute(typeId, 'date_end')
                            && getDateField(viewEntity, 'date_end', { specificity: dateSpecificity }),
                          !dateSpecificity
                            && checkActionAttribute(typeId, 'date_comment')
                            && getTextField(viewEntity, 'date_comment'),
                        ],
                      }}
                    />
                    {parent && (
                      <FieldGroup
                        aside
                        group={{
                          label: appMessages.entities.actions.parent,
                          fields: [
                            getActionConnectionField({
                              actions: List().push(parent),
                              onEntityClick,
                              typeid: parent.getIn(['attributes', 'measuretype_id']),
                            }),
                          ],
                        }}
                      />
                    )}
                  </Aside>
                )}
              </ViewPanelInside>
            </ViewPanel>
          </ViewWrapper>
        )}
      </Content>
    </div>
  );
}

ActionView.propTypes = {
  dataReady: PropTypes.bool,
  isManager: PropTypes.bool,
  isPrintView: PropTypes.bool,
  viewEntity: PropTypes.object,
  viewTaxonomies: PropTypes.object,
  taxonomies: PropTypes.object,
  resourcesByResourcetype: PropTypes.object,
  resourceConnections: PropTypes.object,
  params: PropTypes.object,
  parent: PropTypes.object,
  onLoadData: PropTypes.func,
  handleTypeClick: PropTypes.func,
  handleEdit: PropTypes.func,
  handleClose: PropTypes.func,
  onEntityClick: PropTypes.func,
  onSetPrintView: PropTypes.func,
  showFFasCircles: PropTypes.bool,
  intl: intlShape.isRequired,
};

const mapStateToProps = (state, props) => ({
  isManager: selectIsUserManager(state),
  dataReady: selectReady(state, { path: DEPENDENCIES }),
  viewEntity: selectViewEntity(state, props.params.id),
  viewTaxonomies: selectViewTaxonomies(state, props.params.id),
  taxonomies: selectTaxonomiesWithCategories(state),
  resourcesByResourcetype: selectResourcesByType(state, props.params.id),
  resourceConnections: selectResourceConnections(state),
  parent: selectParentAction(state, props.params.id),
  isPrintView: selectIsPrintView(state),
  showFFasCircles: selectShowFFasCircles(state),
});

function mapDispatchToProps(dispatch, props) {
  return {
    onLoadData: () => {
      DEPENDENCIES.forEach((path) => dispatch(loadEntitiesIfNeeded(path)));
    },
    onEntityClick: (id, path) => {
      dispatch(updatePath(`${path}/${id}`));
    },
    handleEdit: () => {
      dispatch(updatePath(`${ROUTES.ACTION}${ROUTES.EDIT}/${props.params.id}`, { replace: true }));
    },
    handleClose: (typeId) => {
      dispatch(closeEntity(`${ROUTES.ACTIONS}/${typeId}`));
    },
    handleTypeClick: (typeId) => {
      dispatch(updatePath(`${ROUTES.ACTIONS}/${typeId}`));
    },
    onSetPrintView: (config) => {
      dispatch(printView(config));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(ActionView));
