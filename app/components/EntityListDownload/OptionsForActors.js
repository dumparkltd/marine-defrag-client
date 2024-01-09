/*
 *
 * OptionsForActors
 *
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { Box, Text } from 'grommet';
import { lowerCase } from 'utils/string';

import OptionGroup from './OptionGroup';

export function OptionsForActors({
  hasActions,
  actionsAsRows,
  setActionsAsRows,
  actiontypes,
  setActiontypes,
  hasActionsAsTarget,
  actiontypesAsTarget,
  setActiontypesAsTarget,
  hasMembers,
  membertypes,
  setMembertypes,
  hasAssociations,
  associationtypes,
  setAssociationtypes,
  hasUsers,
  includeUsers,
  setIncludeUsers,
  hasAttributes,
  attributes,
  setAttributes,
  hasTaxonomies,
  setTaxonomies,
  taxonomyColumns,
  typeTitle,
}) {
  const [expandGroup, setExpandGroup] = useState(null);

  // count active export options
  const activeAttributeCount = hasAttributes && Object.keys(attributes).reduce((counter, attKey) => {
    if (attributes[attKey].active) return counter + 1;
    return counter;
  }, 0);
  const activeTaxonomyCount = hasTaxonomies && Object.keys(taxonomyColumns).reduce((counter, taxId) => {
    if (taxonomyColumns[taxId].active) return counter + 1;
    return counter;
  }, 0);
  const activeActiontypeCount = hasActions && Object.keys(actiontypes).reduce((counter, actiontypeId) => {
    if (actiontypes[actiontypeId].active) return counter + 1;
    return counter;
  }, 0);
  const activeActiontypeAsTargetCount = hasActionsAsTarget && Object.keys(actiontypesAsTarget).reduce((counter, actiontypeId) => {
    if (actiontypesAsTarget[actiontypeId].active) return counter + 1;
    return counter;
  }, 0);
  const activeAssociationtypeCount = hasAssociations && Object.keys(associationtypes).reduce((counter, typeId) => {
    if (associationtypes[typeId].active) return counter + 1;
    return counter;
  }, 0);
  const activeMembertypeCount = hasMembers && Object.keys(membertypes).reduce((counter, typeId) => {
    if (membertypes[typeId].active) return counter + 1;
    return counter;
  }, 0);

  return (
    <Box margin={{ bottom: 'large' }}>
      {hasAttributes && (
        <OptionGroup
          groupId="attributes"
          label="Attributes"
          expandedId={expandGroup}
          onExpandGroup={(val) => setExpandGroup(val)}
          activeOptionCount={activeAttributeCount}
          optionCount={Object.keys(attributes).length}
          intro="The resulting CSV file will have one column for each attribute selected"
          options={attributes}
          optionListLabels={{
            attributes: 'Select attributes',
            columns: 'Customise column name',
          }}
          onSetOptions={(options) => setAttributes(options)}
          editColumnNames
        />
      )}
      {hasTaxonomies && (
        <OptionGroup
          groupId="taxonomies"
          label="Categories"
          expandedId={expandGroup}
          onExpandGroup={(val) => setExpandGroup(val)}
          activeOptionCount={activeTaxonomyCount}
          optionCount={Object.keys(taxonomyColumns).length}
          intro="The resulting CSV file will have one column for each category group (taxonomy) selected"
          options={taxonomyColumns}
          optionListLabels={{
            attributes: 'Select category groups',
            columns: 'Customise column name',
          }}
          onSetOptions={(options) => setTaxonomies(options)}
          editColumnNames
        />
      )}
      {hasActions && (
        <OptionGroup
          groupId="actions"
          label="Activities"
          expandedId={expandGroup}
          onExpandGroup={(val) => setExpandGroup(val)}
          activeOptionCount={activeActiontypeCount}
          optionCount={Object.keys(actiontypes).length}
          introNode={(
            <Box gap="small">
              <Text size="small">
                By default, the resulting CSV file will have one column for each type of activity selected.
                Alternatively you can chose to include activities as rows, resulting in one row per actor and activity
              </Text>
              {hasAssociations && (
                <Text size="small">
                  {`Please note that activities of other associated actors (the ${lowerCase(typeTitle)} are members of) are not included.`}
                </Text>
              )}
              {!hasAssociations && hasMembers && (
                <Text size="small">
                  {`Please note that activities of ${lowerCase(typeTitle)} members are not included.`}
                </Text>
              )}
            </Box>
          )}
          options={actiontypes}
          optionListLabels={{
            attributes: 'Select activity types',
          }}
          onSetOptions={(options) => setActiontypes(options)}
          onSetAsRows={(val) => setActionsAsRows(val)}
          asRows={actionsAsRows}
          asRowsDisabled={activeActiontypeCount === 0}
          asRowsLabels={{
            columns: 'Include activities as columns (one column for each activity type)',
            rows: 'Include activities as rows (one row for each actor and activity)',
          }}
        />
      )}
      {hasActionsAsTarget && (
        <OptionGroup
          groupId="actions-as-target"
          label="Activities as target"
          expandedId={expandGroup}
          onExpandGroup={(val) => setExpandGroup(val)}
          activeOptionCount={activeActiontypeAsTargetCount}
          optionCount={Object.keys(actiontypesAsTarget).length}
          introNode={(
            <Box gap="small">
              <Text size="small">
                By default, the resulting CSV file will have one column for each type of activity selected.
              </Text>
              {hasAssociations && (
                <Text size="small">
                  {`Please note that activities targeting associated actors (the ${lowerCase(typeTitle)} are members of) are not included.`}
                </Text>
              )}
              {!hasAssociations && hasMembers && (
                <Text size="small">
                  {`Please note that activities targeting ${lowerCase(typeTitle)} members are not included.`}
                </Text>
              )}
            </Box>
          )}
          options={actiontypesAsTarget}
          optionListLabels={{
            attributes: 'Select activity types',
          }}
          onSetOptions={(options) => setActiontypesAsTarget(options)}
        />
      )}
      {hasAssociations && (
        <OptionGroup
          groupId="associations"
          label="Memberships"
          expandedId={expandGroup}
          onExpandGroup={(val) => setExpandGroup(val)}
          activeOptionCount={activeAssociationtypeCount}
          optionCount={Object.keys(associationtypes).length}
          intro="By default, the resulting CSV file will have one column for each type of association selected."
          options={associationtypes}
          optionListLabels={{
            attributes: 'Select association types',
          }}
          onSetOptions={(options) => setAssociationtypes(options)}
        />
      )}
      {hasMembers && (
        <OptionGroup
          groupId="members"
          label="Members"
          expandedId={expandGroup}
          onExpandGroup={(val) => setExpandGroup(val)}
          activeOptionCount={activeMembertypeCount}
          optionCount={Object.keys(membertypes).length}
          intro="By default, the resulting CSV file will have one column for each type of member selected."
          options={membertypes}
          optionListLabels={{
            attributes: 'Select member types',
          }}
          onSetOptions={(options) => setMembertypes(options)}
        />
      )}
      {hasUsers && (
        <OptionGroup
          groupId="users"
          label="Users"
          expandedId={expandGroup}
          onExpandGroup={(val) => setExpandGroup(val)}
          activeOptionCount={includeUsers ? 1 : 0}
          optionCount={1}
          active={includeUsers}
          onSetActive={(val) => setIncludeUsers(val)}
          onActiveLabel="Include assigned users"
        />
      )}
    </Box>
  );
}

OptionsForActors.propTypes = {
  hasUsers: PropTypes.bool,
  includeUsers: PropTypes.bool,
  setIncludeUsers: PropTypes.func,
  // attributes
  attributes: PropTypes.object,
  hasAttributes: PropTypes.bool,
  setAttributes: PropTypes.func,
  // taxonomies
  hasTaxonomies: PropTypes.bool,
  setTaxonomies: PropTypes.func,
  taxonomyColumns: PropTypes.object,
  // actions as active actor
  actiontypes: PropTypes.object,
  hasActions: PropTypes.bool,
  setActiontypes: PropTypes.func,
  actionsAsRows: PropTypes.bool,
  setActionsAsRows: PropTypes.func,
  // actions as targeted actor
  hasActionsAsTarget: PropTypes.bool,
  actiontypesAsTarget: PropTypes.object,
  setActiontypesAsTarget: PropTypes.func,
  // members (similar to child actors)
  hasMembers: PropTypes.bool,
  membertypes: PropTypes.object,
  setMembertypes: PropTypes.func,
  // associations (member of, similar to parent actors)
  hasAssociations: PropTypes.bool,
  associationtypes: PropTypes.object,
  setAssociationtypes: PropTypes.func,
  typeTitle: PropTypes.string,
};

export default OptionsForActors;
