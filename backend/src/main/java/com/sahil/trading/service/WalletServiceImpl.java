package com.sahil.trading.service;

import com.sahil.trading.domain.OrderType;
import com.sahil.trading.entity.Order;
import com.sahil.trading.entity.User;
import com.sahil.trading.entity.Wallet;
import com.sahil.trading.entity.WalletTransaction;
import com.sahil.trading.repository.WalletRepository;
import com.sahil.trading.repository.WalletTransactionRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class WalletServiceImpl implements WalletService {

    private static final Logger log = LoggerFactory.getLogger(WalletServiceImpl.class);

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private WalletTransactionRepository walletTransactionRepository;

    @Override
    public Wallet getUserWallet(User user) {
        Wallet wallet = walletRepository.findByUserId(user.getId());
        if (wallet == null) {
            wallet = new Wallet();
            wallet.setUser(user);
            wallet.setBalance(BigDecimal.ZERO);
            walletRepository.save(wallet);
        }
        return wallet;
    }

    /**
     * Add money to wallet and save a deposit transaction.
     */
    @Override
    @Transactional
    public Wallet addBalance(Wallet wallet, Long money) {
        if (wallet.getBalance() == null) wallet.setBalance(BigDecimal.ZERO);

        BigDecimal newBalance = wallet.getBalance().add(BigDecimal.valueOf(money));
        wallet.setBalance(newBalance);
        Wallet saved = walletRepository.save(wallet);

        // record transaction (credit)
        WalletTransaction tx = new WalletTransaction();
        tx.setWallet(saved);
        tx.setAmount(money); // positive for deposit
        tx.setType("DEPOSIT");
        tx.setStatus("SUCCESS");
        tx.setReference(null);
        walletTransactionRepository.save(tx);

        log.info("[WalletService] deposit saved tx for walletId={} amount={}", saved.getId(), tx.getAmount());
        return saved;
    }

    @Override
    public Wallet findWalletById(Long id) throws Exception {
        Optional<Wallet> wallet = walletRepository.findById(id);
        if (wallet.isPresent()) {
            return wallet.get();
        }
        throw new Exception("wallet not found");
    }
    @Override
    public Wallet getWalletByUserId(Long userId) {
        return walletRepository.findByUserId(userId);
    }

    @Override
    public Wallet saveWallet(Wallet wallet) {
        return walletRepository.save(wallet);
    }

    @Override
    @Transactional
    public void debitWallet(Wallet wallet, Long amount) throws Exception {
        if (wallet == null) throw new Exception("Wallet is null");

        if (wallet.getBalance() == null) wallet.setBalance(BigDecimal.ZERO);

        BigDecimal amt = BigDecimal.valueOf(amount);

        if (wallet.getBalance().compareTo(amt) < 0) {
            throw new Exception("Insufficient balance");
        }
        BigDecimal newBalance = wallet.getBalance().subtract(amt);
        wallet.setBalance(newBalance);
        walletRepository.save(wallet);
    }

    /**
     * Return paginated wallet transactions for the user's wallet.
     */
    @Override
    public List<WalletTransaction> getWalletTransactions(User user, int page, int size) throws Exception {
        Wallet wallet = getUserWallet(user);
        if (wallet == null) {
            throw new Exception("Wallet not found for user");
        }
        PageRequest pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<WalletTransaction> pageRes = walletTransactionRepository.findByWalletId(wallet.getId(), pageable);
        return pageRes.getContent();
    }

    /**
     * Transfer money from sender to receiver. Saves both wallet updates and transaction rows.
     */
    @Override
    @Transactional
    public Wallet walletToWalletTransfer(User sender, Wallet receiverWallet, Long amount) throws Exception {
        Wallet senderWallet = getUserWallet(sender);
        if (senderWallet.getBalance().compareTo(BigDecimal.valueOf(amount)) < 0) {
            throw new Exception("Insufficient balance....");
        }

        // debit sender
        BigDecimal senderBalance = senderWallet.getBalance().subtract(BigDecimal.valueOf(amount));
        senderWallet.setBalance(senderBalance);

        // credit receiver (ensure not null)
        if (receiverWallet.getBalance() == null) receiverWallet.setBalance(BigDecimal.ZERO);
        BigDecimal receiverBalance = receiverWallet.getBalance().add(BigDecimal.valueOf(amount));
        receiverWallet.setBalance(receiverBalance);

        // Save both (within @Transactional so will commit together)
        walletRepository.save(senderWallet);
        walletRepository.save(receiverWallet);

        // record sender tx (debit)
        WalletTransaction debitTx = new WalletTransaction();
        debitTx.setWallet(senderWallet);
        debitTx.setCounterpartyWallet(receiverWallet);
        debitTx.setAmount(amount); // negative indicates debit
        debitTx.setType("TRANSFER_OUT");
        debitTx.setStatus("SUCCESS");
        walletTransactionRepository.save(debitTx);

        // record receiver tx (credit)
        WalletTransaction creditTx = new WalletTransaction();
        creditTx.setWallet(receiverWallet);
        creditTx.setCounterpartyWallet(senderWallet);
        creditTx.setAmount((amount)); // positive
        creditTx.setType("TRANSFER_IN");
        creditTx.setStatus("SUCCESS");
        walletTransactionRepository.save(creditTx);

        log.info("[WalletService] transfer completed: senderWalletId={} receiverWalletId={} amount={}",
                senderWallet.getId(), receiverWallet.getId(), amount);

        return senderWallet;
    }

    /**
     * Pay or credit order payment and record transaction.
     */
    @Override
    @Transactional
    public Wallet payOrderPayment(Order order, User user) throws Exception {
        Wallet wallet = getUserWallet(user);
        if (wallet.getBalance() == null) wallet.setBalance(BigDecimal.ZERO);

        if (order.getOrdertype().equals(OrderType.BUY)) {
            // ensure sufficient funds
            if (wallet.getBalance().compareTo(order.getPrice()) < 0) {
                throw new Exception("Insufficient funds for this transaction");
            }
            BigDecimal newBalance = wallet.getBalance().subtract(order.getPrice());
            wallet.setBalance(newBalance);

            // record order payment transaction (debit)
            WalletTransaction tx = new WalletTransaction();
            tx.setWallet(wallet);
            tx.setAmount(order.getPrice().longValue());
            tx.setType("ORDER_PAYMENT");
            tx.setStatus("SUCCESS");
            tx.setReference(String.valueOf(order.getId()));
            walletTransactionRepository.save(tx);

        } else {
            BigDecimal newBalance = wallet.getBalance().add(order.getPrice());
            wallet.setBalance(newBalance);

            WalletTransaction tx = new WalletTransaction();
            tx.setWallet(wallet);
            tx.setAmount(order.getPrice().longValue());
            tx.setType("ORDER_CREDIT");
            tx.setStatus("SUCCESS");
            tx.setReference(String.valueOf(order.getId()));
            walletTransactionRepository.save(tx);
        }
        walletRepository.save(wallet);
        log.info("[WalletService] order payment handled for orderId={} userId={}", order.getId(), user.getId());
        return wallet;
    }
}
