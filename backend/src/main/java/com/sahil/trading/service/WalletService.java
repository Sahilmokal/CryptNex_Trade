package com.sahil.trading.service;

import com.sahil.trading.entity.Order;
import com.sahil.trading.entity.User;
import com.sahil.trading.entity.Wallet;
import com.sahil.trading.entity.WalletTransaction;

import java.util.List;

public interface WalletService {
    Wallet getUserWallet(User user);

    Wallet addBalance(Wallet wallet, Long money);

    Wallet findWalletById(Long id) throws Exception;
    List<WalletTransaction> getWalletTransactions(User user, int page, int size) throws Exception;
    Wallet walletToWalletTransfer(User sender, Wallet receiverWallet,Long amount) throws Exception;

    Wallet payOrderPayment(Order order, User user) throws Exception;

    Wallet getWalletByUserId(Long userId);
    Wallet saveWallet(Wallet wallet);
    // optional:
    void debitWallet(Wallet wallet, Long amount) throws Exception;


}
