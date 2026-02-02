// src/main/java/com/sahil/trading/controller/WithdrawalController.java
package com.sahil.trading.controller;

import com.sahil.trading.domain.UserRole;
import com.sahil.trading.entity.User;
import com.sahil.trading.entity.Withdrawal;
import com.sahil.trading.service.UserService;
import com.sahil.trading.service.WithdrawalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping
public class WithdrawalController {

    @Autowired
    private WithdrawalService withdrawalService;

    @Autowired
    private UserService userService;

    @PostMapping("/api/withdrawal/{amount}")
    public ResponseEntity<?> withdrawalRequest(
            @PathVariable Long amount,
            @RequestHeader("Authorization") String jwt) throws Exception {
        User user = userService.findUserProfileByJwt(jwt);
        Withdrawal withdrawal = withdrawalService.requestWithdrawal(amount, user);
        // DO NOT change wallet balance here
        return new ResponseEntity<>(withdrawal, HttpStatus.CREATED);
    }

    @PatchMapping("/api/admin/withdrawal/{id}/proceed/{accept}")
    public ResponseEntity<?> proceedWithdrawal(
            @PathVariable Long id,
            @PathVariable boolean accept,
            @RequestHeader("Authorization") String jwtHeader) throws Exception {

        User adminUser = userService.findUserProfileByJwt(jwtHeader);
        if (adminUser == null) {
            return new ResponseEntity<>("Invalid token", HttpStatus.UNAUTHORIZED);
        }
        if (adminUser.getUserRole() != com.sahil.trading.domain.UserRole.ROLE_ADMIN) {
            return new ResponseEntity<>("Forbidden: requires admin", HttpStatus.FORBIDDEN);
        }

        Withdrawal updated = withdrawalService.proceedWithdrawal(id, accept, adminUser);
        return new ResponseEntity<>(updated, HttpStatus.OK);
    }

    @GetMapping("/api/withdrawal")
    public ResponseEntity<List<Withdrawal>> getWithdrawalHistory(
            @RequestHeader("Authorization") String jwt) throws Exception{
        User user = userService.findUserProfileByJwt(jwt);
        List<Withdrawal> withdrawals = withdrawalService.getUserWithdrawalHistory(user);
        return  new ResponseEntity<>(withdrawals, HttpStatus.OK);
    }

    @GetMapping("/api/admin/withdrawal")
    public ResponseEntity<List<Withdrawal>> getAllWithdrawalRequest(
            @RequestHeader("Authorization") String jwt) throws Exception {
        User user = userService.findUserProfileByJwt(jwt);
        List<Withdrawal> withdrawals = withdrawalService.getAllWithdrawalRequest();
        return  new ResponseEntity<>(withdrawals, HttpStatus.OK);
    }
}
