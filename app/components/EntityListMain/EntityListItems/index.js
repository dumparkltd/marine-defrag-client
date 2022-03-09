import React from 'react';
import PropTypes from 'prop-types';
import { Map, List } from 'immutable';

import EntityListItem from 'components/EntityListItem';

export class EntityListItems extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    const {
      taxonomies,
      connections,
      config,
      onEntityClick,
      entities,
      entityPath,
      inSingleView,
      showValueForAction,
    } = this.props;
    return (
      <div>
        {entities.map((entity, key) => (
          <EntityListItem
            key={key}
            entity={entity}
            inSingleView={inSingleView}
            taxonomies={taxonomies}
            connections={connections}
            config={config}
            onEntityClick={onEntityClick}
            entityPath={entityPath}
            showValueForAction={showValueForAction}
          />
        ))}
      </div>
    );
  }
}

EntityListItems.propTypes = {
  config: PropTypes.object,
  entities: PropTypes.instanceOf(List).isRequired,
  taxonomies: PropTypes.instanceOf(Map),
  connections: PropTypes.instanceOf(Map),
  showValueForAction: PropTypes.instanceOf(Map),
  onEntityClick: PropTypes.func,
  entityPath: PropTypes.string,
  inSingleView: PropTypes.bool,
};

export default EntityListItems;
