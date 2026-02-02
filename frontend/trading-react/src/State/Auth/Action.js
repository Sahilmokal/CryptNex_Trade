import axios from "axios";
import {
  GET_USER_FAILURE,
  GET_USER_REQUEST,
  GET_USER_SUCCESS,
  LOGIN_FAILURE,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGOUT,
  REGISTER_FAILURE,
  REGISTER_REQUEST,
  REGISTER_SUCCESS,
} from "./ActionTypes";

const baseUrl = "http://localhost:5454";

// Register
export const register = (userData) => async (dispatch) => {
  dispatch({ type: REGISTER_REQUEST });
  try {
    const response = await axios.post(`${baseUrl}/auth/signup`, userData);
    dispatch({ type: REGISTER_SUCCESS, payload: response.data.message || "Registered" });
    return { success: true, data: response.data };
  } catch (err) {
    const errPayload = err?.response?.data || err.message;
    dispatch({ type: REGISTER_FAILURE, payload: errPayload });
    return { success: false, error: errPayload };
  }
};

// Login (normal user)
export const login = (credentials) => async (dispatch) => {
  dispatch({ type: LOGIN_REQUEST });
  try {
    const response = await axios.post(`${baseUrl}/auth/login`, credentials);
    const respData = response.data;

    const jwt = respData?.jwt;
    if (!jwt) {
      const msg = respData?.message || "No token returned from login";
      dispatch({ type: LOGIN_FAILURE, payload: msg });
      return { success: false, error: msg };
    }

    localStorage.setItem("jwt", jwt);
    dispatch({ type: LOGIN_SUCCESS, payload: jwt });

    try {
      const profileResp = await axios.get(`${baseUrl}/api/users/profile`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });

      let userPayload = profileResp.data && (profileResp.data.user ?? profileResp.data);
      if (userPayload) {
        dispatch({ type: GET_USER_SUCCESS, payload: userPayload });
      } else {
        dispatch({ type: GET_USER_FAILURE, payload: "Profile fetch returned no user" });
      }
      return { success: true, data: respData };
    } catch (profileErr) {
      const profileMsg = profileErr?.response?.data || profileErr?.message;
      localStorage.removeItem("jwt");
      dispatch({ type: LOGIN_FAILURE, payload: profileMsg });
      return { success: false, error: profileMsg };
    }
  } catch (error) {
    const err = error?.response?.data || error.message;
    dispatch({ type: LOGIN_FAILURE, payload: err });
    return { success: false, error: err };
  }
};

// Admin login (calls /auth/admin/login)
// adminLogin inside State/Auth/Action.js (replace existing adminLogin)
export const adminLogin = (credentials) => async (dispatch) => {
  dispatch({ type: LOGIN_REQUEST });
  try {
    const response = await axios.post(`${baseUrl}/auth/admin/login`, credentials);
    const respData = response.data;

    if (!respData || respData.status !== true || !respData.jwt) {
      const err = respData?.message || "Admin login failed";
      dispatch({ type: LOGIN_FAILURE, payload: err });
      return { success: false, error: err, status: response.status };
    }

    const jwt = respData.jwt;

    // Store token under same key as user login
    localStorage.setItem("jwt", jwt);
    dispatch({ type: LOGIN_SUCCESS, payload: jwt });

    // Immediately fetch profile and populate Redux
    try {
      const profileResp = await axios.get(`${baseUrl}/api/users/profile`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      const userPayload = profileResp.data && (profileResp.data.user ?? profileResp.data);
      if (userPayload) {
        dispatch({ type: GET_USER_SUCCESS, payload: userPayload });
        return { success: true, data: respData };
      } else {
        dispatch({ type: GET_USER_FAILURE, payload: "Profile missing" });
        localStorage.removeItem("jwt");
        return { success: false, error: "Profile missing" };
      }
    } catch (profileErr) {
      const profileMsg = profileErr?.response?.data?.message || profileErr?.response?.data || profileErr?.message;
      dispatch({ type: LOGIN_FAILURE, payload: profileMsg });
      localStorage.removeItem("jwt");
      return { success: false, error: profileMsg };
    }
  } catch (err) {
    const payload = err?.response?.data || err?.message || "Admin login request failed";
    dispatch({ type: LOGIN_FAILURE, payload });
    return { success: false, error: payload, status: err?.response?.status };
  }
};


// getUser
export const getUser = (jwt) => async (dispatch) => {
  if (!jwt) {
    dispatch({ type: GET_USER_FAILURE, payload: "No token" });
    return;
  }
  dispatch({ type: GET_USER_REQUEST });
  try {
    const response = await axios.get(`${baseUrl}/api/users/profile`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    let userPayload = response.data && (response.data.user ?? response.data);
    if (!userPayload) {
      dispatch({ type: GET_USER_FAILURE, payload: "No user in response" });
      return;
    }
    dispatch({ type: GET_USER_SUCCESS, payload: userPayload });
  } catch (error) {
    const msg = error?.response?.data || error.message;
    if (error?.response?.status === 401) localStorage.removeItem("jwt");
    dispatch({ type: GET_USER_FAILURE, payload: msg });
  }
};
export const sendMfaOtp = (verificationType) => async (dispatch) => {
  try {
    await api.patch(
      `/api/users/verification/${verificationType}/send-otp`
    );
  } catch (error) {
    throw error;
  }
};

/* VERIFY OTP */
export const verifyMfaOtp = (otp) => async (dispatch) => {
  try {
    const { data } = await api.patch(
      `/api/users/enable-two-factor/verify-otp/${otp}`
    );
    dispatch({ type: "AUTH_SUCCESS", payload: data }); // update user
    return data;
  } catch (error) {
    throw error;
  }
};

export const logout = () => (dispatch) => {
  localStorage.clear();
  dispatch({ type: LOGOUT });
};
