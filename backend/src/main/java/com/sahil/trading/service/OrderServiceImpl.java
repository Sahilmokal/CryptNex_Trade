package com.sahil.trading.service;

import com.sahil.trading.domain.OrderStatus;
import com.sahil.trading.domain.OrderType;
import com.sahil.trading.entity.*;
import com.sahil.trading.repository.OrderItemRepository;
import com.sahil.trading.repository.OrderRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderServiceImpl implements OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private WalletService walletService;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private AssetService assetService;

    @Override
    public Order createOrder(User user, OrderItem orderItem, OrderType orderType) {

        double price = orderItem.getCoin().getCurrentPrice() * orderItem.getQuantity();
        Order order = new Order();
        order.setUser(user);
        order.setOrderItem(orderItem);
        order.setOrdertype(orderType);
        order.setPrice(BigDecimal.valueOf(price));
        order.setTimestamp(LocalDateTime.now());
        order.setOrderStatus(OrderStatus.PENDING);
        return orderRepository.save(order);
    }

    @Override
    public Order getOrderById(Long orderId) throws Exception {
        return orderRepository.findById(orderId).orElseThrow(() -> new Exception("order not found"));
    }

    @Override
    public List<Order> getAllOrdersOfUser(Long userId, OrderType orderType, String assetSymbol) {
        return orderRepository.findByUserId(userId);
    }

    private OrderItem createOrderItem(Coin coin, double quantity, double buyPrice, double sellPrice) {
        OrderItem orderItem = new OrderItem();
        orderItem.setCoin(coin);
        orderItem.setQuantity(quantity);
        orderItem.setBuyPrice(buyPrice);
        orderItem.setSellPrice(sellPrice);
        return orderItemRepository.save(orderItem);
    }

    @Transactional
    public Order buyAsset(Coin coin, double quantity, User user) throws Exception {
        if (quantity <= 0) {
            throw new Exception("quantity should be > 0");
        }

        double buyPrice = coin.getCurrentPrice();
        OrderItem orderItem = createOrderItem(coin, quantity, buyPrice, 0);
        Order order = createOrder(user, orderItem, OrderType.BUY);
        orderItem.setOrder(order);

        // charge wallet for order
        walletService.payOrderPayment(order, user);

        order.setOrderStatus(OrderStatus.SUCCESS);
        order.setOrdertype(OrderType.BUY);
        Order savedOrder = orderRepository.save(order);

        // create or update asset using delta semantics:
        Asset oldAsset = assetService.findAssetByUserIdAndCoinId(order.getUser().getId(), order.getOrderItem().getCoin().getId());
        if (oldAsset == null) {
            // create with explicit buy price
            assetService.createAsset(user, orderItem.getCoin(), orderItem.getQuantity(), buyPrice);
        } else {
            // add quantity (delta) — updateAsset expects deltaQuantity
            assetService.updateAsset(oldAsset.getId(), quantity);
        }

        return savedOrder;
    }

    @Transactional
    public Order sellAsset(Coin coin, double quantity, User user) throws Exception {
        if (quantity <= 0) {
            throw new Exception("quantity should be > 0");
        }
        double sellPrice = coin.getCurrentPrice();

        Asset assetToSell = assetService.findAssetByUserIdAndCoinId(user.getId(), coin.getId());
        if (assetToSell == null) {
            throw new Exception("Insufficient quantity to sell");
        }

        double buyPrice = assetToSell.getBuyPrice();

        // ensure enough quantity
        if (assetToSell.getQuantity() < quantity) {
            throw new Exception("Insufficient quantity to sell");
        }

        OrderItem orderItem = createOrderItem(coin, quantity, buyPrice, sellPrice);
        Order order = createOrder(user, orderItem, OrderType.SELL);
        orderItem.setOrder(order);

        // mark success & save order before payment
        order.setOrderStatus(OrderStatus.SUCCESS);
        order.setOrdertype(OrderType.SELL);
        Order savedOrder = orderRepository.save(order);

        // credit wallet for sale
        walletService.payOrderPayment(order, user);

        // subtract quantity using delta (negative value)
        Asset updatedAsset = assetService.updateAsset(assetToSell.getId(), -quantity);

        // assetService.updateAsset may return null if it deleted the asset (quantity <= 0)
        if (updatedAsset == null) {
            // asset removed already
        } else {
            // if very small remaining value, delete (optional)
            if (updatedAsset.getQuantity() * coin.getCurrentPrice() <= 1) {
                assetService.deleteAsset(updatedAsset.getId());
            }
        }

        return savedOrder;
    }

    @Override
    @Transactional
    public Order processOrder(Coin coin, double quantity, OrderType orderType, User user) throws Exception {

        if (orderType.equals(OrderType.BUY)) {
            return buyAsset(coin, quantity, user);
        } else if (orderType.equals(OrderType.SELL)) {
            return sellAsset(coin, quantity, user);
        }
        throw new Exception("invalid order type");
    }
}
