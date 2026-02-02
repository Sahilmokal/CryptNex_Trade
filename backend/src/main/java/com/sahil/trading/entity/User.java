package com.sahil.trading.entity;


import com.fasterxml.jackson.annotation.JsonProperty;
import com.sahil.trading.domain.UserRole;
import jakarta.persistence.*;
import lombok.Data;
@Entity
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    private String phoneNo;
    private String fullName;
    private String email;
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    @Embedded
    private TwoFactorAuth  twoFactorAuth= new TwoFactorAuth();
    private UserRole userRole = UserRole.ROLE_CUSTOMER;
}
