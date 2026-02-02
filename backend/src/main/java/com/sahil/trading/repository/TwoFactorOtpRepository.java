package com.sahil.trading.repository;

import com.sahil.trading.entity.TwoFactorOTP;
import com.sahil.trading.service.TwoFactorOtpService;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TwoFactorOtpRepository extends JpaRepository<TwoFactorOTP, String> {
    TwoFactorOTP findByUserId(Long userId);
}
