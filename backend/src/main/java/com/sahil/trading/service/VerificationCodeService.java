package com.sahil.trading.service;

import com.sahil.trading.domain.VerificationType;
import com.sahil.trading.entity.User;
import com.sahil.trading.entity.VerificationCode;

public interface VerificationCodeService {
    VerificationCode sendVerificationCode(User user, VerificationType verificationType);

    VerificationCode getVerificationCodeById(Long id) throws Exception;

    VerificationCode getVerificationCodeByUser(Long userId) throws Exception;

    void deleteVerificationCodebyId(VerificationCode verificationCode);
}
