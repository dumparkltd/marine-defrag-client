import React from 'react';
import PropTypes from 'prop-types';
import { Box } from 'grommet';
import styled from 'styled-components';
import CellBodyMain from './CellBodyMain';
import CellBodyPlain from './CellBodyPlain';
import CellBodyActors from './CellBodyActors';
import CellBodyActions from './CellBodyActions';
import CellBodyCategories from './CellBodyCategories';
import CellBodyHasResource from './CellBodyHasResource';
import CellBodyBarChart from './CellBodyBarChart';
import CellHeaderMain from './CellHeaderMain';
import CellHeaderPlain from './CellHeaderPlain';

const Table = styled.table`
  border-spacing: 0;
  border-collapse: collapse;
  width: inherit;
  table-layout: fixed;
  width: 100%;
`;
const TableHeader = styled.thead``;
const TableBody = styled.tbody``;
const TableRow = styled.tr`
  height: 100%;
`;
const getColWidth = ({
  col, count, isIndicator, colSpan = 1,
}) => {
  if (count === 1) {
    return 100;
  }
  if (isIndicator) {
    if (count === 2) {
      return col.type === 'main' ? 50 : 50;
    }
    if (count > 2) {
      if (col.type === 'indicator') {
        return 25;
      }
      if (col.type === 'main') {
        return 25;
      }
      return 50 / (count - 2);
    }
  }
  if (count === 2) {
    return col.type === 'main' ? 50 : 50;
  }
  if (count > 2) {
    return col.type === 'main' ? 40 : (60 / (count - 1)) * colSpan;
  }
  // if (count > 4) {
  //   return col.type === 'main' ? 40 : (60 / (count - 1)) * colSpan;
  // }
  return 0;
};
const TableCellHeader = styled.th`
  margin: 0;
  padding: 0;
  font-weight: inherit;
  text-align: inherit;
  height: 100%;
  text-align: start;
  border-bottom: solid 1px;
  border-bottom-color: ${({ utility }) => utility ? 'transparent' : 'rgba(0,0,0,0.33)'};
  padding-left: ${({ col, first }) => (col.align !== 'end' && !first) ? 20 : 8}px;
  padding-right: ${({ col, last }) => (col.align === 'end' && !last) ? 20 : 8}px;
  padding-top: 6px;
  padding-bottom: 6px;
  width: ${getColWidth}%;
`;
const TableCellHeaderInner = styled((p) => <Box {...p} />)`
`;
const TableCellBody = styled.td`
  margin: 0;
  padding: 0;
  font-weight: inherit;
  text-align: inherit;
  height: 100%;
  text-align: start;
  border-bottom: solid 1px #DADADA;
  padding-left: ${({ col, first }) => (col.align !== 'end' && !first) ? 20 : 8}px;
  padding-right: ${({ col, last }) => (col.align === 'end' && !last) ? 20 : 8}px;
  padding-top: 6px;
  padding-bottom: 6px;
  word-wrap:break-word;
  width: ${getColWidth}%;
`;
const TableCellBodyInner = styled((p) => <Box {...p} />)`
  padding: 6px 0;
`;

