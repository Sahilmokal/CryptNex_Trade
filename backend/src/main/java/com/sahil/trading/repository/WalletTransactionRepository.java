package com.sahil.trading.repository;

import com.sahil.trading.entity.WalletTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Long> {

    Page<WalletTransaction> findByWalletId(Long walletId, Pageable pageable);
    void deleteByWalletId(Long walletId);

    List<WalletTransaction> findByWalletIdOrderByCreatedAtDesc(Long walletId);
}
