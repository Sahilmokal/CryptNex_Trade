package com.sahil.trading.controller;

import com.sahil.trading.dto.CreateUserRequest;
import com.sahil.trading.entity.User;
import com.sahil.trading.domain.UserRole;
import com.sahil.trading.entity.Wallet;
import com.sahil.trading.repository.*;
import com.sahil.trading.response.AuthResponse;
import com.sahil.trading.service.WatchListService;

import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Locale;
import java.util.Optional;

@RestController
@RequestMapping("/admin/users")
public class AdminUserController {

    private static final Logger log = LoggerFactory.getLogger(AdminUserController.class);

    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private WatchListService watchListService;

    @Autowired
    private WalletTransactionRepository walletTransactionRepository;

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private WithdrawalRepository withdrawalRepository;

    @Autowired
    private WatchListRepository watchListRepository;


    // --------------------------------------------------------
    // 1) CREATE USER (POST /admin/users)
    // --------------------------------------------------------
    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody CreateUserRequest req) {
        try {
            // required fields
            if (req.getEmail() == null || req.getPassword() == null || req.getFullName() == null) {
                AuthResponse err = new AuthResponse();
                err.setMessage("fullName, email and password are required");
                err.setStatus(false);
                return new ResponseEntity<>(err, HttpStatus.BAD_REQUEST);
            }

            // ADMIN CHECK
            Authentication caller = SecurityContextHolder.getContext().getAuthentication();
            if (caller == null || !caller.isAuthenticated() ||
                    caller.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals(UserRole.ROLE_ADMIN.name()))) {
                AuthResponse err = new AuthResponse();
                err.setMessage("Forbidden: admin role required");
                err.setStatus(false);
                return new ResponseEntity<>(err, HttpStatus.FORBIDDEN);
            }

            // uniqueness check
            String normalizedEmail = req.getEmail().toLowerCase(Locale.ROOT).trim();
            User existing = userRepository.findByEmail(normalizedEmail);
            if (existing != null) {
                AuthResponse err = new AuthResponse();
                err.setMessage("Email already exists");
                err.setStatus(false);
                return new ResponseEntity<>(err, HttpStatus.CONFLICT);
            }

            // build user
            User user = new User();
            user.setFullName(req.getFullName());
            user.setEmail(normalizedEmail);
            user.setPhoneNo(req.getPhoneNo());
            user.setPassword(passwordEncoder.encode(req.getPassword()));

            // role handling
            if (req.getRole() != null && !req.getRole().isBlank()) {
                String raw = req.getRole().trim().toUpperCase(Locale.ROOT);
                if (!raw.startsWith("ROLE_")) raw = "ROLE_" + raw;
                try {
                    user.setUserRole(UserRole.valueOf(raw));
                } catch (Exception ex) {
                    AuthResponse err = new AuthResponse();
                    err.setMessage("Invalid role");
                    err.setStatus(false);
                    return new ResponseEntity<>(err, HttpStatus.BAD_REQUEST);
                }
            } else {
                user.setUserRole(UserRole.ROLE_CUSTOMER);
            }

            User saved = userRepository.save(user);

            // create default watchlist (non-blocking)
            try {
                watchListService.createWatchList(saved);
            } catch (Exception ex) {
                log.warn("Could not create watchlist for {}: {}", saved.getEmail(), ex.getMessage());
            }

            // response
            AuthResponse res = new AuthResponse();
            res.setStatus(true);
            res.setMessage("User created");

            // optional userId setter if exists
            try { res.getClass().getMethod("setUserId", Long.class).invoke(res, saved.getId()); } catch (Exception ignore) {}

            return new ResponseEntity<>(res, HttpStatus.CREATED);

        } catch (Exception ex) {
            log.error("createUser error:", ex);
            AuthResponse err = new AuthResponse();
            err.setMessage("Failed to create user");
            err.setStatus(false);
            return new ResponseEntity<>(err, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }



    // --------------------------------------------------------
    // 2) LIST USERS (GET /admin/users)
    // --------------------------------------------------------
    @GetMapping
    public ResponseEntity<?> listUsers() {
        try {
            Authentication caller = SecurityContextHolder.getContext().getAuthentication();
            if (caller == null || !caller.isAuthenticated() ||
                    caller.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals(UserRole.ROLE_ADMIN.name()))) {
                return new ResponseEntity<>("Forbidden: admin required", HttpStatus.FORBIDDEN);
            }

            List<User> users = userRepository.findAll();
            return new ResponseEntity<>(users, HttpStatus.OK);

        } catch (Exception ex) {
            log.error("List users failed:", ex);
            return new ResponseEntity<>("Failed to fetch users", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }



    // --------------------------------------------------------
    // 3) UPDATE USER (PATCH /admin/users/{id})
    // --------------------------------------------------------
    @PatchMapping("/{id}")
    public ResponseEntity<?> updateUser(
            @PathVariable Long id,
            @RequestBody User payload) {
        try {
            Authentication caller = SecurityContextHolder.getContext().getAuthentication();
            if (caller == null || !caller.isAuthenticated() ||
                    caller.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals(UserRole.ROLE_ADMIN.name()))) {
                return new ResponseEntity<>("Forbidden: admin required", HttpStatus.FORBIDDEN);
            }

            Optional<User> opt = userRepository.findById(id);
            if (opt.isEmpty()) return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);

            User u = opt.get();

            if (payload.getFullName() != null) u.setFullName(payload.getFullName());
            if (payload.getPhoneNo() != null) u.setPhoneNo(payload.getPhoneNo());

            if (payload.getUserRole() != null) {
                u.setUserRole(payload.getUserRole());
            }

            User saved = userRepository.save(u);
            return new ResponseEntity<>(saved, HttpStatus.OK);

        } catch (Exception ex) {
            log.error("updateUser error:", ex);
            return new ResponseEntity<>("Failed to update user", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }



    // --------------------------------------------------------
    // 4) DELETE USER (DELETE /admin/users/{id})
    // --------------------------------------------------------
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {

        Authentication caller = SecurityContextHolder.getContext().getAuthentication();
        if (caller == null || !caller.isAuthenticated() ||
                caller.getAuthorities().stream().noneMatch(
                        a -> a.getAuthority().equals(UserRole.ROLE_ADMIN.name()))) {

            return new ResponseEntity<>("Forbidden: admin required", HttpStatus.FORBIDDEN);
        }

        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);
        }

        try {
            // 1. Delete wallet transactions
            Wallet wallet = walletRepository.findByUserId(user.getId());
            if (wallet != null) {
                walletTransactionRepository.deleteByWalletId(wallet.getId());
            }

            // 2. Delete withdrawals
            withdrawalRepository.deleteByUserId(user.getId());

            // 3. Delete watchlist
            watchListRepository.deleteByUserId(user.getId());

            // 4. Delete wallet
            if (wallet != null) {
                walletRepository.delete(wallet);
            }

            // 5. Finally delete user
            userRepository.delete(user);

            return ResponseEntity.noContent().build();

        } catch (Exception e) {
            return new ResponseEntity<>("Failed to delete user: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
