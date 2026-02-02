package com.sahil.trading.repository;

import com.sahil.trading.entity.PaymentDetails;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentDetailsRepository extends JpaRepository<PaymentDetails, Long> {

    PaymentDetails findByUserId(Long userId);

}
