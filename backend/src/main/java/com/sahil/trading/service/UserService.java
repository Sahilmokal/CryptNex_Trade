package com.sahil.trading.service;

import com.sahil.trading.domain.VerificationType;
import com.sahil.trading.entity.User;

public interface UserService {
    public User findUserProfileByJwt(String jwt) throws Exception;
    public User findUserByEmail(String email) throws Exception;
    public User findUserByUsername(String username);
    public User findUserById(Long userId) throws Exception;
    public User enableTwoFactorAuthentication(VerificationType verificationType,  String sendTo,User user);
    User updatePassword(User user, String newPassword);

}
