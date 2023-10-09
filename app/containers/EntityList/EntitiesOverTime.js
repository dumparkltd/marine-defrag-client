/*
 *
 * EntitiesOverTime
 *
 */
import React, { useRef, useState } from 'react';
// import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { List, Map } from 'immutable';
import { connect } from 'react-redux';
import { ResponsiveContext, Box, Text } from 'grommet';
import styled from 'styled-components';
import { palette } from 'styled-theme';
import { FormattedMessage } from 'react-intl';
// import {
//   ACTORTYPES,
//   ROUTES,
// } from 'themes/config';

import { sortEntities } from 'utils/sort';
import { isMaxSize } from 'utils/responsive';

import {
  // selectActors,
  // selectActortypeActors,
  selectActorActionsGroupedByAction,
  selectActiontypeTaxonomiesWithCats,
  selectTimelineHighlightCategory,
  selectPrintConfig,
} from 'containers/App/selectors';
import { CONTENT_LIST } from 'containers/App/constants';
import { setTimelineHighlightCategory } from 'containers/App/actions';
// import { updatePath } from 'containers/App/actions';

import PrintHide from 'components/styled/PrintHide';
import ContainerWrapper from 'components/styled/Container/ContainerWrapper';
import Container from 'components/styled/Container';
import ContentSimple from 'components/styled/ContentSimple';
import ContentHeader from 'containers/ContentHeader';
import ChartTimelineLegend from 'components/EntitiesOverTime/ChartTimelineLegend';
import ChartTimeline from 'components/EntitiesOverTime/ChartTimeline';
import ChartTimelineCategories from 'components/EntitiesOverTime/ChartTimelineCategories';
import PlotHintWrapper from 'components/EntitiesOverTime//PlotHintWrapper';


import HeaderPrint from 'components/Header/HeaderPrint';
import Loading from 'components/Loading';
import EntityListViewOptions from 'components/EntityListViewOptions';


// import appMessages from 'containers/App/messages';
// import qe from 'utils/quasi-equals';

import messages from './messages';
// import { selectActionsByAncestor } from './selectors';

const PlotHintAnchor = styled.div`
  position: absolute;
  top: 5px;
  left: 5px;
  right: 5px;
  direction: ltr;
`;
const WrapperOfWrappers = styled.div`
  position: relative;
`;
const ChartWrapperOuter = styled.div`
  overflow-x: auto;
  direction: ${({ scrollOverflow }) => scrollOverflow ? 'rtl' : 'ltr'};
`;
const ChartWrapperInner = styled.div`
  width: ${({ scrollOverflow }) => scrollOverflow ? '1000px' : 'auto'};
  direction: ltr
`;

const WithoutDateHint = styled(Text)`
  color:  ${palette('dark', 3)};
  font-style: italic;
`;

const prepareTaxonomiesWithCats = (taxonomiesWithCats, entities) => {
  const uniqueCategories = entities.map(
    (entity) => entity.getIn(['categories'])
  ).flatten().toSet().delete(undefined);
  return taxonomiesWithCats.reduce((memo, taxonomy) => {
    const keepCategories = taxonomy.getIn(['categories'])
      .filter(
        (category) => category === undefined || uniqueCategories.has(parseInt(category.get('id'), 10))
      )
      .map(
        (category) => ({
          id: category.get('id'),
          label: category.getIn(['attributes', 'title']),
        })
      )
      .sort(
        (a, b) => a.label > b.label ? 1 : -1
      );

    return keepCategories.size > 0
      ? memo.concat([{
        id: taxonomy.get('id'), categories: keepCategories.toList().toJS(),
      }])
      : memo;
  }, []);
};

