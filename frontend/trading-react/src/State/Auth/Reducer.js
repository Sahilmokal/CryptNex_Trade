// State/Auth/Reducer.js
import { 
  REGISTER_REQUEST, 
  REGISTER_SUCCESS, 
  REGISTER_FAILURE, 
  LOGIN_SUCCESS, 
  LOGIN_FAILURE, 
  GET_USER_REQUEST, 
  LOGIN_REQUEST, 
  GET_USER_SUCCESS, 
  GET_USER_FAILURE, 
  LOGOUT 
} from "./ActionTypes";

const initialState = {
  user: null,
  loading: false,
  error: null,
  jwt: null,
  registrationMessage: null
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case REGISTER_REQUEST:
      return { ...state, loading: true, error: null, registrationMessage: null };

    case REGISTER_SUCCESS:
      // IMPORTANT: do NOT store a token here
      return { ...state, loading: false, error: null, registrationMessage: action.payload || "Registered" };

    case REGISTER_FAILURE:
      // ensure no jwt remains on register failure
      return { ...state, loading: false, error: action.payload, jwt: null };

    case LOGIN_REQUEST:
      return { ...state, loading: true, error: null };

    case LOGIN_SUCCESS:
      return { ...state, loading: false, error: null, jwt: action.payload };

    case LOGIN_FAILURE:
      // clear jwt on login failure
      return { ...state, loading: false, error: action.payload, jwt: null, user: null };

    case GET_USER_REQUEST:
      return { ...state, loading: true, error: null };

    case GET_USER_SUCCESS:
      return { ...state, user: action.payload, loading: false, error: null };

    case GET_USER_FAILURE:
      return { ...state, loading: false, error: action.payload, user: null, jwt: null };

    case LOGOUT:
      return { ...initialState };

    default:
      return state;
  }
};

export default authReducer;
