package com.sahil.trading.controller;

import com.sahil.trading.request.ForgotPasswordTokenRequest;
import com.sahil.trading.domain.VerificationType;
import com.sahil.trading.entity.ForgotPasswordToken;
import com.sahil.trading.entity.User;
import com.sahil.trading.entity.VerificationCode;
import com.sahil.trading.request.ResetPasswordRequest;
import com.sahil.trading.response.ApiResponse;
import com.sahil.trading.response.AuthResponse;
import com.sahil.trading.service.EmailService;
import com.sahil.trading.service.ForgotPasswordService;
import com.sahil.trading.service.UserService;
import com.sahil.trading.service.VerificationCodeService;
import com.sahil.trading.utils.OtpUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
public class UserController {
    @Autowired
    private UserService userService;

    @Autowired
    private VerificationCodeService verificationCodeService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private ForgotPasswordService forgotPasswordService;

    @GetMapping("/api/users/profile")
    public ResponseEntity<User> getUserProfile(@RequestHeader("Authorization") String Jwt) throws Exception {
        User user = userService.findUserProfileByJwt(Jwt);
        return  new ResponseEntity<User>(user, HttpStatus.OK);

    }
    @PatchMapping("/api/users/verification/{verificationType}/send-otp")
    public ResponseEntity<String> sendVerificationOtp(
            @RequestHeader("Authorization") String jwt,
            @PathVariable VerificationType verificationType
    ) throws Exception {

        User user = userService.findUserProfileByJwt(jwt);

        VerificationCode verificationCode =
                verificationCodeService.getVerificationCodeByUser(user.getId());

        // ✅ If exists → delete old OTP
        if (verificationCode != null) {
            verificationCodeService.deleteVerificationCodebyId(verificationCode);
        }

        // ✅ Always generate fresh OTP
        verificationCode =
                verificationCodeService.sendVerificationCode(user, verificationType);

        if (verificationType.equals(VerificationType.EMAIL)) {
            emailService.sendVerificationOtpEmail(
                    user.getEmail(),
                    verificationCode.getOtp()
            );
        }

        return ResponseEntity.ok("Verification OTP sent successfully");
    }




    @PatchMapping("/api/users/enable-two-factor/verify-otp/{otp}")
    public ResponseEntity<User> enableTwoFactorAuthentication(@RequestHeader("Authorization") String jwt,
                                                              @PathVariable String otp) throws Exception {
        User user = userService.findUserProfileByJwt(jwt);
        VerificationCode verificationCode = verificationCodeService.getVerificationCodeByUser(user.getId());
        String sendTo = verificationCode.getVerificationType().equals(VerificationType.EMAIL)?
                verificationCode.getEmail():verificationCode.getMobile();
        boolean isVerified= verificationCode.getOtp().equals(otp);
        if(isVerified){
            User updatedUser = userService.enableTwoFactorAuthentication(verificationCode.getVerificationType(), sendTo, user);
            verificationCodeService.deleteVerificationCodebyId(verificationCode);
            return  new ResponseEntity<>(updatedUser, HttpStatus.OK);

        }

        throw new Exception("wrong otp");

    }
    @PatchMapping("/auth/users/reset-password/send-otp")
    public ResponseEntity<AuthResponse> sendForgotPasswordOtp(
                                                        @RequestBody ForgotPasswordTokenRequest req)
            throws Exception {

        User user = userService.findUserByEmail(req.getSendTo());
        String otp = OtpUtils.generateOtp();
        UUID uuid = UUID.randomUUID();
        String id = uuid.toString();

        ForgotPasswordToken token =  forgotPasswordService.findByUser(user.getId());

        if(token == null){
            token = forgotPasswordService.createToken(user, id, otp, req.getVerificationType(),req.getSendTo());
        }
        if(req.getVerificationType().equals(VerificationType.EMAIL)){
            emailService.sendVerificationOtpEmail(user.getEmail(), token.getOtp());
        }
        AuthResponse response = new AuthResponse();
        response.setSession(token.getId());
        response.setMessage("password reset otp sent successfully");
        return  new ResponseEntity<>(response, HttpStatus.OK);

    }
    @PatchMapping("/auth/users/reset-password/verify-otp")
    public ResponseEntity<ApiResponse> resetPassword(
            @RequestParam String id,
            @RequestBody ResetPasswordRequest req,
            @RequestHeader("Authorization") String jwt)
                                                              throws Exception {

        ForgotPasswordToken forgotPasswordToken= forgotPasswordService.findById(id);
;
        boolean isVerified = forgotPasswordToken.getOtp().equals(req.getOtp());
        if(isVerified) {
            userService.updatePassword(forgotPasswordToken.getUser(), req.getPassword());
            ApiResponse res = new ApiResponse();
            res.setMessage("Password updated successfully");
            return new ResponseEntity<>(res, HttpStatus.ACCEPTED);
        }
        throw new Exception("incorrect otp");
    }

}
