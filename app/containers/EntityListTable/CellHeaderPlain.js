import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box, Text } from 'grommet';
import ButtonFlatIconOnly from 'components/buttons/ButtonFlatIconOnly';
import Icon from 'components/Icon';
import { SORT_ORDER_OPTIONS } from 'containers/App/constants';


const SortButton = styled(ButtonFlatIconOnly)`
  color: inherit;
  padding: 0;
  @media (min-width: ${(props) => props.theme.breakpoints.small}) {
    padding: 0;
  }
`;

export function CellHeaderPlain({ column, align = 'start' }) {
  const sortOrderOption = column.onSort && SORT_ORDER_OPTIONS.find(
    (option) => column.sortOrder === option.value
  );
  return (
    <Box direction="row" align="center" justify="start">
      <Box>
        <Text weight={500} size="small" textAlign={align} wordBreak="keep-all">
          {column.title}
        </Text>
      </Box>
      {column.onSort && (
        <Box pad={{ left: 'xxsmall' }}>
          <SortButton
            onClick={() => {
              if (column.sortActive) {
                const nextSortOrderOption = SORT_ORDER_OPTIONS.find(
                  (option) => sortOrderOption.nextValue === option.value
                );
                column.onSort(column.id || column.type, nextSortOrderOption.value);
              } else {
                column.onSort(column.id || column.type, sortOrderOption.order);
              }
            }}
          >
            <Icon
              name={column.sortActive && sortOrderOption
                ? sortOrderOption.icon
                : 'sorting'
              }
              palette="dark"
              paletteIndex={column.sortActive ? 1 : 4}
              hidePrint={!column.sortActive}
            />
          </SortButton>
        </Box>
      )}
    </Box>
  );
}

CellHeaderPlain.propTypes = {
  column: PropTypes.object,
  align: PropTypes.string,
};

export default CellHeaderPlain;
