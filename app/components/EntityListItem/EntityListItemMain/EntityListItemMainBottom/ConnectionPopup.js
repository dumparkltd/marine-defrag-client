import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { palette } from 'styled-theme';
// import Link from 'containers/Link';

import { TEXT_TRUNCATE } from 'themes/config';

import { truncateText } from 'utils/string';

// import messages from 'components/ItemStatus/messages';
import ItemStatus from 'components/ItemStatus';

import Link from 'containers/Link';

const POPUP_WIDTH = 330;

// const Count = styled.span`
//   padding: 0 0.25em;
// `;

const PopupWrapper = styled.div`
  display: inline-block;
  cursor: pointer;
  font-size: 1em;
  touch-action: manipulation;
  position: relative;
  text-align: left;
  @media print {
    font-size: ${(props) => props.theme.sizes.print.default};
  }
`;

const POPUP_WIDTH_PX = `${POPUP_WIDTH}px`;

const Popup = styled.div`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: ${(props) => {
    if (props.align === 'right') return 'translate(-95%,0)';
    if (props.align === 'left') return 'translate(-5%,0)';
    return 'translate(-50%,0)';
  }};
  width: ${(props) => props.total > 0 ? POPUP_WIDTH_PX : 'auto'};
  min-width: ${(props) => props.total > 0 ? POPUP_WIDTH : POPUP_WIDTH / 2}px;
  display: block;
  z-index: 1;
  padding-bottom: 4px;
  font-size: 0.8em;
  @media print {
    font-size: ${(props) => props.theme.sizes.print.smaller};
  }
`;
const PopupInner = styled.div`
  width: 100%;
  display: block;
  background-color: ${palette('background', 0)};
  color: ${palette('text', 0)};
  box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.4);
`;
const TriangleBottom = styled.div`
   width: 20px;
   height: 11px;
   position: relative;
   overflow: hidden;
   left: ${(props) => {
    if (props.align === 'right') return '95';
    if (props.align === 'left') return '5';
    return '50';
  }}%;
   margin-left: -10px;

   &:after {
      content: "";
      position: absolute;
      width: 20px;
      height: 20px;
      background-color: ${palette('background', 0)};
      transform: rotate(45deg);
      bottom: 5px;
      left: 0px;
      box-shadow: -1px -1px 3px 1px rgba(0,0,0,0.5)
   }
`;

const PopupHeader = styled.div`
  padding: 0.5em 1em;
  background-color: ${palette('background', 1)};
`;
const PopupHeaderMain = styled.span`
  font-weight: bold;
`;

const PopupContent = styled.div`
  position: relative;
  max-height: 200px;
  height: ${(props) => props.height || 200}px;
  overflow: auto;
`;

const ItemContent = styled.span``;

const ListItem = styled.div`
  padding: 0.5em 1em;
  border-top: 1px solid ${palette('background', 1)};
`;

const ListItemLink = styled(Link)`
  color: ${palette('mainListItem', 0)};
  &:hover {
    color: ${palette('mainListItemHover', 0)};
  }
`;

const ConnectionLabel = styled.span`
  color: ${palette('text', 1)};
  text-decoration: underline;
  font-size: ${(props) => props.theme.sizes && props.theme.sizes.text.small};
  padding-top: 2px;
  @media print {
    font-size: ${(props) => props.theme.sizes.print.small};
  }
`;

export class ConnectionPopup extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor(props) {
    super(props);
    this.state = {
      popupOpen: false,
      popupRef: null,
      listItem_0: 0,
      listItem_1: 0,
      listItem_2: 0,
    };
  }

  calcHeight = () => {
    let height = 1;
    if (this.state.listItem_0) height += this.state.listItem_0.clientHeight;
    if (this.state.listItem_1) height += this.state.listItem_1.clientHeight;
    if (this.state.listItem_2) height += this.state.listItem_2.clientHeight;
    return height;
  }

  openPopup() {
    this.setState({ popupOpen: true });
  }

  closePopup() {
    this.setState({ popupOpen: false });
  }

  render() {
    const {
      entities, option, draft,
    } = this.props;
    const entitiesTotal = entities ? entities.length : 0;

    return (
      <PopupWrapper
        onMouseOver={() => this.openPopup()}
        onMouseLeave={() => this.closePopup()}
        onFocus={() => this.openPopup()}
        onBlur={() => null}
        onClick={() => this.state.popupOpen ? this.closePopup() : this.openPopup()}
        ref={(node) => {
          if (!this.state.popupRef) {
            this.setState({ popupRef: node });
          }
        }}
      >
        <ConnectionLabel pIndex={option.style} draft={draft}>
          {`${entitiesTotal} ${option.label(entitiesTotal, true)}`}
        </ConnectionLabel>
        {this.state.popupOpen
          && (
            <Popup
              align="left"
              total={entitiesTotal}
            >
              <PopupInner>
                <PopupHeader>
                  <PopupHeaderMain>
                    {`${entitiesTotal} ${option.label(entitiesTotal)}`}
                  </PopupHeaderMain>
                </PopupHeader>
                <PopupContent height={this.calcHeight()}>
                  {entities.map((entity, i) => (
                    <ListItem
                      key={i}
                      ref={(node) => i < 3 && this.setState({ [`listItem_${i}`]: node })}
                    >
                      <ListItemLink to={`${option.clientPath}/${entity.get('id')}`}>
                        { entity.getIn(['attributes', 'draft'])
                      && <ItemStatus draft />
                        }
                        <ItemContent>
                          {truncateText(entity.getIn(['attributes', 'title']), TEXT_TRUNCATE.CONNECTION_POPUP)}
                        </ItemContent>
                      </ListItemLink>
                    </ListItem>
                  ))}
                </PopupContent>
              </PopupInner>
              <TriangleBottom align="left" />
            </Popup>
          )
        }
      </PopupWrapper>
    );
  }
}

ConnectionPopup.propTypes = {
  entities: PropTypes.array,
  option: PropTypes.object,
  draft: PropTypes.bool,
};
ConnectionPopup.contextTypes = {
  intl: PropTypes.object,
};


export default ConnectionPopup;
