package com.sahil.trading.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * JwtTokenValidator - filter that validates incoming JWT and sets Authentication in the SecurityContext.
 *
 * Behaviour:
 * - Skips validation for paths under /auth/** (so login/signup work).
 * - If Authorization header is present, it attempts to parse it. On invalid token it returns 401 JSON.
 * - If token valid, it sets a UsernamePasswordAuthenticationToken with username and authorities.
 *
 * Note: You can adapt shouldNotFilter() logic to skip other public endpoints as needed.
 */


public class JwtTokenValidator extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtTokenValidator.class);

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        // skip auth endpoints (adjust as necessary)
        return path.startsWith("/auth")
                || path.startsWith("/api/users/verification")
                || path.startsWith("/api/users/enable-two-factor");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String header = request.getHeader(JwtConstant.JWT_HEADER);

        if (header == null || header.isBlank()) {
            // no token present — continue (anonymous)
            filterChain.doFilter(request, response);
            return;
        }

        // ensure header starts with Bearer
        if (!header.toLowerCase().startsWith("bearer ")) {
            sendUnauthorized(response, "Invalid Authorization header");
            return;
        }

        String token = header.substring(7).trim();
        try {
            Jws<Claims> jws = JwtProvider.parseToken(token);
            Claims body = jws.getBody();

            String username = body.getSubject();
            String rolesStr = body.get("roles", String.class); // may be null or empty

            List<SimpleGrantedAuthority> authorities = List.of();
            if (rolesStr != null && !rolesStr.isBlank()) {
                authorities = Arrays.stream(rolesStr.split(","))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .map(SimpleGrantedAuthority::new)
                        .collect(Collectors.toList());
            }

            if (username != null) {
                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(username, null, authorities);
                SecurityContextHolder.getContext().setAuthentication(auth);
            }

            filterChain.doFilter(request, response);
        } catch (JwtException ex) {
            log.warn("Invalid or expired JWT: {}", ex.getMessage());
            // respond 401 with JSON - prevents downstream handlers from executing
            sendUnauthorized(response, "Invalid or expired token");
        } catch (Exception ex) {
            log.error("JWT validation error", ex);
            sendUnauthorized(response, "Token validation error");
        }
    }

    private void sendUnauthorized(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        String body = String.format("{\"error\":\"%s\"}", message.replace("\"", "\\\""));
        response.getWriter().write(body);
    }
}
