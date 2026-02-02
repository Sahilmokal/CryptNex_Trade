package com.sahil.trading.entity;

import com.sahil.trading.domain.VerificationType;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class VerificationCode {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long Id;
    private String Otp;

    @OneToOne
    private User user;

    private String email;
    private String mobile;
    private VerificationType verificationType;
}
