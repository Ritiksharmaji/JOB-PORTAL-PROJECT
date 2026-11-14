package com.jobportal.jwt;

import java.util.Date;
import java.util.Map;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

/**
 * Issues and checks the same HS512 tokens as the monolith (same library version and claims: id, name,
 * accountType, profileId; subject = email), so the frontend's token handling is unchanged.
 */
public class JwtTokens {

	public static final long VALIDITY_MS = 36_000_000; // 10 hours, as in the monolith

	private final String secret;

	public JwtTokens(String secret) {
		this.secret = secret;
	}

	@SuppressWarnings("deprecation")
	public String issue(String subject, Map<String, Object> claims) {
		long now = System.currentTimeMillis();
		return Jwts.builder().setClaims(claims).setSubject(subject).setIssuedAt(new Date(now))
				.setExpiration(new Date(now + VALIDITY_MS)).signWith(SignatureAlgorithm.HS512, secret).compact();
	}

	/** Valid, unexpired token's claims; throws a JwtException otherwise. */
	@SuppressWarnings("deprecation")
	public Claims parse(String token) {
		return Jwts.parser().setSigningKey(secret).parseClaimsJws(token).getBody();
	}
}
