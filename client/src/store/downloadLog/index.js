import { generateManageActions, generateManageReducer, getReducerConfig } from '../utils';

export const STATE_KEY = 'downloadLog';

const ACTION = 'DOWNLOAD_LOG_ACTION';
const KEY = 'url';

export const {
  add: addLogItem,
  remove: removeLogItem,
  reset: resetDownloadLog,
} = generateManageActions(ACTION, KEY);

export const downloadLogReducer = generateManageReducer(ACTION, KEY);

export default getReducerConfig(STATE_KEY, downloadLogReducer); 