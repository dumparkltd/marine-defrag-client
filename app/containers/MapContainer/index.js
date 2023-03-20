/*
 *
 * MapContainer
 *
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { Box, Text } from 'grommet';

import * as topojson from 'topojson-client';
// import { FormattedMessage } from 'react-intl';

import countriesTopo from 'data/ne_countries_10m_v5.topo.json';
import {
  setMapLoaded,
  setMapTooltips,
  setMapView,
} from 'containers/App/actions';
import {
  selectMapTooltips,
  selectPrintConfig,
  selectMapView,
} from 'containers/App/selectors';
// import appMessages from 'containers/App/messages';
// import { hasGroupActors } from 'utils/entities';
import MapWrapper from './MapWrapper';
import MapOption from './MapInfoOptions/MapOption';
import MapKey from './MapInfoOptions/MapKey';
import MapInfoOptions from './MapInfoOptions';
const MapKeyWrapper = styled((p) => <Box margin={{ horizontal: 'medium', top: 'xsmall', bottom: 'small' }} {...p} />)`
  max-width: 400px;
`;
// import messages from './messages';

const Styled = styled((p) => <Box {...p} />)`
  z-index: 0;
`;
const MapTitle = styled((p) => <Box margin={{ horizontal: 'medium', vertical: 'xsmall' }} {...p} />)``;
const MapOptions = styled((p) => <Box margin={{ horizontal: 'medium', top: 'small' }} {...p} />)``;

const getMapOuterWrapper = (fullMap) => fullMap
  ? styled.div``
  : styled((p) => <Box margin={{ horizontal: 'medium' }} {...p} />)`
    position: relative;
    overflow: hidden;
    padding-top: ${({ isPrint, orient }) => (isPrint && orient) === 'landscape' ? '50%' : '56.25%'};
`;
export function MapContainer({
  mapKey = {},
  mapInfo,
  mapOptions = [],
  mapData = {},
  onActorClick,
  reducePoints,
  reduceCountryAreas,
  fullMap,
  onSetMapLoaded,
  isPrintView,
  mapTooltips,
  onSetMapTooltips,
  printArgs,
  mapView,
  onSetMapView,
  mapViewLocal,
  onSetMapViewLocal,
  // intl,
}) {
  const {
    indicator,
    indicatorPoints,
    mapId,
    projection,
    mapSubject,
    circleLayerConfig,
    hasPointOption,
    hasPointOverlay,
    fitBounds,
    fitBoundsData,
    typeLabels,
    includeSecondaryMembers,
    scrollWheelZoom,
  } = mapData;
  const {
    keyTitle,
    isIndicator,
    unit,
    maxBinValue,
  } = mapKey;
  const [showAsPoint, setShowAsPoint] = useState(false);

  const countriesJSON = topojson.feature(
    countriesTopo,
    Object.values(countriesTopo.objects)[0],
  );

  let countryData = null;
  let locationData = null;
  let maxValue;
  let minValue;
  const minMaxValues = { points: null, countries: null };

  const showPointsOnly = hasPointOption && showAsPoint;
  if (
    reducePoints
      && indicatorPoints
      && indicatorPoints !== '0'
      && (hasPointOverlay || showPointsOnly)
  ) {
    const ffUnit = unit || circleLayerConfig.unit || '';
    const isPercentage = ffUnit.indexOf('%') > -1;
    locationData = reducePoints && reducePoints();

    [maxValue, minValue] = locationData && locationData.reduce(
      ([max, min], feature) => {
        if (!feature || !feature.values) {
          return [max, min];
        }
        return ([
          max !== null ? Math.max(max, feature.values[indicatorPoints]) : feature.values[indicatorPoints],
          min !== null ? Math.min(min, feature.values[indicatorPoints]) : feature.values[indicatorPoints],
        ]);
      },
      [isPercentage ? 100 : null, null],
    );

    minMaxValues.points = {
      max: maxValue,
      min: minValue,
    };
  }
  if (
    reduceCountryAreas
    && indicator
    && !showPointsOnly
  ) {
    countryData = reduceCountryAreas && reduceCountryAreas(countriesJSON.features);

    [maxValue, minValue] = countryData
      ? countryData.reduce(
        ([max, min], feature) => ([
          max !== null ? Math.max(max, feature.values[indicator]) : feature.values[indicator],
          min !== null ? Math.min(min, feature.values[indicator]) : feature.values[indicator],
        ]),
        [null, null],
      )
      : [0, 0];
    minMaxValues.countries = {
      max: maxValue,
      min: minValue,
    };
  }

  let allMapOptions = mapOptions;
  if (hasPointOption) {
    allMapOptions = [
      {
        active: showAsPoint,
        onClick: () => setShowAsPoint(!showAsPoint),
        label: 'Show as circles',
        key: 'circle',
      },
      ...mapOptions,
    ];
  }
  const MapOuterWrapper = getMapOuterWrapper(fullMap);
  return (
    <Styled>
      <MapOuterWrapper
        isPrint={isPrintView}
        orient={printArgs && printArgs.printOrientation}
      >
        <MapWrapper
          printArgs={printArgs}
          isPrintView={isPrintView}
          scrollWheelZoom={scrollWheelZoom}
          typeLabels={typeLabels}
          includeSecondaryMembers={includeSecondaryMembers}
          countryData={countryData}
          locationData={locationData}
          countryFeatures={countriesJSON.features}
          indicator={indicator}
          onActorClick={(id) => onActorClick(id)}
          maxValueCountries={minMaxValues
            && minMaxValues.countries
            ? minMaxValues.countries.max
            : null
          }
          mapSubject={mapSubject}
          fitBounds={fitBounds}
          fitBoundsData={fitBoundsData}
          fullMap={fullMap}
          projection={projection}
          mapId={mapId}
          circleLayerConfig={{
            ...circleLayerConfig,
            rangeMax: minMaxValues && minMaxValues.points && minMaxValues.points.max,
          }}
          hasInfo={mapInfo && mapInfo.length > 0}
          setMapLoaded={onSetMapLoaded}
          mapTooltips={mapTooltips}
          setMapTooltips={onSetMapTooltips}
          mapView={mapViewLocal || (fullMap ? mapView : null)}
          onSetMapView={(view) => {
            if (onSetMapViewLocal) {
              onSetMapViewLocal(view);
            } else if (fullMap) {
              onSetMapView(view, mapId, mapView);
            }
          }}
        />
      </MapOuterWrapper>
      {mapInfo && mapInfo.length > 0 && (
        <MapInfoOptions
          isPrintView={isPrintView}
          options={mapInfo}
          minMaxValues={minMaxValues}
          countryMapSubject={mapSubject}
          circleLayerConfig={circleLayerConfig}
        />
      )}
      {mapKey && Object.keys(mapKey).length > 0 && (
        <>
          <MapTitle>
            <Text weight={600}>{keyTitle}</Text>
          </MapTitle>
          <MapKeyWrapper>
            <MapKey
              isPrint={isPrintView}
              mapSubject={mapSubject}
              maxValue={maxValue}
              minValue={minValue}
              maxBinValue={maxBinValue}
              isIndicator={isIndicator}
              type={hasPointOption && showAsPoint ? 'circles' : 'gradient'}
              unit={unit}
              circleLayerConfig={circleLayerConfig}
            />
          </MapKeyWrapper>
        </>
      )}
      {allMapOptions && allMapOptions.length > 0 && (
        <MapOptions>
          {allMapOptions.map(
            (option, id) => (
              <MapOption
                key={id}
                option={option}
                type={option.type}
              />
            )
          )}
        </MapOptions>
      )}
    </Styled>
  );
}

MapContainer.propTypes = {
  onActorClick: PropTypes.func,
  reducePoints: PropTypes.func,
  reduceCountryAreas: PropTypes.func,
  onSetMapLoaded: PropTypes.func,
  onSetMapTooltips: PropTypes.func,
  onSetMapView: PropTypes.func,
  onSetMapViewLocal: PropTypes.func,
  printArgs: PropTypes.object,
  mapData: PropTypes.object,
  mapView: PropTypes.object,
  mapViewLocal: PropTypes.object,
  mapKey: PropTypes.object,
  mapInfo: PropTypes.array,
  mapOptions: PropTypes.array,
  mapTooltips: PropTypes.array,
  fullMap: PropTypes.bool,
  isPrintView: PropTypes.bool,
};

const mapStateToProps = (state, { mapData }) => ({
  mapTooltips: selectMapTooltips(state, mapData && mapData.mapId),
  mapView: selectMapView(state, mapData && mapData.mapId),
  printArgs: selectPrintConfig(state),
});

function mapDispatchToProps(dispatch) {
  return {
    onSetMapLoaded: (mapId) => {
      dispatch(setMapLoaded(mapId));
    },
    onSetMapTooltips: (items, mapId) => {
      dispatch(setMapTooltips(items, mapId));
    },
    onSetMapView: (view, mapId) => {
      dispatch(setMapView(view, mapId));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(MapContainer);
