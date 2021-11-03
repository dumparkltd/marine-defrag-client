import React from 'react';
import PropTypes from 'prop-types';

import Container from 'components/styled/Container';
import ContainerWrapper from 'components/styled/Container/ContainerWrapper';

const Content = React.forwardRef((props, ref) => (
  <ContainerWrapper ref={ref} isStatic={props.withoutHeaderNav}>
    <Container inModal={props.inModal}>
      {props.children}
    </Container>
  </ContainerWrapper>
));

Content.propTypes = {
  children: PropTypes.node,
  inModal: PropTypes.bool,
  withoutHeaderNav: PropTypes.bool,
};

export default Content;
