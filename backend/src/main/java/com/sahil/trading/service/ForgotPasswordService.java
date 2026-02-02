package com.sahil.trading.service;

import com.sahil.trading.domain.VerificationType;
import com.sahil.trading.entity.ForgotPasswordToken;
import com.sahil.trading.entity.User;
import com.sahil.trading.entity.VerificationCode;

public interface ForgotPasswordService {

    ForgotPasswordToken createToken(User user, String id , String otp, VerificationType verificationType, String sendTo);
    ForgotPasswordToken findById(String id);
    ForgotPasswordToken findByUser(Long userId);

    void deleteToken(ForgotPasswordToken token);

}
