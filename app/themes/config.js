/*
 * Global config
 *
 * Theme and icons:
 * - theme file is set in app.js "import theme from 'themes/[theme-file]';"
 * - icon file is set in components/Icon/index.js "import icons from 'themes/[icons-file]';"
 *
 * Images: images are stored in 'themes/media' folder
 *
 */

// Language and date settings ********************
// Note: you may also set the locales in i18n.js

// default language locale
export const DEFAULT_LOCALE = 'en-GB';
// date format - change to format according to locale, only used for form error message
export const DATE_FORMAT = 'dd/MM/yyyy';
export const NODE_ENV = sessionStorage.NODE_ENV || 'production';

// UI settings ************************

// show app title and claim in header when not included in graphic
// set in translations/[LOCALE].js
// - app.containers.App.app.title
// - app.containers.App.app.claim
export const SHOW_HEADER_TITLE = true;

// show header pattern
// specified in themes/[theme].js: theme.backgroundImages.header
export const SHOW_HEADER_PATTERN = true;
export const HEADER_PATTERN_HEIGHT = 254;

// show header pattern
// specified in themes/[theme].js: theme.backgroundImages.sidebarHeader
export const SHOW_SIDEBAR_HEADER_PATTERN = false;

// show app title and claim in home when not included in graphic
// set in translations/[LOCALE].js
// - app.containers.App.app.title
// - app.containers.App.app.claim
export const SHOW_HOME_TITLE = true;

export const SHOW_BRAND_ON_HOME = true;
export const SHOW_HEADER_PATTERN_HOME_GRAPHIC = false;

// show footer logo section
export const FOOTER = {
  PARTNERS: false,
  LINK_TARGET_INTERNAL: true,
  LINK_TARGET_INTERNAL_ID: 1,
};

// entitylists items-per-page options
// export const PAGE_ITEM_OPTIONS = [10, 20, 50, 100, 'all'];
export const PAGE_ITEM_OPTIONS = [
  {
    value: 10,
  },
  {
    value: 20,
  },
  {
    value: 50,
  },
  {
    value: 100,
  },
  {
    value: 'all',
    message: 'ui.pageItemOptions.all',
  },
];

export const TEXT_TRUNCATE = {
  CONNECTION_TAG: 20,
  ATTRIBUTE_TAG: 10,
  ENTITY_TAG: 7,
  CONNECTION_POPUP: 80,
  LINK_FIELD: 30,
  ACTORTYPE_SELECT: 32,
  GRACE: 2,
  META_TITLE: 20,
};

export const COLUMN_WIDTHS = {
  FULL: 1,
  HALF: 0.5,
  MAIN: 0.72,
  OTHER: 0.28,
};

/**
 * Server settings
 * */

// General ********************

export const ENDPOINTS = {
  API: (
    NODE_ENV === 'production'
      ? 'https://67vn6.hatchboxapp.com'
      : 'https://67vn6.hatchboxapp.com'
  ), // server API endpoint
  SIGN_IN: 'auth/sign_in',
  SIGN_OUT: 'auth/sign_out',
  PASSWORD: 'auth/password',
  VALIDATE_TOKEN: 'auth/validate_token',
};

// API request Authentification keys
export const KEYS = {
  ACCESS_TOKEN: 'access-token',
  TOKEN_TYPE: 'token-type',
  CLIENT: 'client',
  EXPIRY: 'expiry',
  UID: 'uid',
  // RESET_PASSWORD: 'reset_password',
};

// database date format
export const API_DATE_FORMAT = 'yyyy-MM-dd';


// Map server messages *********************************

// Map server error messages to allow client-side translation
export const SERVER_ERRORS = {
  RECORD_OUTDATED: 'Record outdated',
  EMAIL_FORMAT: 'Email: is not an email',
  PASSWORD_MISMATCH: 'Password confirmation doesn\'t match Password',
  PASSWORD_SHORT: 'Password is too short (minimum is 6 characters)',
  PASSWORD_INVALID: 'Current password is invalid',
  TITLE_REQUIRED: 'Title: can\'t be blank',
  REFERENCE_REQUIRED: 'Reference: can\'t be blank',
};

