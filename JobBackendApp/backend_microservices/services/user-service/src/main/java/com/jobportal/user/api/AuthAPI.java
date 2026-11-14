package com.jobportal.user.api;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jobportal.common.error.JobPortalException;
import com.jobportal.user.service.UserService;

/** POST /auth/login → { "jwt": "..." }, the same response the frontend reads from the monolith. */
@RestController
@RequestMapping("/auth")
public class AuthAPI {

	private final UserService userService;

	public AuthAPI(UserService userService) {
		this.userService = userService;
	}

	@PostMapping("/login")
	public ResponseEntity<Map<String, String>> login(@RequestBody LoginDTO request) throws JobPortalException {
		return ResponseEntity.ok(Map.of("jwt", userService.issueToken(request)));
	}
}
