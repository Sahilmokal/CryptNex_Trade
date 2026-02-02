package com.sahil.trading.entity;

import com.sahil.trading.domain.VerificationType;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class ForgotPasswordToken {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private String id;

    @OneToOne
    private User user;

    private String Otp;

    private VerificationType verificationType;

    private String sendTo;
}