// Map server attribute values **************************

// user roles
export const USER_ROLES = {
  ADMIN: { value: 1, message: 'ui.userRoles.admin' },
  MANAGER: { value: 2, message: 'ui.userRoles.manager' },
  ANALYST: { value: 3, message: 'ui.userRoles.analyst' },
  DEFAULT: { value: 9999, message: 'ui.userRoles.default' }, // note: client side only - no role assigned on server
};
// Entity publish statuses
export const PUBLISH_STATUSES = [
  { value: true, message: 'ui.publishStatuses.draft' },
  { value: false, message: 'ui.publishStatuses.public' },
];

export const DEFAULT_ACTORTYPE = '1';
export const DEFAULT_ACTIONTYPE = '1';
export const DEFAULT_TAXONOMY = '1';
export const NO_PARENT_KEY = 'parentUndefined';

// client app routes **************************
export const ROUTES = {
  ID: '/:id',
  VIEW: '/:view', //  e.g. list or map or stats
  NEW: '/new',
  EDIT: '/edit',
  IMPORT: '/import',
  OVERVIEW: '/overview',
  BOOKMARKS: '/bookmarks',
  PASSWORD: '/password', // change password
  LOGIN: '/login',
  LOGOUT: '/logout',
  REGISTER: '/register',
  UNAUTHORISED: '/unauthorised',
  USERS: '/users',
  ACTIONS: '/actions',
  ACTORS: '/actors',
  ACTION: '/action',
  ACTOR: '/actor',
  TAXONOMIES: '/categories',
  CATEGORY: '/category',
  PAGES: '/pages',
  SEARCH: '/search',
};

// Server endpoints for database tables **************************
export const API = {
  ACTORS: 'actors',
  ACTIONS: 'measures', // actions/ACTIONS
  ACTORTYPES: 'actortypes', // action types
  ACTIONTYPES: 'measuretypes', // action types
  ACTOR_ACTIONS: 'actor_measures', // linking actors with their actions
  ACTION_ACTORS: 'measure_actors', // linking actions with their targets
  ACTOR_CATEGORIES: 'actor_categories',
  ACTION_CATEGORIES: 'measure_categories', // measure_categories
  ACTORTYPE_TAXONOMIES: 'actortype_taxonomies', // action taxonomies
  ACTIONTYPE_TAXONOMIES: 'measuretype_taxonomies', // action taxonomies
  MEMBERSHIPS: 'memberships', // quasi: actor_actors
  // RESOURCES: 'resources',
  // ACTION_RESOURCES: 'measure_resources',
  // RESOURCETYPES: 'resourcetypes', // resource types
  TAXONOMIES: 'taxonomies',
  CATEGORIES: 'categories',
  USERS: 'users',
  USER_ROLES: 'user_roles',
  // USER_CATEGORIES: 'user_categories',
  ROLES: 'roles',
  PAGES: 'pages',
  BOOKMARKS: 'bookmarks',
};

export const ACTIONTYPES = {
  INTL: '1',
  REGLSEAS: '2',
  REGL: '3',
  NATL: '4',
  DONOR: '5',
  INIT: '6',
};
export const ACTORTYPES = {
  COUNTRY: '1',
  ORG: '2',
  CLASS: '3',
  REG: '4',
  GROUP: '5',
};

export const ACTIONTYPE_GROUPS = {
  // donor activities
  1: {
    types: [ACTIONTYPES.DONOR], // donor activities
    primary: true,
  },
  // policies etc
  2: {
    types: [
      ACTIONTYPES.NATL, // national strategies
      ACTIONTYPES.REGL, // regional strategies
      ACTIONTYPES.REGLSEAS, // regional seas conventions
      ACTIONTYPES.INTL, // international frameworks
    ],
  },
  // initiatives
  3: {
    types: [ACTIONTYPES.INIT], // initiatives
  },
};
export const ACTORTYPE_GROUPS = {
  // countries
  1: {
    types: [ACTORTYPES.COUNTRY],
  },
  // policies etc
  2: {
    types: [
      ACTORTYPES.ORG, // orgs
      ACTORTYPES.GROUP, // groups
      ACTORTYPES.REG, // regions
      ACTORTYPES.CLASS, // classes
    ],
  },
};

