package com.sahil.trading.entity;


import com.sahil.trading.domain.VerificationType;
import jakarta.persistence.Entity;
import lombok.Data;


@Data
public class TwoFactorAuth {

    private boolean isEnabled = false;
    private VerificationType sendTo;


}
