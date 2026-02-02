package com.sahil.trading.dto;

public class CreateUserRequest {
    private String fullName;
    private String email;
    private String password;
    private String phoneNo;
    private String role; // e.g. "ADMIN", "CUSTOMER", "MODERATOR" or "ROLE_ADMIN"

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getPhoneNo() { return phoneNo; }
    public void setPhoneNo(String phoneNo) { this.phoneNo = phoneNo; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
