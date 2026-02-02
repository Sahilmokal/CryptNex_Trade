package com.sahil.trading.service;

import com.sahil.trading.entity.User;
import com.sahil.trading.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User u = userRepository.findByEmail(email);
        if (u == null) {
            throw new UsernameNotFoundException("User not found");
        }

        // Map enum userRole to a single authority string, e.g. "ROLE_ADMIN" or "ROLE_CUSTOMER"
        String roleName = u.getUserRole() != null ? u.getUserRole().name() : "ROLE_CUSTOMER";
        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(roleName));

        return new org.springframework.security.core.userdetails.User(
                u.getEmail(),
                u.getPassword(),
                authorities
        );
    }
}
