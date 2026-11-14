package com.jobportal.common.security;

import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * Who is calling. The API gateway validates the JWT and passes the caller on as headers; services are
 * only reachable through the gateway (internal Docker network), and the gateway strips any client-sent
 * copies of these headers first.
 */
public record Viewer(Long id, String role, String email) {

	public static final String ID = "X-User-Id";
	public static final String ROLE = "X-User-Role";
	public static final String EMAIL = "X-User-Email";

	/** The current caller, or null for an anonymous visitor. */
	public static Viewer current() {
		if (!(RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes attrs)) return null;
		var req = attrs.getRequest();
		String id = req.getHeader(ID);
		if (id == null || id.isBlank()) return null;
		try {
			return new Viewer(Long.valueOf(id), req.getHeader(ROLE), req.getHeader(EMAIL));
		} catch (NumberFormatException e) {
			return null;
		}
	}

	public boolean isAdmin() {
		return "ADMIN".equals(role);
	}
}