export const ACTION_FIELDS = {
  CONNECTIONS: {
    categories: {
      table: API.CATEGORIES,
      connection: API.ACTION_CATEGORIES,
      groupby: {
        table: API.TAXONOMIES,
        on: 'taxonomy_id',
      },
    },
    actors: {
      table: API.ACTORS,
      connection: API.ACTOR_ACTIONS,
      groupby: {
        table: API.ACTORTYPES,
        on: 'actortype_id',
      },
    },
    targets: {
      table: API.ACTORS,
      connection: API.ACTION_ACTORS,
      groupby: {
        table: API.ACTORTYPES,
        on: 'actortype_id',
      },
    },
  },
  ATTRIBUTES: {
    measuretype_id: {
      defaultValue: '1',
      required: Object.values(ACTIONTYPES), // all types
      type: 'number',
      table: API.ACTIONTYPES,
    },
    draft: {
      defaultValue: true,
      required: Object.values(ACTIONTYPES), // all types
      type: 'bool',
      // ui: 'dropdown',
      skipImport: true,
      // options: [
      //   { value: true, message: 'ui.publishStatuses.draft' },
      //   { value: false, message: 'ui.publishStatuses.public' },
      // ],
    },
    code: {
      optional: Object.values(ACTIONTYPES), // all types
      type: 'text',
    },
    title: {
      required: Object.values(ACTIONTYPES), // all types
      type: 'text',
    },
    description: {
      optional: [
        ACTIONTYPES.INTL,
        ACTIONTYPES.REGL,
        ACTIONTYPES.NATL,
        ACTIONTYPES.DONOR,
        ACTIONTYPES.INIT,
      ],
      type: 'markdown',
    },
    comment: {
      optional: [
        ACTIONTYPES.DONOR,
        ACTIONTYPES.INIT,
      ],
      type: 'markdown',
    },
    url: {
      optional: [
        ACTIONTYPES.INTL,
        ACTIONTYPES.REGLSEAS,
        ACTIONTYPES.DONOR,
        ACTIONTYPES.INIT,
      ],
      type: 'url',
    },
    date_start: {
      optional: [
        ACTIONTYPES.INTL,
        ACTIONTYPES.REGLSEAS,
        ACTIONTYPES.NATL,
        ACTIONTYPES.DONOR,
        ACTIONTYPES.INIT,
      ],
      type: 'date',
    },
    date_end: {
      optional: [
        ACTIONTYPES.INTL,
        ACTIONTYPES.REGLSEAS,
        ACTIONTYPES.NATL,
        ACTIONTYPES.DONOR,
        ACTIONTYPES.INIT,
      ],
      type: 'date',
    },
    date_comment: {
      optional: [
        ACTIONTYPES.INTL,
        ACTIONTYPES.REGLSEAS,
        ACTIONTYPES.NATL,
        ACTIONTYPES.DONOR,
        ACTIONTYPES.INIT,
      ],
      type: 'text',
    },
    target_comment: {
      optional: [
        ACTIONTYPES.REGLSEAS,
        ACTIONTYPES.DONOR,
        ACTIONTYPES.INIT,
      ],
      type: 'markdown',
    },
    status_comment: {
      optional: [
        ACTIONTYPES.INTL,
        ACTIONTYPES.REGLSEAS,
      ],
      type: 'markdown',
    },
    reference_ml: {
      optional: [ACTIONTYPES.INTL],
      type: 'text',
    },
    status_lbs_protocol: {
      optional: [ACTIONTYPES.REGLSEAS],
      type: 'text',
    },
    reference_landbased_ml: {
      optional: [ACTIONTYPES.REGLSEAS],
      type: 'text',
    },
    has_reference_landbased_ml: {
      optional: [ACTIONTYPES.REGLSEAS],
      type: 'bool',
      ui: 'checkbox',
      defaultValue: false,
    },
    amount: {
      optional: [ACTIONTYPES.DONOR],
      type: 'number',
    },
    amount_comment: {
      optional: [ACTIONTYPES.DONOR],
      type: 'text',
    },
  },
};

