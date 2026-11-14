package com.jobportal.jwt;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.Map;

import org.junit.jupiter.api.Test;

import io.jsonwebtoken.JwtException;

class JwtTokensTest {

	private static final String SECRET = "afafasfafafasfasfasfafacasdasfasxASFACASDFACASDFASFASFDAFASFASDAADSCSDFADCVSGCFVADXCcadwavfsfarvf";

	@Test
	void issuedTokenCarriesTheMonolithClaims() {
		var jwt = new JwtTokens(SECRET);
		var claims = jwt.parse(jwt.issue("a@x.test", Map.of("id", 7, "name", "A", "accountType", "EMPLOYER", "profileId", 9)));
		assertEquals("a@x.test", claims.getSubject());
		assertEquals(7, claims.get("id"));
		assertEquals("EMPLOYER", claims.get("accountType"));
		assertEquals(9, claims.get("profileId"));
	}

	@Test
	void tokenSignedWithAnotherSecretIsRejected() {
		String token = new JwtTokens(SECRET).issue("a@x.test", Map.of("id", 1));
		var other = new JwtTokens(SECRET.replace('a', 'b'));
		assertThrows(JwtException.class, () -> other.parse(token));
	}
}
