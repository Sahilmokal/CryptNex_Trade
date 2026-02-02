package com.sahil.trading.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;


import java.math.BigDecimal;
import java.time.Instant;

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "wallet_transactions")
public class WalletTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // owning wallet (the wallet whose history this row belongs to)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wallet_id")
    @JsonBackReference
    private Wallet wallet;

    // optional counterparty wallet (for transfers)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "counterparty_wallet_id")
    @JsonIgnoreProperties({"transactions", "user", "hibernateLazyInitializer", "handler"})
    private Wallet counterpartyWallet;


    @Column(name = "amount", nullable = false, precision = 19, scale = 4)
    private Long amount;

    @Column(name = "type", length = 30)
    private String type; // e.g., "DEPOSIT", "WITHDRAWAL", "TRANSFER", "ORDER_PAYMENT"

    @Column(name = "status", length = 30)
    private String status; // e.g., "SUCCESS", "FAILED", "PENDING"

    @Column(name = "reference", length = 100)
    private String reference; // external id, order id, payment id etc.

    @Column(name = "notes", length = 500)
    private String notes;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    // getters & setters (generate these)
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Wallet getWallet() { return wallet; }
    public void setWallet(Wallet wallet) { this.wallet = wallet; }

    public Wallet getCounterpartyWallet() { return counterpartyWallet; }
    public void setCounterpartyWallet(Wallet counterpartyWallet) { this.counterpartyWallet = counterpartyWallet; }

    public Long getAmount() { return amount; }
    public void setAmount(Long amount) { this.amount = amount; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getReference() { return reference; }
    public void setReference(String reference) { this.reference = reference; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
