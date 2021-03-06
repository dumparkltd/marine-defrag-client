import styled from 'styled-components';
import { palette } from 'styled-theme';

const ListLabel = styled.h4`
  display: table-cell;
  vertical-align: middle;
  font-weight: 500;
  color: ${palette('text', 0)};
  margin: 0;
  font-size: ${(props) => props.theme.text.small.size};
  line-height: ${(props) => props.theme.text.small.height};
  @media print {
    font-size: ${(props) => props.theme.sizes.print.default};
  }
`;

export default ListLabel;
