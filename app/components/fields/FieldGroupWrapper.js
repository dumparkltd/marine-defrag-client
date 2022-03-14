import styled from 'styled-components';
import { palette } from 'styled-theme';

const FieldGroupWrapper = styled.div`
  background-color: ${(props) => props.groupType === 'dark' ? palette('light', 0) : 'transparent'};
  border-bottom: ${(props) => props.groupType === 'smartTaxonomy' ? '1px solid' : 0};
  border-bottom-color: ${palette('light', 1)};
  padding-top: ${({ theme }) => theme.global.edgeSize.small};
  padding-right: ${({ theme }) => theme.global.edgeSize.small};
  padding-left: ${({ seamless, theme }) => seamless ? 0 : theme.global.edgeSize.small};
  padding-bottom: ${({ seamless, theme }) => seamless ? '10px' : theme.global.edgeSize.small};
  @media (min-width: ${(props) => props.theme.breakpoints.medium}) {
    padding-top: ${({ theme }) => theme.global.edgeSize.medium};
    padding-right: ${({ theme }) => theme.global.edgeSize.medium};
    padding-left: ${({ seamless, theme }) => seamless ? 0 : theme.global.edgeSize.medium};
    padding-bottom: ${({ seamless, theme }) => seamless ? '20px' : theme.global.edgeSize.medium};
  }
  @media print {
    padding: ${({ aside, bottom }) => (aside && !bottom) ? '15px 0 10px 20px' : '15px 0 10px'};
    background-color: transparent;
  }
`;

export default FieldGroupWrapper;
