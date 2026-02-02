package com.sahil.trading.service;

import com.sahil.trading.entity.TwoFactorOTP;
import com.sahil.trading.entity.User;

public interface TwoFactorOtpService {
    TwoFactorOTP createTwoFactorOtp(User user, String otp , String jwt);
    TwoFactorOTP findByUser(Long userId);
    TwoFactorOTP findById(String id);

    boolean verifyTwoFactorOtp(TwoFactorOTP twoFactorOTP, String otp);
    void deleteTwoFactorOtp(TwoFactorOTP twoFactorOTP);
}
