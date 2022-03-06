import {
  API,
  USER_ROLES,
  PUBLISH_STATUSES,
  ROUTES,
  ACTORTYPES,
} from 'themes/config';

export const DEPENDENCIES = [
  API.ACTORS,
  API.ACTIONS,
  API.ACTOR_ACTIONS,
  API.ACTION_ACTORS,
  API.ACTOR_CATEGORIES,
  API.ACTION_CATEGORIES,
  API.ACTORTYPES,
  API.ACTIONTYPES,
  API.ACTORTYPE_TAXONOMIES,
  API.ACTIONTYPE_TAXONOMIES,
  API.TAXONOMIES,
  API.CATEGORIES,
  API.USERS,
  API.USER_ROLES,
  API.MEMBERSHIPS,
];

export const CONFIG = {
  types: 'actortypes',
  serverPath: API.ACTORS,
  clientPath: ROUTES.ACTOR,
  views: {
    list: {
      search: ['code', 'title', 'description'],
      sorting: [
        {
          attribute: 'title',
          type: 'string',
          order: 'asc',
          default: true,
        },
        {
          attribute: 'code',
          type: 'string',
          order: 'asc',
        },
        {
          attribute: 'updated_at',
          type: 'date',
          order: 'desc',
        },
        {
          attribute: 'id', // proxy for created at
          type: 'number',
          order: 'desc',
        },
      ],
    },
    map: {
      types: [ACTORTYPES.COUNTRY, ACTORTYPES.ORG, ACTORTYPES.GROUP],
    },
  },
  taxonomies: { // filter by each category
    query: 'cat',
    search: true,
    connectPath: API.ACTOR_CATEGORIES,
    key: 'category_id',
    ownKey: 'actor_id',
    // defaultGroupAttribute: 'groups_actors_default', // used when no actortype is set
    // // TODO better store in database join table actortype_taxonomies
    // defaultGroupsByActortype: {
    //   1: { 1: '1', 2: '2' }, // actortype 1 actors are grouped by taxonomies 1 & 2
    //   2: { 1: '9', 2: '10' }, // actortype 2 SDS are grouped by taxonomies 9 & 10
    //   3: { 1: '7' }, // actortype 3 SDGs are grouped by taxonomy 7
    // },
    // groupBy: 'actortype_id',
    // editForActortypes: true,
  },
  connections: { // filter by associated entity
    actions: {
      query: 'action',
      type: 'actor-actions',
      search: true,
      messageByType: 'entities.actions_{typeid}.plural',
      message: 'entities.actions.plural',
      path: API.ACTIONS, // filter by actor connection
      entityType: 'actions', // filter by actor connection
      clientPath: ROUTES.ACTION,
      connectPath: API.ACTOR_ACTIONS, // filter by actor connection
      key: 'measure_id',
      ownKey: 'actor_id',
      groupByType: true,
    },
    targets: { // filter by associated entity
      query: 'targeting',
      type: 'target-actions',
      search: true,
      messageByType: 'entities.actions_{typeid}.plural',
      message: 'entities.actions.plural',
      path: API.ACTIONS, // filter by actor connection
      entityType: 'actions', // filter by actor connection
      entityTypeAs: 'targetingActions',
      clientPath: ROUTES.ACTION,
      connectPath: API.ACTION_ACTORS, // filter by actor connection
      key: 'measure_id',
      ownKey: 'actor_id',
      groupByType: true,
      typeFilter: 'has_target',
    },
    members: { // filter by associated entity
      query: 'by-member',
      type: 'association-members',
      search: true,
      messageByType: 'entities.actors_{typeid}.plural',
      message: 'entities.actors.plural',
      path: API.ACTORS, // filter by actor connection
      entityTypeAs: 'members', // filter by actor connection
      entityType: 'actors',
      clientPath: ROUTES.ACTOR,
      connectPath: API.MEMBERSHIPS, // filter by actor connection
      key: 'member_id',
      ownKey: 'memberof_id',
      groupByType: true,
      typeFilter: 'has_members',
      typeFilterPass: 'reverse',
    },
    associations: { // filter by associated entity
      query: 'by-association',
      type: 'member-associations',
      search: true,
      messageByType: 'entities.actors_{typeid}.plural',
      message: 'entities.actors.plural',
      path: API.ACTORS, // filter by actor connection
      entityType: 'actors',
      entityTypeAs: 'associations', // filter by actor connection
      clientPath: ROUTES.ACTOR,
      connectPath: API.MEMBERSHIPS, // filter by actor connection
      key: 'memberof_id',
      ownKey: 'member_id',
      groupByType: true,
      typeFilter: 'has_members',
    },
  },
  attributes: { // filter by attribute value
    options: [
      {
        search: false,
        message: 'attributes.draft',
        attribute: 'draft',
        options: PUBLISH_STATUSES,
        role: USER_ROLES.MANAGER.value,
      },
    ],
  },
};
