import { generateManageActions, generateManageReducer, getReducerConfig } from '../utils';

export const STATE_KEY = 'downloadList';

const ACTION = 'DOWNLOAD_LIST_ACTION';
const KEY = 'url';

export const {
  add: addDownloadItem,
  remove: removeDownloadItem,
  replace: replaceDownloadItem,
  reset: resetDownloadList,
} = generateManageActions(ACTION, KEY);

export const downloadListReducer = generateManageReducer(ACTION, KEY);

export default getReducerConfig(STATE_KEY, downloadListReducer); 