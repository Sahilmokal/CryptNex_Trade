package com.sahil.trading.config;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;

import javax.crypto.SecretKey;
import java.util.Collection;
import java.util.Date;
import java.util.stream.Collectors;

/**
 * JwtProvider - helper for creating and parsing JWTs.
 *
 * NOTE:
 * - Ensure JwtConstant.SECRET_KEY is at least 256 bits (32 bytes) for HS256.
 * - In production load the secret from env/config and rotate periodically.
 */
public class JwtProvider {

    private static final SecretKey key = Keys.hmacShaKeyFor(JwtConstant.SECRET_KEY.getBytes());

    // Token lifetime (ms) - 24 hours
    private static final long EXP_MS = 1000L * 60 * 60 * 24;

    /**
     * Generate a JWT from a Spring Authentication object.
     * Adds subject (username/email) and a "roles" claim containing comma-separated authorities.
     */
    public static String generateToken(Authentication auth) {
        Collection<? extends GrantedAuthority> authorities = auth.getAuthorities();
        String roles = authorities == null ? "" :
                authorities.stream()
                        .map(GrantedAuthority::getAuthority)
                        .distinct()
                        .collect(Collectors.joining(","));

        Date now = new Date();
        Date exp = new Date(now.getTime() + EXP_MS);

        return Jwts.builder()
                .setSubject(auth.getName())
                .claim("roles", roles)
                .setIssuedAt(now)
                .setExpiration(exp)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Parse token and return Jws<Claims>. Throws JwtException if invalid/expired.
     */
    public static Jws<Claims> parseToken(String token) throws JwtException {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token);
    }

    /**
     * Extract email/username from a full "Bearer ..." token string.
     * Caller may pass either full header value ("Bearer xxx") or raw token ("xxx").
     */
    public static String getEmailFromToken(String tokenOrBearer) throws JwtException {
        String raw = stripBearer(tokenOrBearer);
        Claims claims = parseToken(raw).getBody();
        return claims.getSubject();
    }

    /**
     * Return the roles claim (comma-separated string) or null if missing.
     */
    public static String getRolesFromToken(String tokenOrBearer) throws JwtException {
        String raw = stripBearer(tokenOrBearer);
        Claims claims = parseToken(raw).getBody();
        return claims.get("roles", String.class);
    }

    private static String stripBearer(String tokenOrBearer) {
        if (tokenOrBearer == null) return null;
        String t = tokenOrBearer.trim();
        if (t.toLowerCase().startsWith("bearer ")) {
            return t.substring(7).trim();
        }
        return t;
    }
}
