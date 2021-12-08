import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { palette } from 'styled-theme';
import { FormattedMessage } from 'react-intl';

import Button from 'components/buttons/Button';

import appMessages from 'containers/App/messages';

// TODO compare EntityListSidebarOption
const Styled = styled(Button)`
  display: table;
  table-layout: fixed;
  width: 100%;
  padding:  ${({ small }) => small ? '0.15em 8px 0.15em 24px' : '0.3em 8px 0.3em 12px'};
  text-align: left;
  color:  ${(props) => props.active ? palette('asideListItem', 1) : palette('asideListItem', 0)};
  background-color: ${(props) => props.active ? palette('asideListItem', 3) : palette('asideListItem', 2)};
  border-bottom: 1px solid ${palette('asideListItem', 4)};
  &:hover {
    color: ${(props) => props.active ? palette('asideListItemHover', 1) : palette('asideListItemHover', 0)};
    background-color: ${(props) => props.active ? palette('asideListItemHover', 3) : palette('asideListItemHover', 2)};
    border-bottom-color: ${palette('asideListItemHover', 4)}
  }
  @media (min-width: ${(props) => props.theme.breakpoints.small}) {
    padding:  ${({ small }) => small ? '0.15em 8px 0.15em 24px' : '0.3em 8px 0.3em 12px'};
  }
  @media (min-width: ${(props) => props.theme.breakpoints.large}) {
    padding:  ${({ small }) => small ? '0.25em 8px 0.25em 32px' : '0.5em 8px 0.5em 16px'};
  }
`;

const TaxTitle = styled.div`
  font-weight: bold;
  vertical-align: middle;
  display: table-cell;
`;

class TaxonomySidebarItem extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    const { taxonomy, nested, onTaxonomyClick } = this.props;
    return (
      <Styled
        small={nested}
        onClick={(evt) => {
          onTaxonomyClick(evt);
          taxonomy.onLink(taxonomy.active);
        }}
        active={taxonomy.active}
        paletteId={parseInt(taxonomy.id, 10)}
        onMouseOver={() => taxonomy.onMouseOver && taxonomy.onMouseOver()}
        onFocus={() => taxonomy.onMouseOver && taxonomy.onMouseOver()}
        onMouseOut={() => taxonomy.onMouseOver && taxonomy.onMouseOver(false)}
        onBlur={() => taxonomy.onMouseOver && taxonomy.onMouseOver(false)}
      >
        <TaxTitle>
          <FormattedMessage {...appMessages.entities.taxonomies[taxonomy.id].plural} />
        </TaxTitle>
      </Styled>
    );
  }
}

TaxonomySidebarItem.propTypes = {
  taxonomy: PropTypes.object,
  nested: PropTypes.bool,
  onTaxonomyClick: PropTypes.func,
};

TaxonomySidebarItem.contextTypes = {
  intl: PropTypes.object.isRequired,
};

export default TaxonomySidebarItem;
