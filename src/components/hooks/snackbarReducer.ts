export const ACTION_TYPES = {
  OPEN: 'open',
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
  message: string;
  alertType: 'error' | 'info' | 'warning' | 'success';
};

export const snackbarReducer = (
  state: StateType,
  action: ActionType
): StateType => {
  switch (action.type) {
    case ACTION_TYPES.OPEN:
      return {
        ...state,
        alertType: action.alertType,
        message: action.message,
        isOpen: true,
      };
    case ACTION_TYPES.CLOSE:
      return {
        ...state,
        alertType: action.alertType,
        message: action.message,
        isOpen: false,
      };
    default:
      throw new Error();
  }
};
