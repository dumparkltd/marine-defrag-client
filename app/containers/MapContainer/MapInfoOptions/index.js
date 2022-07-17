import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
// import { FormattedMessage, intlShape, injectIntl } from 'react-intl';
import { Box, Text, Button } from 'grommet';

import qe from 'utils/quasi-equals';

import MapKey from './MapKey';
import MapSubjectOptions from './MapSubjectOptions';
import MapOption from './MapOption';
import SelectIndicators from './SelectIndicators';

const Title = styled((p) => <Text weight={600} {...p} />)``;
const SubTitle = styled((p) => <Text size="small" {...p} />)``;

const Styled = styled.div`
  position: absolute;
  z-index: 50;
  bottom: 10px;
  width: 100%;
  height: 250px;
  left: 0;
  max-width: 380px;
  @media (min-width: 370px) {
    left: 10px;
    bottom: 50px;
  }
`;
const Pane = styled((p) => <Box {...p} />)`
  position: absolute;
  z-index: 51;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
`;
// const X = styled((p) => (
//   <Box
//     elevation="small"
//     background="white"
//     pad={{
//       horizontal: 'small',
//       bottom: 'large',
//     }}
//     {...p}
//   />
// ))`
//   position: absolute;
//   z-index: 50;
//   bottom: 10px;
//   width: 100%;
//   height: 200px;
//   left: 0;
//   max-width: 350px;
//   padding: 5px 10px 5px;
//   @media (min-width: 370px) {
//     left: 10px;
//     bottom: 50px;
//   }
// `;

export function MapInfoOptions({
  options,
  countryMapSubject,
  minMaxValues,
  circleLayerConfig,
}) {
  if (!options) return null;
  const [tab, setTab] = useState(options[0].id);
  const activeTab = options.find((o) => qe(tab, o.id));
  const renderTabs = (shadow) => options
    && options.map(
      (option) => {
        const active = qe(tab, option.id);
        return (
          <Box
            key={option.id}
            elevation={shadow ? 'medium' : ''}
            style={{ zIndex: active ? 2 : 0 }}
            background={(shadow || active) ? 'white' : ''}
          >
            <Button
              plain
              onClick={() => setTab(option.id)}
            >
              <Box pad={{ vertical: 'xsmall', horizontal: 'small' }}>
                <Text
                  size="small"
                  weight={active ? 500 : 300}
                  style={{
                    opacity: shadow ? 0 : 1,
                  }}
                >
                  {option.tabTitle}
                </Text>
              </Box>
            </Button>
          </Box>
        );
      }
    );
  let activeIndicatorOption;
  let showIndicatorInfo;
  if (activeTab.id === 'indicators') {
    activeIndicatorOption = activeTab.ffOptions.find(
      (o) => qe(o.value, activeTab.ffActiveOptionId || '0')
    );
    showIndicatorInfo = activeIndicatorOption
    && activeIndicatorOption.value !== '0'
    && circleLayerConfig
    && minMaxValues
    && minMaxValues.points;
  }
  return (
    <Styled>
      <Pane>
        <Box fill="horizontal" direction="row" style={{ zIndex: 1 }}>
          {renderTabs(true)}
        </Box>
        <Box flex={{ grow: 1 }} direction="row" elevation="medium" background="white" style={{ zIndex: 2 }} />
      </Pane>
      <Pane>
        <Box fill="horizontal" direction="row">
          {renderTabs(false)}
        </Box>
        <Box
          flex={{ grow: 1 }}
          direction="row"
          background="white"
          align="start"
          pad={{
            horizontal: 'small',
            top: 'ms',
          }}
        >
          {activeTab.id === 'indicators' && (
            <Box fill="horizontal">
              <SelectIndicators config={activeTab} />
              {showIndicatorInfo && (
                <Box pad={{ top: 'medium' }} gap="medium">
                  <MapKey
                    maxValue={minMaxValues.points.max}
                    minValue={minMaxValues.points.min}
                    isIndicator
                    type="circles"
                    circleLayerConfig={circleLayerConfig}
                  />
                  {activeIndicatorOption.title && (
                    <Title>
                      {activeIndicatorOption.title}
                    </Title>
                  )}
                </Box>
              )}
              {!showIndicatorInfo && (
                <Box pad={{ top: 'medium' }}>
                  <SubTitle>Select an indicator to add it to the map</SubTitle>
                </Box>
              )}
            </Box>
          )}
          {activeTab.id === 'countries' && (
            <Box>
              {activeTab.subjectOptions && (
                <MapSubjectOptions options={activeTab.subjectOptions} />
              )}
              {minMaxValues.countries.max > 0 && (
                <MapKey maxValue={minMaxValues.countries.max} mapSubject={countryMapSubject} />
              )}
              <Box gap="xsmall" margin={{ vertical: 'small' }}>
                {activeTab.title && (
                  <Title>{activeTab.title}</Title>
                )}
                {activeTab.subTitle && (
                  <SubTitle>{activeTab.subTitle}</SubTitle>
                )}
              </Box>
              {activeTab.memberOption && (
                <MapOption option={activeTab.memberOption} type="member" />
              )}
            </Box>
          )}
        </Box>
      </Pane>
    </Styled>
  );
  // const {
  //   title, maxValue, subjectOptions, memberOption, subTitle,
  // } = config;
  // const hasKey = maxValue > 0;
  // return (
  //   <Styled>
  //     {subjectOptions && (
  //       <MapSubjectOptions options={subjectOptions} />
  //     )}
  //     <Box gap="xsmall" margin={{ bottom: 'small' }}>
  //       {title && (
  //         <Title>{title}</Title>
  //       )}
  //       {subTitle && (
  //         <SubTitle>{subTitle}</SubTitle>
  //       )}
  //     </Box>
  //     {hasKey && <MapKey maxValue={maxValue} mapSubject={mapSubject} />}
  //     {memberOption && (
  //       <MapOption option={memberOption} type="member" />
  //     )}
  //   </Styled>
  // );
}

MapInfoOptions.propTypes = {
  options: PropTypes.array,
  minMaxValues: PropTypes.object,
  circleLayerConfig: PropTypes.object,
  countryMapSubject: PropTypes.string,
};

export default MapInfoOptions;
