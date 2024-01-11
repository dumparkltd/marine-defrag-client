import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box } from 'grommet';
import IndeterminateCheckbox from 'components/forms/IndeterminateCheckbox';
import PrintHide from 'components/styled/PrintHide';
import BoxPrint from 'components/styled/BoxPrint';
import TextPrint from 'components/styled/TextPrint';
import ButtonFlatIconOnly from 'components/buttons/ButtonFlatIconOnly';
import Icon from 'components/Icon';
import { SORT_ORDER_OPTIONS } from 'containers/App/constants';

const Checkbox = styled(IndeterminateCheckbox)`
  vertical-align: middle;
`;
const Select = styled(PrintHide)`
  width: 20px;
  text-align: center;
  padding-right: 6px;
  position: relative;
`;

const SortButton = styled(ButtonFlatIconOnly)`
  color: inherit;
  padding: 0;
  @media (min-width: ${(props) => props.theme.breakpoints.medium}) {
    padding: 0;
  }
`;

export function CellHeaderMain({
  column,
  canEdit,
}) {
  const sortOrderOption = column.onSort && SORT_ORDER_OPTIONS.find((option) => column.sortOrder === option.value);
  /* eslint-disable jsx-a11y/label-has-for */
  return (
    <Box direction="row" align="center" justify="start">
      {canEdit && (
        <BoxPrint printHide>
          <Select>
            <Checkbox
              id="select-all"
              checked={column.selectedState}
              onChange={column.onSelect}
            />
          </Select>
        </BoxPrint>
      )}
      <Box>
        {canEdit && (
          <label htmlFor="select-all">
            <TextPrint weight={500} size="xsmallTight">
              {column.title}
            </TextPrint>
          </label>
        )}
        {!canEdit && (
          <TextPrint weight={500} size="xsmallTight">
            {column.title}
          </TextPrint>
        )}
      </Box>
      {column.onSort && (
        <BoxPrint printHide pad={{ left: 'medium' }}>
          <SortButton
            onClick={() => {
              if (column.sortActive) {
                const nextSortOrderOption = SORT_ORDER_OPTIONS.find((option) => sortOrderOption.nextValue === option.value);
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
              printHide={!column.sortActive}
              size="20px"
            />
          </SortButton>
        </BoxPrint>
      )}
    </Box>
  );
}

CellHeaderMain.propTypes = {
  column: PropTypes.object,
  canEdit: PropTypes.bool,
};

export default CellHeaderMain;
