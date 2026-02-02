package com.sahil.trading.controller;

import com.sahil.trading.config.JwtProvider;
import com.sahil.trading.entity.TwoFactorOTP;
import com.sahil.trading.entity.User;
import com.sahil.trading.domain.UserRole;
import com.sahil.trading.repository.UserRepository;
import com.sahil.trading.response.AuthResponse;
import com.sahil.trading.service.CustomUserDetailsService;
import com.sahil.trading.service.EmailService;
import com.sahil.trading.service.TwoFactorOtpService;
import com.sahil.trading.service.WatchListService;
import com.sahil.trading.utils.OtpUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    @Autowired private UserRepository userRepository;
    @Autowired private CustomUserDetailsService customUserDetailsService;
    @Autowired private TwoFactorOtpService twoFactorOtpService;
    @Autowired private EmailService emailService;
    @Autowired private WatchListService watchListService;

    // --- Signup (safe) ---
    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> register(@RequestBody User user) {
        try {
            User isEmailExist = userRepository.findByEmail(user.getEmail());
            if (isEmailExist != null) {
                AuthResponse err = new AuthResponse();
                err.setMessage("Email already exists");
                err.setStatus(false);
                return new ResponseEntity<>(err, HttpStatus.CONFLICT);
            }

            User newUser = new User();
            newUser.setFullName(user.getFullName());
            newUser.setPassword(user.getPassword()); // IMPORTANT: encode in production
            newUser.setEmail(user.getEmail());
            newUser.setPhoneNo(user.getPhoneNo());
            User savedUser = userRepository.save(newUser);

            watchListService.createWatchList(savedUser);

            // build Authentication from UserDetails before generating JWT
            UserDetails userDetails = customUserDetailsService.loadUserByUsername(savedUser.getEmail());
            Authentication auth = new UsernamePasswordAuthenticationToken(
                    userDetails, userDetails.getPassword(), userDetails.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(auth);

            String jwt = JwtProvider.generateToken(auth);

            AuthResponse res = new AuthResponse();
            res.setJwt(jwt);
            res.setStatus(true);
            res.setIsTwoFactorAuthEnabled(false);
            res.setMessage("Registration successful");
            return new ResponseEntity<>(res, HttpStatus.CREATED);
        } catch (Exception ex) {
            log.error("register error:", ex);
            AuthResponse err = new AuthResponse();
            err.setMessage("Registration failed");
            err.setStatus(false);
            return new ResponseEntity<>(err, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // --- Login (user) ---
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody User user) {
        try {
            String userName = user.getEmail();
            String password = user.getPassword();
            if (userName == null || password == null) {
                AuthResponse err = new AuthResponse();
                err.setMessage("Email and password are required");
                err.setStatus(false);
                return new ResponseEntity<>(err, HttpStatus.BAD_REQUEST);
            }

            Authentication auth = authenticate(userName, password);
            SecurityContextHolder.getContext().setAuthentication(auth);

            // create Authentication with proper UserDetails principal
            UserDetails userDetails = customUserDetailsService.loadUserByUsername(userName);
            Authentication properAuth = new UsernamePasswordAuthenticationToken(
                    userDetails, userDetails.getPassword(), userDetails.getAuthorities());

            String jwt = JwtProvider.generateToken(properAuth);
            User authUser = userRepository.findByEmail(userName);

            // two-factor handling (defensive)
            if (user.getTwoFactorAuth() != null && user.getTwoFactorAuth().isEnabled()) {
                AuthResponse res = new AuthResponse();
                res.setMessage("Two factor auth is enabled");
                res.setIsTwoFactorAuthEnabled(true);
                String otp = OtpUtils.generateOtp();
                TwoFactorOTP oldTwoFactorOtp = twoFactorOtpService.findByUser(authUser.getId());
                if (oldTwoFactorOtp != null) {
                    twoFactorOtpService.deleteTwoFactorOtp(oldTwoFactorOtp);
                }
                TwoFactorOTP newTwoFactorOtp = twoFactorOtpService.createTwoFactorOtp(authUser, otp, jwt);
                emailService.sendVerificationOtpEmail(userName, otp);
                res.setSession(newTwoFactorOtp.getId());
                return new ResponseEntity<>(res, HttpStatus.ACCEPTED);
            }

            AuthResponse res = new AuthResponse();
            res.setJwt(jwt);
            res.setStatus(true);
            res.setMessage("Login successful");
            res.setIsTwoFactorAuthEnabled(false);
            return new ResponseEntity<>(res, HttpStatus.OK);

        } catch (BadCredentialsException bce) {
            AuthResponse err = new AuthResponse();
            err.setMessage("Invalid credentials");
            err.setStatus(false);
            return new ResponseEntity<>(err, HttpStatus.UNAUTHORIZED);
        } catch (Exception ex) {
            log.error("login exception:", ex);
            AuthResponse err = new AuthResponse();
            err.setMessage("Login failed due to server error");
            err.setStatus(false);
            return new ResponseEntity<>(err, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // --- Admin login endpoint (only admins allowed) ---
    @PostMapping("/admin/login")
    public ResponseEntity<AuthResponse> adminLogin(@RequestBody User user) {
        try {
            String email = user.getEmail();
            String password = user.getPassword();
            if (email == null || password == null) {
                AuthResponse err = new AuthResponse();
                err.setMessage("Email and password are required");
                err.setStatus(false);
                return new ResponseEntity<>(err, HttpStatus.BAD_REQUEST);
            }

            Authentication auth = authenticate(email, password);
            SecurityContextHolder.getContext().setAuthentication(auth);

            User dbUser = userRepository.findByEmail(email);
            if (dbUser == null) {
                AuthResponse err = new AuthResponse();
                err.setMessage("User not found");
                err.setStatus(false);
                return new ResponseEntity<>(err, HttpStatus.UNAUTHORIZED);
            }

            // check enum role
            if (dbUser.getUserRole() != UserRole.ROLE_ADMIN) {
                AuthResponse err = new AuthResponse();
                err.setMessage("Forbidden: not an admin");
                err.setStatus(false);
                return new ResponseEntity<>(err, HttpStatus.FORBIDDEN);
            }

            // generate token with proper principal
            UserDetails userDetails = customUserDetailsService.loadUserByUsername(dbUser.getEmail());
            Authentication properAuth = new UsernamePasswordAuthenticationToken(
                    userDetails, userDetails.getPassword(), userDetails.getAuthorities());
            String jwt = JwtProvider.generateToken(properAuth);

            AuthResponse res = new AuthResponse();
            res.setJwt(jwt);
            res.setStatus(true);
            res.setMessage("Admin login successful");
            res.setIsTwoFactorAuthEnabled(false);
            return new ResponseEntity<>(res, HttpStatus.OK);
        } catch (BadCredentialsException bce) {
            AuthResponse err = new AuthResponse();
            err.setMessage("Invalid credentials");
            err.setStatus(false);
            return new ResponseEntity<>(err, HttpStatus.UNAUTHORIZED);
        } catch (Exception ex) {
            log.error("adminLogin error:", ex);
            AuthResponse err = new AuthResponse();
            err.setMessage("Admin login failed");
            err.setStatus(false);
            return new ResponseEntity<>(err, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private Authentication authenticate(String userName, String password) {
        UserDetails userDetails = customUserDetailsService.loadUserByUsername(userName);
        if (userDetails == null) {
            throw new BadCredentialsException("Invalid username");
        }
        // Production: use PasswordEncoder.matches(raw, encoded)
        if (!password.equals(userDetails.getPassword())) {
            throw new BadCredentialsException("Invalid password");
        }
        return new UsernamePasswordAuthenticationToken(userDetails, password, userDetails.getAuthorities());
    }
}
