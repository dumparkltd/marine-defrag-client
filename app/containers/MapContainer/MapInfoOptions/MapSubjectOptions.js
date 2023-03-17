import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box, Text, Button } from 'grommet';

import PrintHide from 'components/styled/PrintHide';
import PrintOnly from 'components/styled/PrintOnly';

const Styled = styled.div`
  padding-bottom: ${({ inList }) => inList ? 2 : 10}px;
  @media (min-width: ${({ theme }) => theme.breakpoints.medium}) {
    padding-bottom: ${({ inList }) => inList ? 5 : 15}px;
  }
`;
const TypeButton = styled((p) => <Button plain {...p} />)`
  padding: ${({ inList }) => inList ? '0px 2px' : '2px 2px'};
  border-bottom: 2px solid;
  border-bottom-color: ${({ active }) => active ? 'auto' : 'transparent'};
  background: none;
`;

function MapSubjectOptions({ options, inList, isPrintView }) {
  return (
    <Styled inList={inList}>
      <PrintHide isPrint={isPrintView}>
        {options && (
          <Box direction="row" gap="small">
            {
              options.map((option, i) => option && (
                <Box key={i}>
                  <TypeButton active={option.active} onClick={option.onClick} inList={inList}>
                    <Text size={inList ? 'medium' : 'large'}>
                      {option.title}
                    </Text>
                  </TypeButton>
                </Box>
              ))
            }
          </Box>
        )}
      </PrintHide>
      <PrintOnly isPrint={isPrintView}>
        {options && (
          <Box direction="row" gap="small">
            {
              options.filter((option) => option && option.active).map((option, i) => (
                <Box key={i}>
                  <Text size={inList ? 'medium' : 'large'}>
                    {option.title}
                  </Text>
                </Box>
              ))
            }
          </Box>
        )}
      </PrintOnly>
    </Styled>
  );
}

MapSubjectOptions.propTypes = {
  options: PropTypes.array,
  inList: PropTypes.bool,
  isPrintView: PropTypes.bool,
};

export default MapSubjectOptions;
