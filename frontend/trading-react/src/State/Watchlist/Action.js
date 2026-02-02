// src/State/Watchlist/Action.js
import api from "@/config/api";
import * as types from "./ActionTypes";
import { useSelector } from "react-redux";

/**
 * Get user watchlist
 */

export const getUserWatchList = (jwt) => async (dispatch) => {
    
  dispatch({ type: types.GET_USER_WATCHLSIT_REQUEST });
  try {
    const response = await api.get(`/api/watchlist/user`, {
        headers:{
            Authorization: `Bearer ${jwt}`,
        },
    });
    dispatch({
      type: types.GET_USER_WATCHLSIT_SUCCESS,
      payload: response.data,
    });
    console.log("user watchlist", response.data);
    return response.data;
  } catch (error) {
    console.log("error", error);
    dispatch({
      type: types.GET_USER_WATCHLSIT_FAILURE,
      error: error.message,
    });
    throw error;
  }
};

/**
 * addItemToWatchlist
 * Accepts either:
 *  - addItemToWatchlist({ coinId, jwt })
 *  - addItemToWatchlist(coinId, jwt)
 *
 * Returns response.data (so callers can await it).
 */
export const addItemToWatchlist = (arg1, arg2) => async (dispatch) => {
  dispatch({ type: types.ADD_COIN_TO_WATCHLIST_REQUEST });

  // Normalize args to { coinId, jwt }
  let coinId, jwt;
  if (typeof arg1 === "object" && arg1 !== null && ("coinId" in arg1 || "jwt" in arg1)) {
    coinId = arg1.coinId;
    jwt = arg1.jwt;
  } else {
    coinId = arg1;
    jwt = arg2;
  }

  try {
    if (!coinId) throw new Error("addItemToWatchlist: coinId is required");

    const safeId = encodeURIComponent(String(coinId));
    const url = `/api/watchlist/add/coin/${safeId}`;

    const response = await api.patch(
      url,
      {}, // body empty by your original implementation
      {
        headers: jwt ? { Authorization: `Bearer ${jwt}` } : {},
      }
    );

    dispatch({
      type: types.ADD_COIN_TO_WATCHLIST_SUCCESS,
      payload: response.data,
    });
    console.log("add coin to watchlist", response.data);
    return response.data;
  } catch (error) {
    console.log("addItemToWatchlist error", error);
    dispatch({
      type: types.ADD_COIN_TO_WATCHLIST_FAILURE,
      error: error.message || error,
    });
    throw error;
  }
};

export const removeItemFromWatchlist = (arg) => async (dispatch) => {
  const { coinId, jwt } = typeof arg === "object" ? arg : { coinId: arg, jwt: null };
  dispatch({ type: types.REMOVE_COIN_FROM_WATCHLIST_REQUEST });
  try {
    if (!coinId) throw new Error("coinId required");
    const url = `/api/watchlist/remove/coin/${encodeURIComponent(String(coinId))}`;
    const response = await api.patch(url, {}, {
      headers: jwt ? { Authorization: `Bearer ${jwt}` } : {},
    });
    dispatch({ type: types.REMOVE_COIN_FROM_WATCHLIST_SUCCESS, payload: response.data });
    // optionally return response so caller can await
    return response.data;
  } catch (error) {
    console.error("removeItemFromWatchlist error", error);
    dispatch({ type: types.REMOVE_COIN_FROM_WATCHLIST_FAILURE, error: error.message || error });
    throw error;
  }
};
