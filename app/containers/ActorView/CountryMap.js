/*
 *
 * CountryMap
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import styled, { css } from 'styled-components';
import { Box } from 'grommet';
import { usePrint } from 'containers/App/PrintContext';

import * as topojson from 'topojson-client';
// import { FormattedMessage } from 'react-intl';

import countriesTopo from 'data/ne_countries_10m_v5.topo.json';

// import appMessages from 'containers/App/messages';
import qe from 'utils/quasi-equals';
// import { hasGroupActors } from 'utils/entities';
import MapWrapperLeaflet from 'containers/MapControl/MapWrapperLeaflet';

// import messages from './messages';

// const Styled = styled((p) => <Box margin={{ horizontal: 'small' }} {...p} />)`
//   z-index: 0;
//   @media print {
//   }
// `;
const Styled = styled((p) => <Box {...p} />)`
  z-index: 0;
  position: relative;
  @media print {
    page-break-inside: avoid;
    break-inside: avoid;
  }
`;
const MapContainer = styled((p) => <Box margin={{ horizontal: 'medium' }} {...p} />)`
  ${({ isPrint }) => isPrint && css`margin-right: 0;`}
  position: relative;
  background: #F9F9FA;
  overflow: hidden;
  border: 1px solid #f6f7f9;
  padding-top: ${({ isPrint, orient }) => {
    if (isPrint) return orient === 'landscape' ? '77%' : '111%';
    return '88%';
  }};

  @media print {
    margin-right: 0;
    display: block;
    page-break-inside: avoid;
    break-inside: avoid;
  }
`;

export function CountryMap({
  actor,
  printArgs,
  // intl,
}) {
  const isPrint = usePrint();

  const countriesJSON = topojson.feature(
    countriesTopo,
    Object.values(countriesTopo.objects)[0],
  );

  const countryData = countriesJSON.features.filter(
    (feature) => qe(actor.getIn(['attributes', 'code']), feature.properties.ADM0_A3)
  ).map(
    (feature) => ({
      ...feature,
      id: actor.get('id'),
      attributes: actor.get('attributes').toJS(),
      style: {
        interactive: false,
      },
    })
  );
  return (
    <Styled isPrint={isPrint}>
      <MapContainer
        isPrint={isPrint}
        orient={printArgs && printArgs.printOrientation}
      >
        <MapWrapperLeaflet
          printArgs={printArgs}
          isPrintView={isPrint}
          mapId="ll-map-country"
          countryData={countryData}
          countryFeatures={countriesJSON.features}
          styleType="country"
          fitBoundsToCountryOverlay
          projection="gall-peters"
        />
      </MapContainer>
    </Styled>
  );
}

CountryMap.propTypes = {
  actor: PropTypes.instanceOf(Map), // the current actor (ie country)
  printArgs: PropTypes.object,
};


export default CountryMap;
