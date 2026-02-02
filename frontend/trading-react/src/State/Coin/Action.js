import axios from "axios";
import {
  FETCH_COIN_BY_ID_FAILURE,
  FETCH_COIN_BY_ID_REQUEST,
  FETCH_COIN_BY_ID_SUCCESS,
  FETCH_COIN_DETAILS_FAILURE,
  FETCH_COIN_DETAILS_REQUEST,
  FETCH_COIN_DETAILS_SUCCESS,
  FETCH_COIN_LIST_FAILURE,
  FETCH_COIN_LIST_REQUEST,
  FETCH_COIN_LIST_SUCCESS,
  FETCH_MARKET_CHART_FAILURE,
  FETCH_MARKET_CHART_REQUEST,
  FETCH_MARKET_CHART_SUCCESS,
  FETCH_TOP_50_COINS_FAILURE,
  FETCH_TOP_50_COINS_REQUEST,
  FETCH_TOP_50_COINS_SUCCESS,
  SEARCH_COIN_FAILURE,
  SEARCH_COIN_REQUEST,
  SEARCH_COIN_SUCCESS,
  FETCH_TOP_GAINERS_SUCCESS,
  FETCH_TOP_GAINERS_REQUEST,
  FETCH_TOP_LOSERS_REQUEST,
  FETCH_TOP_LOSERS_FAILURE,
  FETCH_TOP_GAINERS_FAILURE,
  FETCH_TOP_LOSERS_SUCCESS
  
} from "./ActionType";

import api, { API_BASE_URL } from "@/config/api";

/* ---------- helpers ---------- */
const authHeaders = (jwt) => {
  const headers = {};
  if (jwt) headers.Authorization = `Bearer ${jwt}`;
  return headers;
};

/* ---------- COINS ---------- */

export const getCoinList = (page) => async (dispatch) => {
  dispatch({ type: FETCH_COIN_LIST_REQUEST });
  try {
    const { data } = await axios.get(`${API_BASE_URL}/coins?page=${page}`);
    dispatch({ type: FETCH_COIN_LIST_SUCCESS, payload: data });
    return data;
  } catch (error) {
    dispatch({ type: FETCH_COIN_LIST_FAILURE, payload: error.message });
    throw error;
  }
};

export const getTop50CoinList = () => async (dispatch) => {
  dispatch({ type: FETCH_TOP_50_COINS_REQUEST });
  try {
    const { data } = await axios.get(`${API_BASE_URL}/coins/top50`);
    dispatch({ type: FETCH_TOP_50_COINS_SUCCESS, payload: data });
    return data;
  } catch (error) {
    dispatch({ type: FETCH_TOP_50_COINS_FAILURE, payload: error.message });
    throw error;
  }
};

/* ---------- TOP GAINERS / LOSERS ---------- */

export const getTopGainers = () => async (dispatch) => {
  dispatch({ type: FETCH_TOP_GAINERS_REQUEST });

  try {
    const res = await axios.get("http://localhost:5454/coins/gainers");
    dispatch({ type: FETCH_TOP_GAINERS_SUCCESS, payload: res.data });
  } catch (err) {
    dispatch({
      type: FETCH_TOP_GAINERS_FAILURE,
      payload: err.message,
    });
  }
};


export const getTopLosers = () => async (dispatch) => {
  console.log("🔥 getTopLosers() CALLED");

  dispatch({ type: FETCH_TOP_LOSERS_REQUEST });

  try {
    const res = await axios.get("http://localhost:5454/coins/losers");

    console.log("✅ Top Losers API response:", res.data);

    dispatch({
      type: FETCH_TOP_LOSERS_SUCCESS,
      payload: res.data,
    });
  } catch (err) {
    console.error("❌ Top Losers API FAILED:", err);

    dispatch({
      type: FETCH_TOP_LOSERS_FAILURE,
      payload: err.message,
    });
  }
};


/* ---------- MARKET CHART ---------- */

export const fetchMarketChart =
  ({ coinId, days = 30, jwt }) =>
  async (dispatch) => {
    dispatch({ type: FETCH_MARKET_CHART_REQUEST });
    try {
      const { data } = await api.get(
        `/coins/${coinId}/chart?days=${days}`,
        { headers: authHeaders(jwt) }
      );
      dispatch({ type: FETCH_MARKET_CHART_SUCCESS, payload: data });
      return data;
    } catch (err) {
      const msg =
        err?.response?.data?.message ?? err.message ?? "Error fetching chart";
      dispatch({ type: FETCH_MARKET_CHART_FAILURE, payload: msg });
      throw new Error(msg);
    }
  };

/* ---------- COIN DETAILS ---------- */

export const fetchCoinById = (coinId) => async (dispatch) => {
  dispatch({ type: FETCH_COIN_BY_ID_REQUEST });
  try {
    const { data } = await axios.get(`${API_BASE_URL}/coins/${coinId}`);
    dispatch({ type: FETCH_COIN_BY_ID_SUCCESS, payload: data });
    return data;
  } catch (error) {
    dispatch({ type: FETCH_COIN_BY_ID_FAILURE, payload: error.message });
    throw error;
  }
};

export const fetchCoinDetails =
  ({ coinId, jwt }) =>
  async (dispatch) => {
    dispatch({ type: FETCH_COIN_DETAILS_REQUEST });
    try {
      const { data } = await api.get(`/coins/details/${coinId}`, {
        headers: authHeaders(jwt),
      });
      dispatch({ type: FETCH_COIN_DETAILS_SUCCESS, payload: data });
      return data;
    } catch (err) {
      const msg =
        err?.response?.data?.message ??
        err.message ??
        "Error fetching coin details";
      dispatch({ type: FETCH_COIN_DETAILS_FAILURE, payload: msg });
      throw new Error(msg);
    }
  };

/* ---------- SEARCH ---------- */
export const searchCoin = (keyword) => async (dispatch) => {
  dispatch({ type: SEARCH_COIN_REQUEST });
  try {
    const response = await api.get(
      `/coins/search?query=${encodeURIComponent(keyword)}`
    );
    dispatch({ type: SEARCH_COIN_SUCCESS, payload: response.data });
    return response.data;
  } catch (error) {
    dispatch({
      type: SEARCH_COIN_FAILURE,
      payload: error?.response?.data?.message || error.message,
    });
    throw error;
  }
};
