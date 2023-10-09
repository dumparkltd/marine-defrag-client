import styled from 'styled-components';
import { palette } from 'styled-theme';

const SVG = styled.svg`
  display: ${({ printHide, isPrint }) => (printHide && isPrint) ? 'none' : 'inline-block'};
  fill: ${(props) => props.palette ? palette(props.paletteIndex) : 'currentColor'} !important;
  stroke: ${(props) => {
    if (props.hasStroke) {
      return props.palette ? palette(props.paletteIndex) : 'currentColor';
    }
    return 'none';
  }} !important;
  bottom: ${({ text }) => text ? 0.1 : 0}em;
  position: relative;
  vertical-align: middle;
  margin-right: ${({ textLeft, size }) => textLeft ? (parseFloat(size) / 4) + size.split(/[0-9]+/)[1] : 0};
  margin-left: ${({ textRight, size }) => textRight ? (parseFloat(size) / 4) + size.split(/[0-9]+/)[1] : 0};
  width: ${({ size, sizes }) => (sizes && sizes.mobile) ? sizes.mobile : size};
  height: ${({ size, sizes }) => (sizes && sizes.mobile) ? sizes.mobile : size};
  @media (min-width: ${({ theme }) => theme && theme.breakpoints ? theme.breakpoints.medium : '769px'}) {
    width: ${({ size, sizes }) => (sizes && sizes.small) ? sizes.small : size};
    height: ${({ size, sizes }) => (sizes && sizes.small) ? sizes.small : size};
  }
  @media (min-width: ${({ theme }) => theme && theme.breakpoints ? theme.breakpoints.large : '993px'}) {
    width: ${({ size, sizes }) => (sizes && sizes.medium) ? sizes.medium : size};
    height: ${({ size, sizes }) => (sizes && sizes.medium) ? sizes.medium : size};
  }
  @media (min-width: ${({ theme }) => theme && theme.breakpoints ? theme.breakpoints.xlarge : '1200px'}) {
    width: ${({ size, sizes }) => (sizes && sizes.large) ? sizes.large : size};
    height: ${({ size, sizes }) => (sizes && sizes.large) ? sizes.large : size};
  }
  @media print {
    display: ${({ printHide }) => printHide ? 'none' : 'inline-block'};
  }
`;

SVG.defaultProps = {
  size: '1em',
  paletteIndex: 0,
};

export default SVG;
