import React from 'react';
import styled, { css } from 'styled-components';

import { Box } from 'grommet';

const complexMixin = css`
  padding-left: 0 !important;
  padding-right: 0 !important;
`;

const BoxPrint = styled((p) => <Box {...p} />)`
  ${({ isPrint, hidePrint }) => isPrint
    && hidePrint
    && 'display: none !important;'
}
  ${({ isPrint, padPrintHorizontal }) => isPrint
    && padPrintHorizontal === 'none'
    && complexMixin
}
  @media print {
    ${({ hidePrint }) => hidePrint && 'display: none !important;'}
    ${({ padPrintHorizontal }) => padPrintHorizontal === 'none' && complexMixin}
  }
`;

export default BoxPrint;
