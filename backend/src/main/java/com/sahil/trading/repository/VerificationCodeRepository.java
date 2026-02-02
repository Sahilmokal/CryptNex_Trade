package com.sahil.trading.repository;

import com.sahil.trading.domain.VerificationType;
import com.sahil.trading.entity.VerificationCode;
import org.springframework.data.jpa.repository.JpaRepository;


public interface VerificationCodeRepository extends JpaRepository<VerificationCode, Long> {
    public VerificationCode findByUserId(Long userId);
}
