import React from 'react';
import PropTypes from 'prop-types';
import { Box, Text, Button } from 'grommet';
import PrintHide from 'components/styled/PrintHide';
import styled from 'styled-components';

const Select = styled(PrintHide)`
  width: 20px;
  text-align: center;
  padding-right: 6px;
`;

const Link = styled((p) => <Button as="a" plain {...p} />)`
  text-align: ${({ align }) => align === 'end' ? 'right' : 'left'};
  line-height: 16px;
`;
const Label = styled((p) => <Text size="small" {...p} />)`
  line-height: 16px;
`;

export function CellBodyMain({
  entity,
  // column,
  canEdit,
}) {
  return (
    <Box direction="row" align="center" justify="start">
      {canEdit && (
        <PrintHide>
          <Select>
            <input
              type="checkbox"
              checked={entity.selected}
              onChange={(evt) => entity.onSelect(evt.target.checked)}
            />
          </Select>
        </PrintHide>
      )}
      <Box>
        {Object.keys(entity.values).map((key) => (
          <Box key={key}>
            {(key === 'title' || key === 'name') && (
              <Link
                href={entity.href}
                onClick={entity.onClick}
                title={entity.values.title}
              >
                <Label size="small">
                  {entity.values[key]}
                </Label>
              </Link>
            )}
            {key !== 'title' && key !== 'name' && (
              <Label
                color="dark-5"
                size="xsmall"
              >
                {entity.values[key]}
              </Label>
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
