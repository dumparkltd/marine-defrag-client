
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { Box, Text, Button } from 'grommet';
import Icon from 'components/Icon';
import { FormattedMessage } from 'react-intl';

import messages from './messages';

const ArrowIcon = styled(Icon)`
  font-weight: bold;
`;
const ExploreText = styled((p) => <Text weight="bold" {...p} />)`
  color: ${({ theme }) => theme.global.colors.text.brand};
  &:hover {
    color: ${({ theme }) => theme.global.colors.text.highlight};
  }
`;
const Styled = styled((p) => <Box {...p} />)`
  padding: ${({ isPrimary, theme }) => isPrimary ? `0px ${theme.sizes.navCardSearch.padding}px 0px 0px` : `0px ${theme.sizes.navCardSearch.padding}px`};
  position: absolute;
  right: 0px;
  bottom: 0px;
`;

function renderIcons(icons) {
  return (
    <Box direction="row" align="center">
      {icons.map((icon, index) => <Icon name={icon} key={index} />)}
    </Box>
  );
}
const BottomButtons = ({ primary, iconNames, onClick }) => (
  <Styled isPrimary={primary} direction="row" justify="between" fill="horizontal">
    {primary && <Box width="100%" />}
    <Box direction="row" justify="between" fill="horizontal">
      <Button onClick={onClick}>
        <Box pad="none" direction="row" align="center" gap="xsmall">
          <ExploreText>
            <FormattedMessage {...messages.explore} />
          </ExploreText>
          <ArrowIcon name="arrowRight" size="0.5em" />
        </Box>
      </Button>
      {iconNames && renderIcons(iconNames)}
    </Box>
  </Styled>
);

BottomButtons.propTypes = {
  primary: PropTypes.bool,
  onClick: PropTypes.func,
  iconNames: PropTypes.array,
};

export default BottomButtons;
