// src/main/java/com/sahil/trading/service/WithdrawalServiceImpl.java
package com.sahil.trading.service;

import com.sahil.trading.domain.WithdrawalStatus;
import com.sahil.trading.domain.WalletTransactionType;
import com.sahil.trading.entity.User;
import com.sahil.trading.entity.Wallet;
import com.sahil.trading.entity.WalletTransaction;
import com.sahil.trading.entity.Withdrawal;
import com.sahil.trading.repository.WalletRepository;
import com.sahil.trading.repository.WithdrawalRepository;
import com.sahil.trading.repository.WalletTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class WithdrawalServiceImpl implements WithdrawalService {

    @Autowired
    private WithdrawalRepository withdrawalRepository;

    @Autowired
    private WalletService walletService;

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private WalletTransactionRepository walletTransactionRepository;

    @Override
    public Withdrawal requestWithdrawal(Long amount, User user) {
        Withdrawal withdrawal = new Withdrawal();
        withdrawal.setAmount(amount);
        withdrawal.setUser(user);
        withdrawal.setStatus(WithdrawalStatus.PENDING);
        return withdrawalRepository.save(withdrawal);
    }

    @Override
    @Transactional
    public Withdrawal proceedWithdrawal(Long withdrawalId, boolean accept, User adminUser) throws Exception {
        Optional<Withdrawal> opt = withdrawalRepository.findById(withdrawalId);
        if (opt.isEmpty()) {
            throw new Exception("Withdrawal not found");
        }

        Withdrawal w = opt.get();

        // only process pending withdrawals
        if (w.getStatus() != WithdrawalStatus.PENDING) {
            throw new Exception("Withdrawal already processed");
        }

        w.setDate(LocalDateTime.now());

        if (accept) {
            // get the user's wallet (creates one if missing in your getUserWallet())
            Wallet wallet = walletService.getUserWallet(w.getUser());
            if (wallet == null) {
                throw new Exception("User wallet not found");
            }

            // amount as BigDecimal
            BigDecimal amt = BigDecimal.valueOf(w.getAmount());

            // check balance
            if (wallet.getBalance() == null || wallet.getBalance().compareTo(amt) < 0) {
                throw new Exception("Insufficient wallet balance");
            }

            // debit wallet
            BigDecimal newBalance = wallet.getBalance().subtract(amt);
            wallet.setBalance(newBalance);
            walletRepository.save(wallet); // if walletService.saveWallet exists you can call that

            // create wallet transaction (withdrawal)
            WalletTransaction tx = new WalletTransaction();
            tx.setWallet(wallet);
            tx.setAmount(w.getAmount()); // keep Long as you use elsewhere
            tx.setType("WITHDRAWAL");    // matches style in your service (strings used like "DEPOSIT")
            tx.setStatus("SUCCESS");
            tx.setReference("withdrawal:" + w.getId());
            tx.setCounterpartyWallet(null);
            tx.setCreatedAt(Instant.now());// use field name your entity has (createdAt/date)
            walletTransactionRepository.save(tx);

            w.setStatus(WithdrawalStatus.SUCCESS);
        } else {
            // mark rejected
            w.setStatus(WithdrawalStatus.DECLINE);
        }

        // optionally: set processedBy / processedAt if Withdrawal entity has fields
        // w.setProcessedBy(adminUser);
        // w.setProcessedAt(LocalDateTime.now());

        return withdrawalRepository.save(w);
    }


    @Override
    public List<Withdrawal> getUserWithdrawalHistory(User user) {
        return withdrawalRepository.findByUserId(user.getId());
    }

    @Override
    public List<Withdrawal> getAllWithdrawalRequest() {
        return withdrawalRepository.findAll();
    }
}
