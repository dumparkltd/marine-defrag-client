import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { createStructuredSelector } from 'reselect';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { Map } from 'immutable';
import { Box, ResponsiveContext, ThemeContext } from 'grommet';

import styled from 'styled-components';

import appMessages from 'containers/App/messages';

import { ROUTES, ACTIONTYPE_GROUPS } from 'themes/config';
import { loadEntitiesIfNeeded, updatePath } from 'containers/App/actions';
import { selectReady } from 'containers/App/selectors';

import HeaderExplore from 'containers/HeaderExplore';
import ContainerWrapper from 'components/styled/Container/ContainerWrapper';
import Container from 'components/styled/Container';
import Content from 'components/styled/ContentSimple';
import CardTeaser from 'components/CardTeaser';
import Footer from 'containers/Footer';

import qe from 'utils/quasi-equals';
import { isMaxSize } from 'utils/responsive';

import { selectActiontypesWithActionCount } from './selectors';
import { DEPENDENCIES } from './constants';

import { getIconConfig } from './utils';

const Group = styled((p) => <Box margin={{ bottom: 'large', top: 'medium' }} {...p} />)``;
const GroupTitle = styled.h5`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.global.colors.text.brand};
`;
const ViewContainer = styled(Container)`
  min-height: 70vH;
  @media print {
    min-height: 50vH;
  }
`;
export function ActionsOverview({
  onLoadData, types, onUpdatePath, intl, dataReady,
}) {
  useEffect(() => {
    // kick off loading of data
    onLoadData();
  }, []);
  const theme = React.useContext(ThemeContext);
  const size = React.useContext(ResponsiveContext);

  return (
    <ContainerWrapper bg>
      <HeaderExplore />
      <ViewContainer>
        <Content>
          {Object.keys(ACTIONTYPE_GROUPS).map((key) => {
            const isLandscape = qe(key, 1);
            return (
              <Group key={key}>
                <GroupTitle>
                  <FormattedMessage {...appMessages.actiontypeGroups[key]} />
                </GroupTitle>
                <Box direction={isMaxSize(size, 'medium') ? 'column' : 'row'} gap="small">
                  {ACTIONTYPE_GROUPS[key].types.map((typeId) => {
                    const path = `${ROUTES.ACTIONS}/${typeId}`;
                    const count = types.getIn([typeId, 'count']) ? parseInt(types.getIn([typeId, 'count']), 10) : 0;
                    const iconConfig = getIconConfig(typeId);
                    return (
                      <CardTeaser
                        key={typeId}
                        basis={isLandscape ? 'full' : '1/4'}
                        path={path}
                        onClick={(evt) => {
                          if (evt && evt.preventDefault) evt.preventDefault();
                          onUpdatePath(path);
                        }}
                        dataReady={dataReady}
                        count={count}
                        title={
                          intl.formatMessage(appMessages.actiontypes_long[typeId])
                        }
                        description={
                          intl.formatMessage(appMessages.actiontypes_about[typeId])
                        }
                        iconConfig={iconConfig}
                        isLandscape={isLandscape}
                        graphic={theme.media.navCard.activities[typeId]}
                      />
                    );
                  })}
                </Box>
              </Group>
            );
          })}
        </Content>
      </ViewContainer>
      <Footer />
    </ContainerWrapper>
  );
}

ActionsOverview.propTypes = {
  intl: intlShape.isRequired,
  dataReady: PropTypes.bool,
  onLoadData: PropTypes.func.isRequired,
  onUpdatePath: PropTypes.func.isRequired,
  types: PropTypes.instanceOf(Map),
};

const mapStateToProps = createStructuredSelector({
  dataReady: (state) => selectReady(state, DEPENDENCIES),
  types: (state) => selectActiontypesWithActionCount(state),
});

export function mapDispatchToProps(dispatch) {
  return {
    onLoadData: () => {
      DEPENDENCIES.forEach((path) => dispatch(loadEntitiesIfNeeded(path)));
    },
    onUpdatePath: (path) => {
      dispatch(updatePath(path, { dropQuery: true }));
    },
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(injectIntl(ActionsOverview));
