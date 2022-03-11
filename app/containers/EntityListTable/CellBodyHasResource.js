import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  Box, Text, Button, Drop,
} from 'grommet';
import { StatusGood } from 'grommet-icons';
import styled from 'styled-components';
import appMessages from 'containers/App/messages';

import { ROUTES } from 'themes/config';
const LinkTT = styled(
  React.forwardRef((p, ref) => <Button plain {...p} ref={ref} />)
)`
  text-align: ${({ align }) => align === 'end' ? 'right' : 'left'};
  line-height: 12px;
`;
const LinkInTT = styled((p) => <Button as="a" plain {...p} />)`
  line-height: 13px;
`;
const LabelInTT = styled((p) => <Text size="xsmall" wordBreak="keep-all" {...p} />)`
  line-height: 13px;
`;

const getLink = (res) => `${ROUTES.RESOURCE}/${res.get('id')}`;

const getOnClick = (res, onEntityClick) => (evt) => {
  if (evt) evt.preventDefault();
  onEntityClick(res.get('id'), ROUTES.RESOURCE);
};

export function CellBodyHasResource({
  entity,
  align = 'center',
  onEntityClick,
}) {
  const buttonRef = useRef();
  const [showContent, setShowContent] = useState(false);
  return (
    <Box alignContent={align}>
      {entity.value && (
        <LinkTT
          ref={buttonRef}
          alignSelf={align}
          onClick={() => setShowContent(!showContent)}
        >
          <StatusGood size="small" />
        </LinkTT>
      )}
      {entity.value && showContent && buttonRef.current && (
        <Drop
          target={buttonRef.current}
          onClickOutside={() => setShowContent(false)}
          align={{
            bottom: 'top',
            right: 'right',
          }}
          margin={{ horizontal: 'xsmall', vertical: 'xsmall' }}
          background="white"
          elevation="small"
          overflow={{
            vertical: 'auto',
            horizontal: 'hidden',
          }}
        >
          <Box
            style={{
              minWidth: '240px',
              maxWidth: '340px',
            }}
            pad={{
              horizontal: 'small',
              vertical: 'medium',
            }}
            flex={{ shrink: 0 }}
          >
            <Box border="bottom" flex={{ shrink: 0 }} margin={{ bottom: 'small' }}>
              <Text size="small" weight={500}>
                <FormattedMessage {...appMessages.entities[`resources_${entity.resourcetype_id}`].single} />
              </Text>
            </Box>
            <Box flex={{ shrink: 0 }}>
              <LinkInTT
                href={getLink(entity.value)}
                onClick={getOnClick(entity.value, onEntityClick)}
                title={entity.value.getIn(['attributes', 'title'])}
              >
                <LabelInTT>
                  {entity.value.getIn(['attributes', 'title'])}
                </LabelInTT>
              </LinkInTT>
            </Box>
          </Box>
        </Drop>
      )}
    </Box>
  );
}

CellBodyHasResource.propTypes = {
  entity: PropTypes.object,
  align: PropTypes.string,
  onEntityClick: PropTypes.func,
};


export default CellBodyHasResource;
