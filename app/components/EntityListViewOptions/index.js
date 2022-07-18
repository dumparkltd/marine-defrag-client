import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import ButtonFactory from 'components/buttons/ButtonFactory';

const Styled = styled.div`
  position: ${({ isOnMap }) => isOnMap ? 'absolute' : 'relative'};
  z-index: 20;
  margin-left: 10px;
  padding: 10px 0;
  display: inline-block;
  @media (min-width: ${(props) => props.theme.breakpoints.medium}) {
    margin-left: 60px;
    padding: 20px 0;
  }
`;
const ButtonGroup = styled.div`
  display: table;
  text-align: right;
  margin-bottom: 10px;
  @media (min-width: ${(props) => props.theme.breakpoints.medium}) {
    margin-bottom: 0;
  }
`;

const TableCell = styled.span`
  display: ${(props) => {
    if (props.hiddenMobile) {
      return 'none';
    }
    return 'table-cell';
  }};
  @media (min-width: ${(props) => props.theme.breakpoints.medium}) {
    display: table-cell;
    vertical-align: middle;
  }
`;
const ButtonWrap = styled.span`
  padding: 0 0.1em;
  @media print {
    display: none;
  }
`;


class EntityListViewOptions extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    const { options, isOnMap } = this.props;
    return (
      <Styled isOnMap={isOnMap}>
        {options && (
          <ButtonGroup>
            {
              options.map((option, i) => option && (
                <TableCell key={i}>
                  <ButtonWrap>
                    <ButtonFactory button={option} />
                  </ButtonWrap>
                </TableCell>
              ))
            }
          </ButtonGroup>
        )}
      </Styled>
    );
  }
}

EntityListViewOptions.propTypes = {
  isOnMap: PropTypes.bool,
  options: PropTypes.array,
};

export default EntityListViewOptions;
