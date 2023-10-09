import styled from 'styled-components';
import { palette } from 'styled-theme';

import Button from '../Button';

const ButtonTagFilter = styled(Button)`
  color: ${({ theme, isPrint }) => isPrint ? theme.global.colors.text.brand : palette('text', 2)};
  background-color: ${(props) => props.isPrint ? 'white' : palette(props.palette, props.pIndex || 0)};
  padding:${({ isPrint }) => isPrint ? ' 1px 4px' : '1px 6px'};
  margin-right: 2px;
  border-radius: 3px;
  font-size:${({ isPrint }) => isPrint ? '9pt' : '0.85em'};
  border: 1px solid ${(props) => props.isPrint ? props.theme.global.colors.text.brand : palette(props.palette, props.pIndex || 0)};
  &:hover {
    color: ${palette('text', 2)};
    background-color: ${(props) => palette(props.disabled ? props.paletteHover : props.palette, props.pIndex || 0)};
  }
  @media (min-width: ${({ theme }) => theme.breakpoints.medium}) {
    padding:${({ isPrint }) => isPrint ? ' 1px 4px' : '1px 6px'};
    font-size:${({ isPrint }) => isPrint ? '9pt' : '0.85em'};
  }
  @media print {
    &:hover {
      color: ${palette('text', 1)};
      background: transparent;
    }
  }
`;

export default ButtonTagFilter;
