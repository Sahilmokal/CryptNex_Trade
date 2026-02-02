package com.sahil.trading.service;

import com.sahil.trading.domain.OrderType;
import com.sahil.trading.entity.Coin;
import com.sahil.trading.entity.Order;
import com.sahil.trading.entity.OrderItem;
import com.sahil.trading.entity.User;

import java.util.List;

public interface OrderService {
    Order createOrder(User user, OrderItem orderItem, OrderType orderType);
    Order getOrderById(Long orderId) throws Exception;
    List<Order> getAllOrdersOfUser(Long userId, OrderType OrderType, String assetSymbol);

    Order processOrder(Coin coin , double quantity, OrderType orderType, User user) throws Exception;

}
