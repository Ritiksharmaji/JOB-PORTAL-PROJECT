package com.jobportal.user.api;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jobportal.common.dto.ResponseDTO;
import com.jobportal.common.error.JobPortalException;
import com.jobportal.user.service.UserService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

@RestController
@RequestMapping("/users")
@Validated
public class UserAPI {

	private final UserService userService;

	public UserAPI(UserService userService) {
		this.userService = userService;
	}

	@PostMapping("/register")
	public ResponseEntity<UserDTO> register(@RequestBody @Valid UserDTO user) throws JobPortalException {
		return new ResponseEntity<>(userService.register(user), HttpStatus.CREATED);
	}

	@PostMapping("/login")
	public ResponseEntity<UserDTO> login(@RequestBody @Valid LoginDTO login) throws JobPortalException {
		return ResponseEntity.ok(userService.login(login));
	}

	@PostMapping("/changePass")
	public ResponseEntity<ResponseDTO> changePassword(@RequestBody @Valid LoginDTO login) throws JobPortalException {
		return ResponseEntity.ok(userService.changePassword(login));
	}

	@PostMapping("/sendOtp/{email}")
	public ResponseEntity<ResponseDTO> sendOtp(@PathVariable @Email(message = "{user.email.invalid}") String email)
			throws Exception {
		userService.sendOtp(email);
		return ResponseEntity.ok(new ResponseDTO("OTP sent successfully."));
	}

	@GetMapping("/verifyOtp/{email}/{otp}")
	public ResponseEntity<ResponseDTO> verifyOtp(
			@PathVariable @NotBlank(message = "{user.email.absent}") @Email(message = "{user.email.invalid}") String email,
			@PathVariable @Pattern(regexp = "^[0-9]{6}$", message = "{otp.invalid}") String otp) throws JobPortalException {
		userService.verifyOtp(email, otp);
		return new ResponseEntity<>(new ResponseDTO("OTP has been verified."), HttpStatus.ACCEPTED);
	}
}
