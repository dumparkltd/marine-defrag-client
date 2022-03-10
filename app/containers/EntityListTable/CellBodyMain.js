import React from 'react';
import PropTypes from 'prop-types';
import { Box, Text, Button } from 'grommet';
import PrintHide from 'components/styled/PrintHide';
import styled from 'styled-components';

const Select = styled(PrintHide)`
  width: 20px;
  text-align: center;
  @media (min-width: ${(props) => props.theme && props.theme.breakpoints ? props.theme.breakpoints.small : '769px'}) {
    padding-right: ${(props) => props.theme.sizes && props.theme.sizes.mainListItem.paddingHorizontal}px;
    padding-left: ${(props) => props.theme.sizes && props.theme.sizes.mainListItem.paddingHorizontal}px;
    width: 40px;
  }
`;

export function CellBodyMain({
  entity,
  // column,
  canEdit,
}) {
  return (
    <Box direction="row" align="center" justify="start">
      {canEdit && (
        <Select>
          <input
            type="checkbox"
            checked={entity.selected}
            onChange={(evt) => entity.onSelect(evt.target.checked)}
          />
        </Select>
      )}
      <Box>
        {Object.keys(entity.values).map((key) => (
          <Box key={key}>
            {key === 'title' && (
              <Button
                as="a"
                plain
                href={entity.href}
                onClick={entity.onClick}
                title={entity.values.title}
              >
                <Text size="medium">
                  {entity.values[key]}
                </Text>
              </Button>
            )}
            {key !== 'title' && (
              <Text
                color={key === 'code' ? 'dark-5' : 'black'}
                size={key === 'code' ? 'xsmall' : 'medium'}
              >
                {entity.values[key]}
              </Text>
            )}
          </Box>
        ))}
        {entity.draft && (
          <Box>
            <Text color="dark-5" size="xxsmall">
              [DRAFT]
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}

CellBodyMain.propTypes = {
  entity: PropTypes.object,
  // column: PropTypes.object,
  canEdit: PropTypes.bool,
};

export default CellBodyMain;
