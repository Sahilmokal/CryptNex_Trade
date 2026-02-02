package com.sahil.trading.repository;

import com.sahil.trading.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface  OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserId(Long userId);
}
