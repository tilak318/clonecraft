import { generateManageReducer, getReducerConfig } from '../utils';

export const STATE_KEY = 'option';

const ACTION = 'OPTION_ACTION';

export const INITIAL_STATE = {
  ignoreNoContentFile: true,
  beautifyFile: true,
};

const optionReducer = (state = INITIAL_STATE, action) => {
  const { type, payload } = action;
  
  switch (type) {
    case 'OPTION_SET_IGNORE_NO_CONTENT_FILE':
      return { ...state, ignoreNoContentFile: payload };
    case 'OPTION_SET_BEAUTIFY_FILE':
      return { ...state, beautifyFile: payload };
    default:
      return state;
  }
};

export const optionActions = {
  setIgnoreNoContentFile: (value) => ({ type: 'OPTION_SET_IGNORE_NO_CONTENT_FILE', payload: value }),
  setBeautifyFile: (value) => ({ type: 'OPTION_SET_BEAUTIFY_FILE', payload: value }),
};

export default getReducerConfig(STATE_KEY, optionReducer); 