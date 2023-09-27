/*
 *
 * TagList
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
// import { FormattedMessage } from 'react-intl';

import styled from 'styled-components';
import { palette } from 'styled-theme';
import { reduce, groupBy } from 'lodash/collection';
import { Box } from 'grommet';

import appMessage from 'utils/app-message';
import { lowerCase } from 'utils/string';

import Icon from 'components/Icon';
import Button from 'components/buttons/Button';
import ButtonTagFilter from 'components/buttons/ButtonTagFilter';
// import PrintOnly from 'components/styled/PrintOnly';

// import messages from './messages';

const Styled = styled((p) => <Box direction="row" align="end" {...p} />)`
  justify: ${(props) => props.isPrint ? 'start' : 'end'};
`;

const Tags = styled((p) => <Box direction="row" {...p} />)``;

const Clear = styled(Button)`
  background-color: ${palette('background', 4)};
  padding: 1px 6px;
  @media (min-width: ${(props) => props.theme.breakpoints.medium}) {
    padding: 1px 6px;
  }
  @media print {
    display: none;
  }
`;

// const LabelPrint = styled(PrintOnly)`
//   margin-top: 10px;
//   font-size: ${(props) => props.theme.sizes.print.smaller};
// `;

const ConnectionGroupLabel = styled.span`
  color: ${palette('text', 1)};
  font-size: ${(props) => props.theme.sizes && props.theme.sizes.text.smaller};
  padding-top: 2px;
  @media print {
    font-size: ${(props) => props.theme.sizes.print.smaller};
  }
`;

export const getFilterLabel = (filter, intl, long) => {
  // not used I think?
  if (filter.message) {
    console.log('USED AFTER ALL');
    return filter.messagePrefix
      ? `${filter.messagePrefix} ${lowerCase(appMessage(intl, filter.message))}`
      : appMessage(intl, filter.message);
  }
  if (filter.labels) {
    return reduce(filter.labels, (memo, label) => {
      if (!label.label) return memo;
      let labelValue = label.appMessage ? appMessage(intl, label.label) : label.label;
      labelValue = label.postfix ? `${labelValue}${label.postfix}` : labelValue;
      return `${memo}${label.lowerCase ? lowerCase(labelValue) : labelValue} `;
    }, '').trim();
  }
  return long && filter.labelLong ? filter.labelLong : filter.label;
};

export class TagList extends React.Component { // eslint-disable-line react/prefer-stateless-function
  render() {
    const { filters, long, isPrintView } = this.props;
    const { intl } = this.context;
    const hasFilters = filters.length > 0;
    const groupedFilters = groupBy(filters, 'group');
    return (
      <Styled printHide={!hasFilters}>
        {hasFilters && (
          <Tags gap="xsmall">
            {Object.keys(groupedFilters).map((group, i) => (
              <Box key={i}>
                <ConnectionGroupLabel>
                  {group}
                </ConnectionGroupLabel>
                <Box direction="row">
                  {groupedFilters[group].map((filter, j) => (
                    <ButtonTagFilter
                      key={j}
                      onClick={filter.onClick}
                      palette={filter.type || 'attributes'}
                      paletteHover={`${filter.type || 'attributes'}Hover`}
                      pIndex={parseInt(filter.id, 10) || 0}
                      disabled={!filter.onClick || isPrintView}
                      isPrint={isPrintView}
                    >
                      {getFilterLabel(filter, intl, long)}
                      {filter.onClick
                        && <Icon name="removeSmall" text textRight printHide isPrint={isPrintView} />
                      }
                    </ButtonTagFilter>
                  ))}
                </Box>
              </Box>
            ))}
          </Tags>
        )}
        {this.props.onClear && hasFilters && filters.length > 1 && (
          <Clear
            onClick={this.props.onClear}
          >
            <Icon name="removeSmall" />
          </Clear>
        )}
      </Styled>
    );
  }
}

TagList.propTypes = {
  filters: PropTypes.array,
  onClear: PropTypes.func,
  long: PropTypes.bool,
  isPrintView: PropTypes.bool,
};

TagList.contextTypes = {
  intl: PropTypes.object.isRequired,
};

export default TagList;
