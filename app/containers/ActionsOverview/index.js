import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { createStructuredSelector } from 'reselect';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Map } from 'immutable';

import styled from 'styled-components';

import appMessages from 'containers/App/messages';

import { ROUTES, ACTIONTYPE_GROUPS } from 'themes/config';
import { loadEntitiesIfNeeded, updatePath } from 'containers/App/actions';
import { selectReady } from 'containers/App/selectors';

import HeaderExplore from 'containers/HeaderExplore';
import Container from 'components/styled/Container';
import Content from 'components/styled/Content';

import { selectActiontypesWithActionCount } from './selectors';
import { DEPENDENCIES } from './constants';


const Group = styled.div``;
const GroupTitle = styled.h5`
  font-size: 14px;
`;
const TypeButton = styled.a``;
const TypeTitle = styled.h6``;
const TypeCount = styled.span`
  margin-right: 5px;
`;
const TypeTitleInner = styled.span``;

export function ActionsOverview({ onLoadData, types, onUpdatePath }) {
  useEffect(() => {
    // kick off loading of data
    onLoadData();
  }, []);

  return (
    <div>
      <HeaderExplore />
      <Container>
        <Content>
          {Object.keys(ACTIONTYPE_GROUPS).map((key) => (
            <Group key={key}>
              <GroupTitle>
                <FormattedMessage {...appMessages.actiontypeGroups[key]} />
              </GroupTitle>
              {ACTIONTYPE_GROUPS[key].types.map((typeId) => {
                const path = `${ROUTES.ACTIONS}/${typeId}`;
                return (
                  <TypeButton
                    key={typeId}
                    primary={ACTIONTYPE_GROUPS[key].primary}
                    href={`${path}`}
                    onClick={(evt) => {
                      if (evt && evt.preventDefault) evt.preventDefault();
                      onUpdatePath(path);
                    }}
                  >
                    <TypeTitle>
                      <TypeCount>{types.getIn([typeId, 'count']) || '0'}</TypeCount>
                      <TypeTitleInner>
                        <FormattedMessage {...appMessages.entities[`actions_${typeId}`].plural} />
                      </TypeTitleInner>
                    </TypeTitle>
                  </TypeButton>
                );
              })}
            </Group>
          ))}
        </Content>
      </Container>
    </div>
  );
}

ActionsOverview.propTypes = {
  // intl: intlShape.isRequired,
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
      dispatch(updatePath(path));
    },
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(injectIntl(ActionsOverview));
