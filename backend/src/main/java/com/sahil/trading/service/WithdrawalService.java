// src/main/java/com/sahil/trading/service/WithdrawalService.java
package com.sahil.trading.service;

import com.sahil.trading.entity.User;
import com.sahil.trading.entity.Withdrawal;

import java.util.List;

public interface WithdrawalService {
    Withdrawal requestWithdrawal(Long amount, User user);
    Withdrawal proceedWithdrawal(Long withdrawalId, boolean accept, User adminUser) throws Exception;
    List<Withdrawal> getUserWithdrawalHistory(User user);
    List<Withdrawal> getAllWithdrawalRequest();
}