export function EntitiesTable({
  entities,
  canEdit,
  columns,
  headerColumns,
  onEntityClick,
  columnMaxValues,
  headerColumnsUtility,
  memberOption,
  subjectOptions,
}) {
  return (
    <Box fill="horizontal">
      <Table>
        {headerColumns && (
          <TableHeader>
            {headerColumnsUtility && (
              <TableRow>
                {headerColumnsUtility.map(
                  (col, i) => (
                    <TableCellHeader
                      key={i}
                      scope="col"
                      col={col}
                      count={headerColumns.length}
                      colSpan={col.span || 1}
                      isIndicator={col.isIndicator}
                      first={i === 0}
                      last={i === headerColumns.length - 1}
                    >
                      {col.type === 'options' && (
                        <Box>
                          {subjectOptions && (
                            <Box>
                              {subjectOptions}
                            </Box>
                          )}
                          {memberOption && (
                            <Box>
                              {memberOption}
                            </Box>
                          )}
                        </Box>
                      )}
                    </TableCellHeader>
                  )
                )}
              </TableRow>
            )}
            <TableRow>
              {headerColumns.map(
                (col, i) => (
                  <TableCellHeader
                    key={i}
                    scope="col"
                    col={col}
                    count={headerColumns.length}
                    isIndicator={col.isIndicator}
                    first={i === 0}
                    last={i === headerColumns.length - 1}
                  >
                    <TableCellHeaderInner>
                      {col.type === 'main' && (
                        <CellHeaderMain
                          column={col}
                          canEdit={canEdit}
                        />
                      )}
                      {col.type !== 'main' && (
                        <CellHeaderPlain column={col} />
                      )}
                    </TableCellHeaderInner>
                  </TableCellHeader>
                )
              )}
            </TableRow>
          </TableHeader>
        )}
        <TableBody>
          {entities.length > 0 && entities.map((entity, key) => (
            <TableRow key={key}>
              {columns.map((col, i) => (
                <TableCellBody
                  key={i}
                  scope="row"
                  col={col}
                  count={headerColumns.length}
                  first={i === 0}
                  last={i === headerColumns.length - 1}
                >
                  <TableCellBodyInner>
                    {col.type === 'main' && (
                      <CellBodyMain
                        entity={entity[col.id]}
                        canEdit={canEdit}
                        column={col}
                      />
                    )}
                    {col.type === 'attribute' && (
                      <CellBodyPlain
                        entity={entity[col.id]}
                        column={col}
                      />
                    )}
                    {col.type === 'amount' && (
                      <CellBodyPlain
                        entity={entity[col.id]}
                        column={col}
                      />
                    )}
                    {col.type === 'indicator' && (
                      <CellBodyPlain
                        entity={entity[col.id]}
                        column={col}
                      />
                    )}
                    {col.type === 'userrole' && (
                      <CellBodyPlain
                        entity={entity[col.id]}
                        column={col}
                        primary
                      />
                    )}
                    {col.type === 'date' && (
                      <CellBodyPlain
                        entity={entity[col.id]}
                        column={col}
                      />
                    )}
                    {col.type === 'actors' && (
                      <CellBodyActors
                        entity={entity[col.id]}
                        onEntityClick={onEntityClick}
                        column={col}
                      />
                    )}
                    {col.type === 'targets' && (
                      <CellBodyActors
                        entity={entity[col.id]}
                        onEntityClick={onEntityClick}
                        column={col}
                      />
                    )}
                    {col.type === 'members' && (
                      <CellBodyActors
                        entity={entity[col.id]}
                        onEntityClick={onEntityClick}
                        column={col}
                      />
                    )}
                    {col.type === 'associations' && (
                      <CellBodyActors
                        entity={entity[col.id]}
                        onEntityClick={onEntityClick}
                        column={col}
                      />
                    )}
                    {col.type === 'taxonomy' && (
                      <CellBodyCategories
                        entity={entity[col.id]}
                        column={col}
                      />
                    )}
                    {col.type === 'hasResources' && (
                      <CellBodyHasResource
                        entity={entity[col.id]}
                        onEntityClick={onEntityClick}
                        column={col}
                      />
                    )}
                    {col.type === 'resourceActions' && (
                      <CellBodyActions
                        entity={entity[col.id]}
                        column={col}
                        onEntityClick={onEntityClick}
                      />
                    )}
                    {col.type === 'actorActions' && (
                      <CellBodyBarChart
                        value={entity[col.id].value}
                        maxvalue={Object.values(columnMaxValues).reduce((memo, val) => Math.max(memo, val), 0)}
                        issecondary={col.members}
                        subject={col.subject}
                        column={col}
                      />
                    )}
                    {col.type === 'actiontype' && (
                      <CellBodyBarChart
                        value={entity[col.id].value}
                        maxvalue={Object.values(columnMaxValues).reduce((memo, val) => Math.max(memo, val), 0)}
                        subject={col.subject}
                        column={col}
                      />
                    )}
                  </TableCellBodyInner>
                </TableCellBody>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

EntitiesTable.propTypes = {
  entities: PropTypes.array.isRequired,
  columns: PropTypes.array,
  columnMaxValues: PropTypes.object,
  headerColumns: PropTypes.array,
  headerColumnsUtility: PropTypes.array,
  canEdit: PropTypes.bool,
  onEntityClick: PropTypes.func,
  memberOption: PropTypes.node,
  subjectOptions: PropTypes.node,
};

export default EntitiesTable;
