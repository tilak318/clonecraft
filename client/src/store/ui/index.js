import { generateManageReducer, getReducerConfig } from '../utils';

export const STATE_KEY = 'ui';

const ACTION = 'UI_ACTION';

export const INITIAL_STATE = {
  status: 'Ready to scrape websites',
  isSaving: false,
  savingIndex: 0,
  tab: null,
  log: null,
  theme: 'light',
};

const uiReducer = (state = INITIAL_STATE, action) => {
  const { type, payload } = action;
  
  switch (type) {
    case 'UI_SET_STATUS':
      return { ...state, status: payload };
    case 'UI_SET_IS_SAVING':
      return { ...state, isSaving: payload };
    case 'UI_SET_SAVING_INDEX':
      return { ...state, savingIndex: payload };
    case 'UI_SET_TAB':
      return { ...state, tab: payload };
    case 'UI_SET_LOG':
      return { ...state, log: payload };
    case 'UI_SET_THEME':
      return { ...state, theme: payload };
    case 'UI_FLASH_STATUS':
      return { ...state, status: payload };
    default:
      return state;
  }
};

export const uiActions = {
  setStatus: (status) => ({ type: 'UI_SET_STATUS', payload: status }),
  setIsSaving: (isSaving) => ({ type: 'UI_SET_IS_SAVING', payload: isSaving }),
  setSavingIndex: (index) => ({ type: 'UI_SET_SAVING_INDEX', payload: index }),
  setTab: (tab) => ({ type: 'UI_SET_TAB', payload: tab }),
  setLog: (log) => ({ type: 'UI_SET_LOG', payload: log }),
  setTheme: (theme) => ({ type: 'UI_SET_THEME', payload: theme }),
  flashStatus: (status) => ({ type: 'UI_FLASH_STATUS', payload: status }),
};

export default getReducerConfig(STATE_KEY, uiReducer); 