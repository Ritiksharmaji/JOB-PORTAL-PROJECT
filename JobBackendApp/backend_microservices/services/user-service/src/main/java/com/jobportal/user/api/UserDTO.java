package com.jobportal.user.api;

import com.jobportal.user.domain.AccountType;
import com.jobportal.user.domain.User;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
	private Long id;
	@NotBlank(message = "{user.name.absent}")
	private String name;
	@NotBlank(message = "{user.email.absent}")
	@Email(message = "{user.email.invalid}")
	private String email;
	@NotBlank(message = "{user.password.absent}")
	@Pattern(regexp = "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@#$%^&+=!]).{8,15}$", message = "{user.password.invalid}")
	private String password;
	private AccountType accountType;
	private Long profileId;

	public static UserDTO of(User u) {
		return new UserDTO(u.getId(), u.getName(), u.getEmail(), null, u.getAccountType(), u.getProfileId());
	}
}
