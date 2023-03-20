import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, intlShape, injectIntl } from 'react-intl';
import styled, { withTheme } from 'styled-components';
import { Box, Text, Heading } from 'grommet';
import appMessages from 'containers/App/messages';

import Logo from './Logo';
import messages from './messages';

const Brand = styled.div`
  color: ${({ theme }) => theme.global.colors.text.brand} !important;
  height: ${({ theme }) => theme.sizes.header.banner.heightMobile}px;
  @media (min-width: ${({ theme }) => theme.breakpoints.medium}) {
    height: ${({ theme }) => theme.sizes.header.banner.height}px;
  }
`;
const Styled = styled.div`
  display: block;
  height: ${({ theme }) => theme.sizes.header.banner.heightPrint}px;
  position: relative;
  box-shadow: none;
  background: white;
  top: 0;
  left: 0;
  right: 0;
  margin-bottom: 0;
  border-bottom: 1px solid #CECED2;
`;
const Claim = styled((p) => <Text {...p} />)`
  font-family: ${({ theme }) => theme.fonts.title};
  font-size: ${({ theme }) => theme.text.xxsmall.size};
  line-height: ${({ theme }) => theme.text.xxsmall.size};
  @media (min-width: ${({ theme }) => theme.breakpoints.medium}) {
    font-size: ${({ theme }) => theme.text.xsmall.size};
    line-height: ${({ theme }) => theme.text.xsmall.size};
  }
`;
const BrandTitle = styled((p) => <Heading level={1} {...p} />)`
  margin: 0;
  font-family: ${({ theme }) => theme.fonts.title};
  font-size: ${({ theme }) => theme.sizes.header.print.title};
  line-height: ${({ theme }) => theme.text.small.size};
  font-weight: 500;
  padding: 0;
  @media (min-width: ${({ theme }) => theme.breakpoints.medium}) {
    font-size: ${({ theme }) => theme.text.large.size};
    line-height: ${({ theme }) => theme.text.large.size};
  }
`;

const Link = styled.a`
  color: ${({ theme }) => theme.global.colors.text.secondary};
  font-size: ${({ theme }) => theme.sizes.print.smaller};
  :hover {
    color: ${({ theme }) => theme.global.colors.text.secondary};
  }
`;
const Meta = styled.div`
  color: ${({ theme }) => theme.global.colors.text.secondary};
  font-size: ${({ theme }) => theme.sizes.print.smaller};
  line-height: ${({ theme }) => theme.sizes.print.large};
  text-align: right;
`;

function HeaderPrint({ theme, intl }) {
  const appTitle = `${intl.formatMessage(appMessages.app.title)} - ${intl.formatMessage(appMessages.app.claim)}`;
  const now = new Date();
  let url = window && window.location
    && `${window.location.origin}${window.location.pathname}`;
  if (url && window.location.search) {
    url = `${url}${window.location.search}`;
  }
  return (
    <Styled>
      <Box direction="row" fill justify="between" align="center">
        <Box flex={{ shrink: 0 }}>
          <Brand>
            <Box direction="row" align="center">
              <Logo src={theme.media.headerLogoPrint} alt={appTitle} />
              <Box fill="vertical" pad={{ left: 'small' }} justify="center" gap="xxsmall">
                <Claim>
                  <FormattedMessage {...appMessages.app.claim} />
                </Claim>
                <BrandTitle>
                  <FormattedMessage {...appMessages.app.title} />
                </BrandTitle>
              </Box>
            </Box>
          </Brand>
        </Box>
        <Box align="end" gap="xsmall">
          <Meta>
            {`${intl.formatMessage(messages.dateLabelPrint)} ${intl.formatDate(now)}, ${intl.formatTime(now)}`}
          </Meta>
          <Meta>
            {`${intl.formatMessage(messages.urlLabelPrint)} `}
            <Link href={url} title="link">
              {url}
            </Link>
          </Meta>
        </Box>
      </Box>
    </Styled>
  );
}

HeaderPrint.propTypes = {
  intl: intlShape.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withTheme(injectIntl(HeaderPrint));
