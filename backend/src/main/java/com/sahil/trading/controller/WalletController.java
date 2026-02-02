package com.sahil.trading.controller;


import com.sahil.trading.domain.PaymentMethod;
import com.sahil.trading.entity.*;
import com.sahil.trading.response.PaymentResponse;
import com.sahil.trading.service.OrderService;
import com.sahil.trading.service.PaymentService;
import com.sahil.trading.service.UserService;
import com.sahil.trading.service.WalletService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController

public class WalletController  {

    @Autowired
    private WalletService walletService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserService userService;

    @Autowired
    private PaymentService paymentService;

    @GetMapping("/api/wallet")
    public ResponseEntity<Wallet> getUserWallet(@RequestHeader("Authorization") String jwt) throws Exception {
        User user = userService.findUserProfileByJwt(jwt);
        Wallet wallet = walletService.getUserWallet(user);
        return  new ResponseEntity<>(wallet, HttpStatus.ACCEPTED);
    }

    @PutMapping("/api/wallet/{walletId}/transfer")
    public  ResponseEntity<Wallet> walletToWalletTransfer(@RequestHeader("Authorization") String jwt, @PathVariable Long walletId, @RequestBody WalletTransaction req) throws Exception{
        User senderUser = userService.findUserProfileByJwt(jwt);
        Wallet receiverWallet = walletService.findWalletById(walletId);
        Wallet wallet = walletService.walletToWalletTransfer(senderUser, receiverWallet, req.getAmount());

        return new ResponseEntity<>(wallet, HttpStatus.ACCEPTED);
    }
    @PutMapping("/api/wallet/order/{orderId}/pay")
    public  ResponseEntity<Wallet> payOrderPayment(@RequestHeader("Authorization") String jwt, @PathVariable Long orderId) throws Exception{
        User user = userService.findUserProfileByJwt(jwt);
        Order order = orderService.getOrderById(orderId);
        Wallet wallet = walletService.payOrderPayment(order, user);
        return new ResponseEntity<>(wallet, HttpStatus.ACCEPTED);
    }
    @GetMapping("/api/wallet/transactions")
    public ResponseEntity<List<WalletTransaction>> getWalletTransactions(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(name = "page", required = false, defaultValue = "0") int page,
            @RequestParam(name = "size", required = false, defaultValue = "50") int size
    ) throws Exception {

        User user = userService.findUserProfileByJwt(jwt);
        List<WalletTransaction> transactions = walletService.getWalletTransactions(user, page, size);

        return new ResponseEntity<>(transactions, HttpStatus.OK);
    }
    @PutMapping("/api/wallet/deposit")
    public ResponseEntity<?> deposit(
            @RequestParam Long order_id,
            @RequestParam(required = false) String payment_id,
            @RequestHeader("Authorization") String jwt
    ) throws Exception {

        User user = userService.findUserProfileByJwt(jwt);
        PaymentOrder order = paymentService.getOrderPaymentById(order_id);

        // 🔹 Stripe does NOT send payment_id
        if (order.getPaymentMethod() == PaymentMethod.STRIPE) {
            paymentService.proceedPaymentOrder(order, null);
        } else {
            // Razorpay needs payment_id
            paymentService.proceedPaymentOrder(order, payment_id);
        }

        walletService.addBalance(walletService.getUserWallet(user), order.getAmount());

        return ResponseEntity.ok("Wallet credited successfully");
    }



}
