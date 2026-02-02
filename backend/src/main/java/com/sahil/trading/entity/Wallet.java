package com.sahil.trading.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Data
public class Wallet {

    // in Wallet.java
    @OneToMany(mappedBy = "wallet", fetch = FetchType.LAZY)
    @JsonManagedReference // pairs with @JsonBackReference on WalletTransaction.wallet
    private List<WalletTransaction> transactions;
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @OneToOne
    private User user;

    private BigDecimal balance= BigDecimal.ZERO;
}
