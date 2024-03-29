/*
 *
 * ActorActivitiesMap
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import { Map, List } from 'immutable';
import { connect } from 'react-redux';
import styled, { css } from 'styled-components';
import { Box, Text } from 'grommet';

import * as topojson from 'topojson-client';
// import { FormattedMessage } from 'react-intl';

import countriesTopo from 'data/ne_countries_10m_v5.topo.json';
import countryPointJSON from 'data/country-points.json';

import { ACTORTYPES, ACTIONTYPES } from 'themes/config';

import {
  selectActortypeActors,
  selectIncludeActorMembers,
  selectIncludeTargetMembers,
  selectMembershipsGroupedByAssociation,
  selectPrintConfig,
} from 'containers/App/selectors';

import {
  setIncludeActorMembers,
  setIncludeTargetMembers,
} from 'containers/App/actions';


// import appMessages from 'containers/App/messages';
import qe from 'utils/quasi-equals';
// import { hasGroupActors } from 'utils/entities';
import MapWrapperLeaflet from 'containers/MapControl/MapWrapperLeaflet';
import SimpleMapContainer from 'containers/MapControl/SimpleMapContainer';
import MapOption from 'containers/MapControl/MapInfoOptions/MapOption';
import MapKey from 'containers/MapControl/MapInfoOptions/MapKey';
// import messages from './messages';
import { usePrint } from 'containers/App/PrintContext';

const Styled = styled((p) => <Box {...p} />)`
  z-index: 0;
  position: relative;
  @media print {
    page-break-inside: avoid;
    break-inside: avoid;
  }
`;
const MapTitle = styled((p) => <Box margin={{ horizontal: 'medium', vertical: 'xsmall' }} {...p} />)`
  ${({ isPrint }) => isPrint && css`margin-left: 0`};
  @media print {
    margin-left: 0;
  }
`;
const MapKeyWrapper = styled((p) => <Box margin={{ horizontal: 'medium', vertical: 'xsmall' }} {...p} />)`
  max-width: 400px;
  ${({ isPrint }) => isPrint && css`margin-left: 0`};
  @media print {
    margin-left: 0;
  }
`;
const MapOptions = styled((p) => <Box margin={{ horizontal: 'medium' }} {...p} />)`
  ${({ isPrint }) => isPrint && css`margin-left: 0`};
  @media print {
    margin-left: 0;
  }
`;

const addToList = (list, countryId, actionId) => {
  // if already present, add action id to country key
  if (list.get(countryId)) {
    return !list.get(countryId).includes(actionId)
      ? list.set(countryId, list.get(countryId).push(actionId))
      : list;
  }
  // else add country with action id as first entry
  return list.set(countryId, List([actionId]));
};
const addCountryActionIdsToList = (
  countryList, actorsByType, actionId,
) => actorsByType.reduce(
  (memo, countryId) => addToList(memo, countryId, actionId),
  countryList,
);
const addMemberCountryActionIdsToList = (
  countryList, actorsByType, actionId, memberships, countries,
) => actorsByType.reduce(
  (countryListMemo, groupId) => memberships.get(groupId)
    ? memberships.get(groupId).reduce(
      // only add if country exists
      (memo, memberId) => countries.get(memberId.toString())
        ? addToList(memo, memberId, actionId)
        : memo,
      countryListMemo,
    )
    : countryListMemo,
  countryList,
);

const addAllCountryActionIdsToList = (
  countryList,
  actionId,
  actorsByType,
  memberships,
  countries,
  includeMembers,
) => actorsByType.reduce(
  (memo, actortypeActors, actortypeId) => {
    if (qe(actortypeId, ACTORTYPES.COUNTRY)) {
      return addCountryActionIdsToList(memo, actortypeActors, actionId);
    }
    // TODO check actortype if it can have members
    if (includeMembers && !qe(actortypeId, ACTORTYPES.ORG)) {
      return addMemberCountryActionIdsToList(
        memo,
        actortypeActors,
        actionId,
        memberships,
        countries,
      );
    }
    return memo;
  },
  countryList,
);
const reduceCountryData = ({
  features, countries, countryActionIds, actor,
}) => features.reduce(
  (memo, feature) => {
    const country = countries && countries.find(
      (e) => qe(e.getIn(['attributes', 'code']), feature.properties.ADM0_A3)
    );
    if (country) {
      const isActive = qe(country.get('id'), actor.get('id'));
      const actionCount = countryActionIds
        && countryActionIds.get(parseInt(country.get('id'), 10))
        && countryActionIds.get(parseInt(country.get('id'), 10)).size;
      if (actionCount) {
        return [
          ...memo,
          {
            ...feature,
            id: country.get('id'),
            attributes: country.get('attributes').toJS(),
            tooltip: {
              id: country.get('id'),
              title: country.getIn(['attributes', 'title']),
              isCount: true,
              stats: [{
                values: [{
                  label: 'No of activities',
                  value: actionCount || 0,
                }],
              }],
            },
            isActive,
            values: {
              actions: actionCount || 0,
            },
          },
        ];
      }
      if (isActive) {
        return [
          ...memo,
          {
            ...feature,
            id: country.get('id'),
            attributes: country.get('attributes').toJS(),
            isActive,
          },
        ];
      }
    }
    return memo;
  },
  [],
).sort(
  (a, b) => {
    if (a.isActive) return 1;
    if (b.isActive) return -1;
    return -1;
  },
);

export function ActorActivitiesMap({
  actor,
  actions,
  actionsAsMember,
  mapSubject,
  onSetIncludeActorMembers,
  onSetIncludeTargetMembers,
  includeActorMembers,
  includeTargetMembers,
  onEntityClick,
  countries,
  hasMemberOption,
  actiontypeId,
  actiontypeHasTarget,
  memberships,
  actorCanBeMember,
  printArgs,
  mapId,
  // intl,
}) {
  const isPrint = usePrint();
  // console.log('actions', actions && actions.toJS())
  // console.log('actionsAsMember', actionsAsMember && actionsAsMember.toJS())
  // console.log('actiontypeHasTarget', actiontypeHasTarget)
  // console.log('hasMemberOption', hasMemberOption)
  // const { intl } = this.context;
  // let type;
  const countriesJSON = topojson.feature(
    countriesTopo,
    Object.values(countriesTopo.objects)[0],
  );
  let countryActionIds;
  const actorName = actor.getIn(['attributes', 'title']);
  let memberOption;
  let memberTargetOption;
  let mapTitle;
  let keyTitle;
  // show targets for actor's activities (real targets)
  // > donations / initiatives / regional seas conventions
  if (mapSubject === 'targets' && actiontypeHasTarget) {
    if (actions) {
      countryActionIds = actions.reduce(
        (memo, action) => {
          if (action.get('targetsByType')) {
            return addAllCountryActionIdsToList(
              memo,
              action.get('id'),
              action.get('targetsByType'),
              memberships,
              countries,
              includeTargetMembers,
            );
          }
          return memo;
        },
        countryActionIds || Map(),
      );
    }
    if (includeActorMembers && actionsAsMember) {
      countryActionIds = actionsAsMember.flatten(1).reduce(
        (memo, groupActor) => {
          if (groupActor.getIn(['actionsByType', actiontypeId])) {
            return memo.concat(groupActor.getIn(['actionsByType', actiontypeId]).toList());
          }
          return memo;
        },
        List()
      ).reduce(
        (memo, action) => {
          if (action.get('targetsByType')) {
            return addAllCountryActionIdsToList(
              memo,
              action.get('id'),
              action.get('targetsByType'),
              memberships,
              countries,
              includeTargetMembers,
            );
          }
          return memo;
        },
        countryActionIds || Map(),
      );
    }
  }

  // show targets for actor's activities (targets are actually actors)
  // > intl frameworks / regional strategies / national strategies
  if (mapSubject === 'targets' && !actiontypeHasTarget) {
    if (actions) {
      countryActionIds = actions.reduce(
        (memo, action) => {
          if (action.get('actorsByType')) {
            return addAllCountryActionIdsToList(
              memo,
              action.get('id'),
              action.get('actorsByType'),
              memberships,
              countries,
              includeActorMembers,
            );
          }
          return memo;
        },
        countryActionIds || Map(),
      );
    }
    if (includeActorMembers && actionsAsMember) {
      countryActionIds = actionsAsMember.flatten(1).reduce(
        (memo, groupActor) => {
          if (groupActor.getIn(['actionsByType', actiontypeId])) {
            return memo.concat(groupActor.getIn(['actionsByType', actiontypeId]).toList());
          }
          return memo;
        },
        List()
      ).reduce(
        (memo, action) => {
          if (action.get('actorsByType')) {
            return addAllCountryActionIdsToList(
              memo,
              action.get('id'),
              action.get('actorsByType'),
              memberships,
              countries,
              includeActorMembers, // always true
            );
          }
          return memo;
        },
        countryActionIds || Map(),
      );
    }
  }

  // show actors for activities targeting actor
  // > donations / reg strategies / initiatives
  if (mapSubject === 'actors') {
    if (actions) {
      countryActionIds = actions && actions.reduce(
        (memo, action) => {
          if (action.get('actorsByType')) {
            return addAllCountryActionIdsToList(
              memo,
              action.get('id'),
              action.get('actorsByType'),
              memberships,
              countries,
              includeActorMembers,
            );
          }
          return memo;
        },
        countryActionIds || Map(),
      );
    }
    if (includeTargetMembers && actionsAsMember) {
      countryActionIds = actionsAsMember.flatten(1).reduce(
        (memo, groupActor) => {
          if (groupActor.getIn(['targetingActionsByType', actiontypeId])) {
            return memo.concat(groupActor.getIn(['targetingActionsByType', actiontypeId]).toList());
          }
          return memo;
        },
        List()
      ).reduce(
        (memo, action) => {
          if (action.get('actorsByType')) {
            return addAllCountryActionIdsToList(
              memo,
              action.get('id'),
              action.get('actorsByType'),
              memberships,
              countries,
              includeActorMembers,
            );
          }
          return memo;
        },
        countryActionIds || Map(),
      );
    }
  }
  const countryCount = countryActionIds ? countryActionIds.size : 0;
  const hasRelated = countryCount > 0;
  // also figure out map options
  if (mapSubject === 'targets' && actiontypeHasTarget) {
    mapTitle = `${countryCount} ${countryCount === 1 ? 'country' : 'countries'} targeted by activities of '${actorName}'`;
    keyTitle = 'No of activities targeting each country';
    if (hasMemberOption) {
      if (actorCanBeMember) {
        memberOption = {
          active: includeActorMembers,
          onClick: () => onSetIncludeActorMembers(includeActorMembers ? '0' : '1'),
          label: `Include activities of intergovernmental organisations '${actorName}' belongs to`,
          key: 'am',
        };
      }
      memberTargetOption = {
        active: includeTargetMembers,
        onClick: () => onSetIncludeTargetMembers(includeTargetMembers ? '0' : '1'),
        label: `Include regions, intergovernmental organisations, classes targeted by activities of '${actorName}'`,
        key: 'tm',
      };
    }
  }

  // show targets for actor's activities (targets are actually actors)
  // > intl frameworks / regional strategies / national strategies
  if (mapSubject === 'targets' && !actiontypeHasTarget) {
    mapTitle = `${countryCount} ${countryCount === 1 ? 'country' : 'countries'} targeted by activities of '${actorName}'`; // '${actorName}`; // regional strategies, intl frameworks
    keyTitle = 'No of activities targeting each country';
    if (hasMemberOption && !qe(actiontypeId, ACTIONTYPES.NATL) && actorCanBeMember) {
      memberOption = {
        active: includeActorMembers,
        onClick: () => onSetIncludeActorMembers(includeActorMembers ? '0' : '1'),
        label: `Include activities of intergovernmental organisations '${actorName}' belongs to`,
      };
    }
  }
  // show actors for activities targeting actor
  // > donations / reg strategies / initiatives
  if (mapSubject === 'actors') {
    mapTitle = `${countryCount} ${countryCount === 1 ? 'country' : 'countries'} with activities targeting '${actorName}'`;
    keyTitle = 'No of activities per country';
    if (hasMemberOption) {
      memberOption = {
        active: includeActorMembers,
        onClick: () => onSetIncludeActorMembers(includeActorMembers ? '0' : '1'),
        label: `Include member countries of intergovernmental organisations targeting '${actorName}'`,
        key: 'am',
      };
      if (actorCanBeMember) {
        memberTargetOption = {
          active: includeTargetMembers,
          onClick: () => onSetIncludeTargetMembers(includeTargetMembers ? '0' : '1'),
          label: `Include countries with activities targeting '${actorName}' indirectly via a region, intergovernmental organisation or class`,
          key: 'tm',
        };
      }
    }
  }

  const countryData = !hasRelated
    ? countriesJSON.features : reduceCountryData({
      features: countriesJSON.features, countries, countryActionIds, actor,
    });
  const countryPointData = !hasRelated ? countryPointJSON.features : reduceCountryData({
    features: countryPointJSON.features, countries, countryActionIds, actor,
  });

  const maxValue = countryActionIds && countryActionIds.reduce(
    (max, actionList) => Math.max(max, actionList.size),
    0,
  );
  // const ref = React.useRef();
  // w={ref && ref.current && ref.current.clientWidth}
  const [mapTooltips, setMapTooltips] = React.useState([]);
  const [mapView, setMapView] = React.useState(null);

  return (
    <Styled>
      <SimpleMapContainer
        orient={printArgs && printArgs.printOrientation}
      >
        <MapWrapperLeaflet
          printArgs={printArgs}
          isPrintView={isPrint}
          isSingle
          countryData={countryData}
          countryPointData={countryPointData}
          countryFeatures={countriesJSON.features}
          indicator="actions"
          onActorClick={(id) => onEntityClick(id)}
          maxValueCountries={maxValue}
          includeSecondaryMembers={includeActorMembers || includeTargetMembers}
          mapSubject={mapSubject}
          projection="gall-peters"
          fitBoundsToCountryOverlay
          mapTooltips={mapTooltips}
          setMapTooltips={setMapTooltips}
          mapId={mapId}
          mapView={mapView}
          onSetMapView={setMapView}
        />
      </SimpleMapContainer>
      {mapTitle && (
        <MapTitle isPrint={isPrint}>
          <Text weight={600}>{mapTitle}</Text>
        </MapTitle>
      )}
      {maxValue > 1 && (
        <MapKeyWrapper isPrint={isPrint}>
          <Text size="small">{keyTitle}</Text>
          <MapKey mapSubject={mapSubject} maxValue={maxValue} maxBinValue={0} />
        </MapKeyWrapper>
      )}
      {(memberOption || memberTargetOption) && (
        <MapOptions isPrint={isPrint}>
          {memberTargetOption && (
            <MapOption option={memberTargetOption} type="member" />
          )}
          {memberOption && (
            <MapOption option={memberOption} type="member" />
          )}
        </MapOptions>
      )}
    </Styled>
  );
}

ActorActivitiesMap.propTypes = {
  actor: PropTypes.instanceOf(Map), // the current actor (ie country)
  actions: PropTypes.instanceOf(Map), // the current actor (ie country)
  actionsAsMember: PropTypes.instanceOf(Map), // the current actor (ie country)
  countries: PropTypes.instanceOf(Map), // all countries needed for indirect connections
  memberships: PropTypes.instanceOf(Map), // all countries needed for indirect connections
  onSetIncludeActorMembers: PropTypes.func,
  onSetIncludeTargetMembers: PropTypes.func,
  includeActorMembers: PropTypes.bool,
  includeTargetMembers: PropTypes.bool,
  hasMemberOption: PropTypes.bool,
  actiontypeHasTarget: PropTypes.bool,
  actorCanBeMember: PropTypes.bool,
  onEntityClick: PropTypes.func,
  mapSubject: PropTypes.string,
  actiontypeId: PropTypes.string,
  mapId: PropTypes.string,
  printArgs: PropTypes.object,
};

const mapStateToProps = (state) => ({
  countries: selectActortypeActors(state, { type: ACTORTYPES.COUNTRY }),
  includeActorMembers: selectIncludeActorMembers(state),
  includeTargetMembers: selectIncludeTargetMembers(state),
  memberships: selectMembershipsGroupedByAssociation(state),
  printArgs: selectPrintConfig(state),
});
function mapDispatchToProps(dispatch) {
  return {
    onSetIncludeTargetMembers: (active) => {
      dispatch(setIncludeTargetMembers(active));
    },
    onSetIncludeActorMembers: (active) => {
      dispatch(setIncludeActorMembers(active));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ActorActivitiesMap);
