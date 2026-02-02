import api from "@/config/api";
import {
  ADD_PAYMENT_DETAILS_FAILURE,
  ADD_PAYMENT_DETAILS_REQUEST,
  ADD_PAYMENT_DETAILS_SUCCESS,
  GET_PAYMENT_DETAILS_FAILURE,
  GET_PAYMENT_DETAILS_REQUEST,
  GET_PAYMENT_DETAILS_SUCCESS,
  GET_WITHDRAWAL_HISTORY_FAILURE,
  GET_WITHDRAWAL_HISTORY_REQUEST,
  GET_WITHDRAWAL_HISTORY_SUCCESS,
  WITHDRAWAL_FAILURE,
  WITHDRAWAL_PROCEED_FAILURE,
  WITHDRAWAL_PROCEED_REQUEST,
  WITHDRAWAL_PROCEED_SUCCESS,
  WITHDRAWAL_REQUEST,
  WITHDRAWAL_SUCCESS,
} from "./ActionTypes";
import {
  GET_WITHDRAWAL_REQUEST_FAILURE,
  GET_WITHDRAWAL_REQUEST_REQUEST,
  GET_WITHDRAWAL_REQUEST_SUCCESS,
} from "../Wallet/ActionTypes";

// Helper to extract server error message (if any)
const extractError = (err) => {
  if (!err) return "Unknown error";
  return err.response?.data ?? err.message ?? String(err);
};

// Accept { amount, jwt } for consistency (so component can call dispatch(withdrawalRequest({ amount, jwt })))
export const withdrawalRequest = ({ amount, jwt }) => async (dispatch) => {
  dispatch({ type: WITHDRAWAL_REQUEST });
  try {
    const response = await api.post(`/api/withdrawal/${amount}`, null, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    console.log("withdrawal ---", response.data);
    dispatch({
      type: WITHDRAWAL_SUCCESS,
      payload: response.data,
    });
    // return response for caller if they await dispatch(...)
    return response.data;
  } catch (error) {
    const message = extractError(error);
    dispatch({
      type: WITHDRAWAL_FAILURE,
      payload: message,
    });
    // rethrow so callers can catch
    throw error;
  }
};

export const proceedWithdrawal = ({ id, jwt, accept }) => async (dispatch) => {
  dispatch({ type: WITHDRAWAL_PROCEED_REQUEST });
  try {
    const response = await api.patch(`/api/admin/withdrawal/${id}/proceed/${accept}`, null, {
      headers: { Authorization: `Bearer ${jwt}` },
    });

    console.log("proceed withdrawal ----", response.data);
    dispatch({
      type: WITHDRAWAL_PROCEED_SUCCESS,
      payload: response.data,
    });
    return response.data;
  } catch (error) {
    const message = extractError(error);
    console.log(error);
    dispatch({
      type: WITHDRAWAL_PROCEED_FAILURE,
      payload: message,
    });
    throw error;
  }
};

// NOTE: accept an object { jwt } to match component usage: dispatch(getWithdrawalHistory({ jwt }))
export const getWithdrawalHistory = ({ jwt }) => async (dispatch) => {
  dispatch({ type: GET_WITHDRAWAL_HISTORY_REQUEST });
  try {
    const response = await api.get("/api/withdrawal", {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    console.log("get withdrawal history ----", response.data);
    dispatch({
      type: GET_WITHDRAWAL_HISTORY_SUCCESS,
      payload: response.data,
    });
    return response.data;
  } catch (error) {
    const message = extractError(error);
    dispatch({
      type: GET_WITHDRAWAL_HISTORY_FAILURE,
      payload: message,
    });
    throw error;
  }
};

// Accept { jwt } here too
export const getAllWithdrawalRequest = ({ jwt }) => async (dispatch) => {
  dispatch({ type: GET_WITHDRAWAL_REQUEST_REQUEST });
  try {
    const response = await api.get("/api/admin/withdrawal", {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    console.log("get withdrawal requests ----", response.data);
    dispatch({
      type: GET_WITHDRAWAL_REQUEST_SUCCESS,
      payload: response.data,
    });
    return response.data;
  } catch (error) {
    console.log("error", error);
    dispatch({
      type: GET_WITHDRAWAL_REQUEST_FAILURE,
      payload: extractError(error),
    });
    throw error;
  }
};

export const addPaymentDetails = ({ paymentDetails, jwt }) => async (dispatch) => {
  dispatch({ type: ADD_PAYMENT_DETAILS_REQUEST });
  try {
    const response = await api.post(`/api/post/payment-details`, paymentDetails, {
      headers: { Authorization: `Bearer ${jwt}` },
    });

    console.log("add payment details ----", response.data);
    dispatch({
      type: ADD_PAYMENT_DETAILS_SUCCESS,
      payload: response.data,
    });
    return response.data;
  } catch (error) {
    console.log(error);
    dispatch({
      type: ADD_PAYMENT_DETAILS_FAILURE,
      payload: extractError(error),
    });
    throw error;
  }
};

export const getPaymentDetails = ({ jwt }) => async (dispatch) => {
  dispatch({ type: GET_PAYMENT_DETAILS_REQUEST });
  try {
    const response = await api.get(`/api/payment-details`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    console.log("get payment details ----", response.data);
    dispatch({
      type: GET_PAYMENT_DETAILS_SUCCESS,
      payload: response.data,
    });
    return response.data;
  } catch (error) {
    console.log(error);
    dispatch({
      type: GET_PAYMENT_DETAILS_FAILURE,
      payload: extractError(error),
    });
    throw error;
  }
};
