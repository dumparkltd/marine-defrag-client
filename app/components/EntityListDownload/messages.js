/*
 * Messages
 *
 */
import { defineMessages } from 'react-intl';

export default defineMessages({
  buttonDownload: {
    id: 'app.components.EntityListDownload.buttonDownload',
    defaultMessage: 'Download CSV',
  },
  groupShow: {
    id: 'app.components.EntityListDownload.groupShow',
    defaultMessage: 'Show',
  },
  groupHide: {
    id: 'app.components.EntityListDownload.groupHide',
    defaultMessage: 'Hide',
  },
  includeTimestamp: {
    id: 'app.components.EntityListDownload.includeTimestamp',
    defaultMessage: 'Include timestamp',
  },
  filenameLabel: {
    id: 'app.components.EntityListDownload.filenameLabel',
    defaultMessage: 'Enter filename',
  },
  exportDescription: {
    id: 'app.components.EntityListDownload.exportDescription',
    defaultMessage: 'Please select the attributes, categories and/or connections you would like to include',
  },
  downloadCsvTitle: {
    id: 'app.components.EntityListDownload.downloadCsvTitle',
    defaultMessage: 'Download CSV',
  },
  exportAsTitle: {
    id: 'app.components.EntityListDownload.exportAsTitle',
    defaultMessage: 'Export {typeTitle} as CSV',
  },
});
