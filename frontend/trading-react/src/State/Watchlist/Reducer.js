// src/State/Watchlist/reducer.js
import * as types from "./ActionTypes";

const initialState = {
  watchlist: null,     // raw API object (e.g. { id, user, coins: [...] })
  items: [],           // normalized coin array for UI
  loading: false,
  error: null,
};

export default function watchlistReducer(state = initialState, action) {
  switch (action.type) {
    case types.GET_USER_WATCHLSIT_REQUEST:
    case types.ADD_COIN_TO_WATCHLIST_REQUEST:
    case types.REMOVE_COIN_FROM_WATCHLIST_REQUEST:
      return { ...state, loading: true, error: null };

    case types.GET_USER_WATCHLSIT_SUCCESS: {
      const payload = action.payload;
      // payload might be { id, user, coins: [...] } or maybe an array directly
      const coins =
        (payload && payload.coins && Array.isArray(payload.coins) && payload.coins) ||
        (Array.isArray(payload) && payload) ||
        state.items ||
        [];

      return {
        ...state,
        watchlist: payload,
        items: coins,
        loading: false,
        error: null,
      };
    }

    case types.ADD_COIN_TO_WATCHLIST_SUCCESS:
    case types.REMOVE_COIN_FROM_WATCHLIST_SUCCESS: {
      // backend usually returns updated watchlist; reuse success handling
      const payload = action.payload;
      const coins = (payload && payload.coins) || state.items || [];
      return { ...state, watchlist: payload, items: coins, loading: false, error: null };
    }

    case types.GET_USER_WATCHLSIT_FAILURE:
    case types.ADD_COIN_TO_WATCHLIST_FAILURE:
    case types.REMOVE_COIN_FROM_WATCHLIST_FAILURE:
      return { ...state, loading: false, error: action.error ?? action.payload ?? "Error" };

    default:
      return state;
  }
}