export function EntitiesOverTime({
  dataReady,
  viewOptions,
  entities,
  isPrintView,
  entityTitle,
  allEntityCount,
  hasFilters,
  headerOptions,
  taxonomiesWithCats,
  onSetCategory,
  onResetCategory,
  highlightCategory,
  onEntityClick,
  printArgs,
}) {
  const [hint, setHint] = useState(null);
  const [hoverId, setHover] = useState(null);

  const scrollContainer = useRef(null);
  const scrollReference = useRef(null);

  let headerTitle;
  let headerSubTitle;
  if (entityTitle) {
    headerTitle = entities
      ? `${entities.size} ${entities.size === 1 ? entityTitle.single : entityTitle.plural}`
      : entityTitle.plural;
  }
  if (hasFilters) {
    headerSubTitle = `of ${allEntityCount} total`;
  }
  const size = React.useContext(ResponsiveContext);
  const entitiesWithDate = entities && entities.filter(
    (entity) => entity.getIn(['attributes', 'date_start'])
  );
  const entitiesWithoutDate = entities && entities.filter(
    (entity) => !entity.getIn(['attributes', 'date_start'])
  );
  const hasEntitiesWithDate = entitiesWithDate && entitiesWithDate.size > 0;
  const hasEntitiesWithoutDate = entitiesWithoutDate && entitiesWithoutDate.size > 0;

  return (
    <ContainerWrapper headerStyle="types" ref={scrollContainer} isPrint={isPrintView}>
      {isPrintView && (
        <HeaderPrint argsRemove={['subj', 'ac', 'tc', 'actontype']} />
      )}
      {viewOptions && viewOptions.length > 1 && !isPrintView && (
        <PrintHide>
          <EntityListViewOptions isPrintView={isPrintView} options={viewOptions} />
        </PrintHide>
      )}
      <Container ref={scrollReference} isPrint={isPrintView}>
        <ContentSimple isPrint={isPrintView}>
          {!dataReady && (<Loading />)}
          {dataReady && (
            <div>
              <ContentHeader
                type={CONTENT_LIST}
                title={headerTitle}
                subTitle={headerSubTitle}
                hasViewOptions={viewOptions && viewOptions.length > 1}
                info={headerOptions && headerOptions.info}
              />
              {hasEntitiesWithDate && (
                <>
                  <ChartTimelineLegend />
                  <WrapperOfWrappers>
                    <ChartWrapperOuter scrollOverflow={isMaxSize(size, 'ms')}>
                      <ChartWrapperInner scrollOverflow={isMaxSize(size, 'ms')}>
                        <ChartTimeline
                          highlightCategory={highlightCategory}
                          printArgs={printArgs}
                          setHint={setHint}
                          hint={hint}
                          setHover={setHover}
                          hoverId={hoverId}
                          onEntityClick={onEntityClick}
                          entities={sortEntities(
                            entitiesWithDate,
                            'asc',
                            'date_start', // sortBy
                            'date', // type
                          )}
                        />
                      </ChartWrapperInner>
                    </ChartWrapperOuter>
                    {hint && isMaxSize(size, 'ms') && (
                      <PlotHintAnchor>
                        <PlotHintWrapper
                          hint={hint}
                          onEntityClick={onEntityClick}
                          onClose={() => setHint(null)}
                        />
                      </PlotHintAnchor>
                    )}
                  </WrapperOfWrappers>
                  <Box direction="row" fill={false}>
                    {taxonomiesWithCats && (
                      <ChartTimelineCategories
                        taxonomiesWithCats={
                          prepareTaxonomiesWithCats(taxonomiesWithCats, entitiesWithDate)
                        }
                        onSetCategory={(catId) => {
                          setHint(null);
                          onSetCategory(catId);
                        }}
                        onResetCategory={() => {
                          setHint(null);
                          onResetCategory();
                        }}
                        highlightCategory={highlightCategory}
                      />
                    )}
                  </Box>
                </>
              )}
              {hasEntitiesWithoutDate && (
                <Box margin={{ top: 'large' }}>
                  <WithoutDateHint>
                    <FormattedMessage
                      {...messages.noDateHint}
                      values={{
                        count: entitiesWithoutDate.size,
                        entityTitle: entitiesWithoutDate.size === 1
                          ? entityTitle.single
                          : entityTitle.plural,
                      }}
                    />
                  </WithoutDateHint>
                </Box>
              )}
            </div>
          )}
        </ContentSimple>
      </Container>
    </ContainerWrapper>
  );
}

EntitiesOverTime.propTypes = {
  entities: PropTypes.instanceOf(List),
  viewOptions: PropTypes.array,
  // config: PropTypes.object,
  // actors: PropTypes.instanceOf(Map),
  // actions: PropTypes.instanceOf(Map),
  // connections: PropTypes.instanceOf(Map),
  // actortypes: PropTypes.instanceOf(Map),
  // actiontypes: PropTypes.instanceOf(Map),
  taxonomiesWithCats: PropTypes.instanceOf(Map),
  headerOptions: PropTypes.object, // single/plural
  entityTitle: PropTypes.object, // single/plural
  // primitive
  dataReady: PropTypes.bool,
  isPrintView: PropTypes.bool,
  allEntityCount: PropTypes.number,
  // typeId: PropTypes.string,
  highlightCategory: PropTypes.string,
  hasFilters: PropTypes.bool,
  onSetCategory: PropTypes.func,
  onResetCategory: PropTypes.func,
  // intl: intlShape.isRequired,
  onEntityClick: PropTypes.func,
  printArgs: PropTypes.object,
  // onSelectAction: PropTypes.func,
};

const mapStateToProps = (state, { typeId }) => ({
  // countries: selectActortypeActors(state, { type: ACTORTYPES.COUNTRY }),
  // actors: selectActors(state),
  // actions: selectActions(state),
  actorActionsByAction: selectActorActionsGroupedByAction(state), // for figuring out targeted countries
  taxonomiesWithCats: selectActiontypeTaxonomiesWithCats(state, { type: typeId }),
  highlightCategory: selectTimelineHighlightCategory(state),
  printArgs: selectPrintConfig(state),
});

function mapDispatchToProps(dispatch) {
  return {
    onSetCategory: (catId) => {
      dispatch(setTimelineHighlightCategory(catId));
    },
    onResetCategory: () => {
      dispatch(setTimelineHighlightCategory());
    },
  };
}


export default connect(mapStateToProps, mapDispatchToProps)(EntitiesOverTime);
