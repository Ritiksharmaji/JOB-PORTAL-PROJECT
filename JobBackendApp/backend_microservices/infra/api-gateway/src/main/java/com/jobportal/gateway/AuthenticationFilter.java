package com.jobportal.gateway;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.server.ServerWebExchange;

import com.jobportal.jwt.JwtTokens;

import io.jsonwebtoken.Claims;
import reactor.core.publisher.Mono;

/**
 * The only place tokens are checked. Same public routes as the monolith's SecurityConfig; everything else
 * needs a valid JWT. The caller is passed to services as X-User-* headers, after removing any copies the
 * client sent (so they cannot be forged). An invalid token on a public route is treated as a visitor.
 */
@Component
public class AuthenticationFilter implements GlobalFilter, Ordered {

	private static final String ID = "X-User-Id", ROLE = "X-User-Role", EMAIL = "X-User-Email";
	private static final AntPathMatcher PATHS = new AntPathMatcher();

	/** method (null = any) and path pattern */
	private static final List<String[]> PUBLIC = List.of(
			new String[] { "POST", "/auth/login" },
			new String[] { "POST", "/users/register" },
			new String[] { "POST", "/users/login" },
			new String[] { "POST", "/users/changePass" }, // protected by the verified-OTP check in user-service
			new String[] { null, "/users/sendOtp/**" },
			new String[] { null, "/users/verifyOtp/**" },
			new String[] { "GET", "/jobs/getAll" },
			new String[] { "GET", "/jobs/get/**" },
			new String[] { "GET", "/profiles/getAll" },
			new String[] { "GET", "/profiles/get/**" },
			new String[] { "GET", "/actuator/health" });

	private final JwtTokens jwt;

	public AuthenticationFilter(@Value("${jobportal.jwt.secret}") String secret) {
		this.jwt = new JwtTokens(secret);
	}

	@Override
	public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
		ServerHttpRequest request = exchange.getRequest();
		if (request.getMethod() == HttpMethod.OPTIONS) return chain.filter(exchange);

		Claims claims = claims(request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION));
		if (claims == null && !isPublic(request)) return unauthorized(exchange);

		ServerHttpRequest forwarded = request.mutate().headers(h -> {
			h.remove(ID);
			h.remove(ROLE);
			h.remove(EMAIL);
			if (claims != null) {
				h.set(ID, String.valueOf(claims.get("id")));
				h.set(ROLE, String.valueOf(claims.get("accountType")));
				h.set(EMAIL, claims.getSubject());
			}
		}).build();
		return chain.filter(exchange.mutate().request(forwarded).build());
	}

	private Claims claims(String header) {
		if (header == null || !header.startsWith("Bearer ")) return null;
		try {
			Claims c = jwt.parse(header.substring(7));
			return c.get("id") == null ? null : c;
		} catch (RuntimeException e) { // expired, tampered or malformed
			return null;
		}
	}

	private boolean isPublic(ServerHttpRequest request) {
		String path = request.getPath().value();
		String method = request.getMethod().name();
		return PUBLIC.stream().anyMatch(p -> (p[0] == null || p[0].equals(method)) && PATHS.match(p[1], path));
	}

	/** 401 like the monolith; the React app logs the user out and sends them to /login. */
	private Mono<Void> unauthorized(ServerWebExchange exchange) {
		var response = exchange.getResponse();
		response.setStatusCode(HttpStatus.UNAUTHORIZED);
		response.getHeaders().setContentType(MediaType.APPLICATION_JSON);
		byte[] body = ("{\"errorMessage\":\"Please log in first.\",\"errorCode\":401,\"timeStamp\":\"" + LocalDateTime.now() + "\"}")
				.getBytes(StandardCharsets.UTF_8);
		return response.writeWith(Mono.just(response.bufferFactory().wrap(body)));
	}

	@Override
	public int getOrder() {
		return Ordered.HIGHEST_PRECEDENCE + 10;
	}
}
