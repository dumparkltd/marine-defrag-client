import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { palette } from 'styled-theme';
import { Map, List } from 'immutable';

import Messages from 'components/Messages';
import Component from 'components/styled/Component';

import EntityListItemMain from './EntityListItemMain';
import EntityListItemSelect from './EntityListItemSelect';

// import messages from './messages';

const Styled = styled.span`
  display: inline-block;
  vertical-align: top;
  width: 100%;
`;
const Item = styled(Component)`
  display: table;
  width: 100%;
  color: ${palette('mainListItem', 0)};
  background-color: ${palette('mainListItem', 1)};
  border-bottom: ${(props) => props.error ? '1px solid' : 0};
  border-left: ${(props) => props.error ? '1px solid' : 0};
  border-right: ${(props) => props.error ? '1px solid' : 0};
  border-color: ${palette('error', 0)};
`;
const MainWrapper = styled(Component)`
  width:100%;
  @media (min-width: ${(props) => props.theme && props.theme.breakpoints ? props.theme.breakpoints.small : '769px'}) {
    display: table-cell;
    width: 100%;
    border-right: 0;
    border-right-color: ${palette('background', 1)};
  }
  @media print {
    border: none;
    display: table-cell;
    width: 100%
  }
`;
const MainInnerWrapper = styled(Component)`
  display: table;
  width: 100%;
`;

class EntityListItem extends React.Component { // eslint-disable-line react/prefer-stateless-function
  shouldComponentUpdate(nextProps) {
    return this.props.entity !== nextProps.entity
      || this.props.isSelected !== nextProps.isSelected
      || this.props.wrapper !== nextProps.wrapper
      || this.props.error !== nextProps.error;
  }

  transformMessage = (type, msg) => msg;
  // transformMessage = (type, msg) => {
  //   // const { intl } = this.context;
  //   // if (type === 'delete') {
  //   //   return intl
  //   //     ? intl.formatMessage(messages.associationNotExistent)
  //   //     : msg;
  //   // }
  //   // if (type === 'new') {
  //   //   // return intl
  //   //   //   ? intl.formatMessage(messages.associationAlreadyPresent)
  //   //   //   : msg;
  //   //   return msg;
  //   // }
  //   return msg;
  // }

  render() {
    const {
      entity,
      isManager,
      isSelected,
      onSelect,
      entityIcon,
      config,
      taxonomies,
      onEntityClick,
      entityPath,
      connections,
      error,
      isConnection,
    } = this.props;

    return (
      <Styled>
        { error && error.map((updateError, i) => (
          <Messages
            key={i}
            type="error"
            messages={
              updateError
                .getIn(['error', 'messages'])
                .map((msg) => this.transformMessage(updateError.get('type'), msg))
                .valueSeq()
                .toArray()
            }
            onDismiss={() => this.props.onDismissError(updateError.get('key'))}
            preMessage={false}
            details
          />
        ))}
        <Item error={error}>
          <MainWrapper>
            <MainInnerWrapper>
              {isManager
                && <EntityListItemSelect checked={isSelected} onSelect={onSelect} />
              }
              <EntityListItemMain
                entity={entity}
                taxonomies={taxonomies}
                connections={connections}
                entityIcon={entityIcon}
                config={config}
                entityPath={entityPath}
                onEntityClick={onEntityClick}
                wrapper={this.props.wrapper}
                isManager={isManager}
                isConnection={isConnection}
              />
            </MainInnerWrapper>
          </MainWrapper>
        </Item>
      </Styled>
    );
  }
}

EntityListItem.propTypes = {
  entity: PropTypes.instanceOf(Map).isRequired,
  taxonomies: PropTypes.instanceOf(Map),
  connections: PropTypes.instanceOf(Map),
  error: PropTypes.instanceOf(List),
  isManager: PropTypes.bool,
  isSelected: PropTypes.bool,
  isConnection: PropTypes.bool,
  onSelect: PropTypes.func,
  entityIcon: PropTypes.func,
  entityPath: PropTypes.string,
  config: PropTypes.object,
  onEntityClick: PropTypes.func,
  onDismissError: PropTypes.func,
  wrapper: PropTypes.object,
};

EntityListItem.defaultProps = {
  isSelected: false,
};

EntityListItem.contextTypes = {
  intl: PropTypes.object,
};

export default EntityListItem;
