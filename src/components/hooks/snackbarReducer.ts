export const ACTION_TYPES = {
  OPEN_ERROR: 'open error',
  OPEN_INFO: 'open info',
  OPEN_WARNING: 'open warning',
  OPEN_SUCCESS: 'open success',
  CLOSE: 'close',
};

type StateType = {
  isOpen: boolean;
  alertType: 'error' | 'info' | 'warning' | 'success';
  message: string;
};

export const initialState: StateType = {
  isOpen: false,
  alertType: 'success',
  message: '',
};

export type ActionType = {
  type: string;
  message?: string;
};

export const snackbarReducer = (
  state: StateType,
  action: ActionType
): StateType => {
  switch (action.type) {
    case ACTION_TYPES.OPEN_ERROR:
      return {
        ...state,
        alertType: 'error',
        message: action.message || '',
        isOpen: true,
      };
    case ACTION_TYPES.OPEN_INFO:
      return {
        ...state,
        alertType: 'info',
        message: action.message || '',
        isOpen: true,
      };
    case ACTION_TYPES.OPEN_WARNING:
      return {
        ...state,
        alertType: 'warning',
        message: action.message || '',
        isOpen: true,
      };
    case ACTION_TYPES.OPEN_SUCCESS:
      return {
        ...state,
        alertType: 'success',
        message: action.message || '',
        isOpen: true,
      };
    case ACTION_TYPES.CLOSE:
      return {
        ...state,
        alertType: 'info',
        message: action.message || '',
        isOpen: false,
      };
    default:
      throw new Error();
  }
};
