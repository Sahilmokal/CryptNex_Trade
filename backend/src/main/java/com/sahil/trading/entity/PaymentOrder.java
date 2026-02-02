package com.sahil.trading.entity;

import com.sahil.trading.domain.PaymentMethod;
import com.sahil.trading.domain.PaymentOrderStatus;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class PaymentOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private  Long id;

    private Long amount;
    private PaymentOrderStatus status;
    private PaymentMethod paymentMethod;

    @ManyToOne
    private User user;
}
