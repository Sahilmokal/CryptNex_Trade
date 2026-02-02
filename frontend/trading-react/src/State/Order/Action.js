// src/State/Order/Action.js
import api from '@/config/api';
import * as types from './ActionTypes';

export const payOrder = ({ jwt, orderData, amount }) => async (dispatch) => {
  dispatch({ type: types.PAY_ORDER_REQUEST });
  try {
    // backend expects a CreateOrderRequest in body: { coinId, quantity, orderType }
    const response = await api.post('/api/orders/pay', orderData, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });

    dispatch({
      type: types.PAY_ORDER_SUCCESS,
      payload: response.data, // server returned the created Order
      amount, // if you need to use amount in reducer
    });

    console.log('order success', response.data);
    return response.data; // return for caller if they want to await/inspect
  } catch (error) {
    console.error('payOrder error', error?.response ?? error);
    dispatch({
      type: types.PAY_ORDER_FAILURE,
      error: error?.message ?? 'Unknown error',
    });
    throw error; // rethrow so caller can handle it if they awaited
  }
};

// export const getOrderById = (jwt, orderId) => async(dispatch) => {
//     dispatch({type: types.GET_ORDER_REQUEST});
//     try{
//         const response = await api.get(`/api/orders/${orderId}`, {
//             headers: {
//                 Authorization: `Bearer ${jwt}`
//             },
//         });
//         dispatch({
//             type: types.GET_ORDER_SUCCESS,
//             payload:response.data,
//         });
//     }
//     catch(error){
//         dispatch({
//             type: types.GET_ORDER_FAILURE,
//             error: error.message,
//         });
//     }
// };

export const getALLOrdersForUser = ({jwt, orderType, assetSymbol}) => async (dispatch) => {
    dispatch({ type: types.GET_ALL_ORDER_REQUEST});
    try{
        const response = await api.get('/api/orders', {
            headers:{
                Authorization:`Bearer ${jwt}`
            },
            params: {
                order_type: orderType,
                asset_symbol: assetSymbol,
            },
        });
        dispatch({
            type: types.GET_ALL_ORDER_SUCCESS,
            payload: response.data,

        });
        console.log("order success", response.data)
    }
    catch(error){
        console.log("error", error)
        dispatch({
            type: types.GET_ALL_ORDER_FAILURE,
            error:error.message,
        });
    }
};