export const ACTOR_FIELDS = {
  CONNECTIONS: {
    categories: {
      table: API.CATEGORIES,
      connection: API.ACTOR_CATEGORIES,
      groupby: {
        table: API.TAXONOMIES,
        on: 'taxonomy_id',
      },
    },
    actions: {
      table: API.ACTIONS,
      connection: API.ACTOR_ACTIONS,
      groupby: {
        table: API.ACTIONTYPES,
        on: 'measuretype_id',
      },
    },
    targeted: {
      table: API.ACTIONS,
      connection: API.ACTION_ACTORS,
      groupby: {
        table: API.ACTIONTYPES,
        on: 'measuretype_id',
      },
    },
  },
  ATTRIBUTES: {
    actortype_id: {
      defaultValue: '1',
      required: Object.values(ACTORTYPES), // all types
      type: 'number',
      table: API.ACTORTYPES,
    },
    draft: {
      defaultValue: true,
      required: Object.values(ACTORTYPES), // all types
      type: 'bool',
      skipImport: true,
      // ui: 'dropdown',
      // options: [
      //   { value: true, message: 'ui.publishStatuses.draft' },
      //   { value: false, message: 'ui.publishStatuses.public' },
      // ],
    },
    code: {
      optional: Object.values(ACTORTYPES), // all types
      type: 'text',
    },
    title: {
      required: Object.values(ACTORTYPES), // all types
      type: 'text',
    },
    description: {
      optional: [
        ACTORTYPES.ORG,
        ACTORTYPES.CLASS,
        ACTORTYPES.REG,
        ACTORTYPES.GROUP,
      ],
      type: 'markdown',
    },
    activity_summary: {
      optional: [
        ACTORTYPES.COUNTRY,
        ACTORTYPES.ORG,
        ACTORTYPES.GROUP,
      ],
      type: 'markdown',
    },
    url: {
      optional: [
        ACTORTYPES.ORG,
        ACTORTYPES.GROUP,
      ],
      type: 'url',
    },
    gdp: {
      optional: [ACTORTYPES.COUNTRY],
      type: 'number',
    },
    population: {
      optional: [ACTORTYPES.COUNTRY],
      type: 'number',
    },
  },
};

// type compatibility: actors for actions
export const ACTIONTYPE_ACTORTYPES = {
  [ACTIONTYPES.INTL]: [
    ACTORTYPES.COUNTRY,
    ACTORTYPES.ORG,
    ACTORTYPES.GROUP,
  ],
  [ACTIONTYPES.REGLSEAS]: [
    ACTORTYPES.COUNTRY,
  ],
  [ACTIONTYPES.REGL]: [
    ACTORTYPES.COUNTRY,
    ACTORTYPES.GROUP,
  ],
  [ACTIONTYPES.NATL]: [
    ACTORTYPES.COUNTRY,
  ],
  [ACTIONTYPES.DONOR]: [
    ACTORTYPES.COUNTRY,
    ACTORTYPES.ORG,
    ACTORTYPES.GROUP,
  ],
  [ACTIONTYPES.INIT]: [
    ACTORTYPES.COUNTRY,
    ACTORTYPES.ORG,
    ACTORTYPES.GROUP,
  ],
};
// type compatibility: targets for actions
export const ACTIONTYPE_TARGETTYPES = {
  [ACTIONTYPES.INTL]: [],
  [ACTIONTYPES.REGLSEAS]: [
    ACTORTYPES.COUNTRY,
    ACTORTYPES.GROUP,
    ACTORTYPES.REG,
    ACTORTYPES.CLASS,
  ],
  [ACTIONTYPES.REGL]: [],
  [ACTIONTYPES.NATL]: [],
  [ACTIONTYPES.DONOR]: [
    ACTORTYPES.COUNTRY,
    ACTORTYPES.GROUP,
    ACTORTYPES.REG,
    ACTORTYPES.CLASS,
  ],
  [ACTIONTYPES.INIT]: [
    ACTORTYPES.COUNTRY,
    ACTORTYPES.GROUP,
    ACTORTYPES.REG,
    ACTORTYPES.CLASS,
  ],
};
