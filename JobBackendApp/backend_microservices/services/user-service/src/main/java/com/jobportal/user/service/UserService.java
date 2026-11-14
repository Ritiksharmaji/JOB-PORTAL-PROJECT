package com.jobportal.user.service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.jobportal.clients.profile.ProfileClient;
import com.jobportal.clients.profile.ProfileClientFallback.ProfileServiceUnavailableException;
import com.jobportal.common.dto.ResponseDTO;
import com.jobportal.common.error.JobPortalException;
import com.jobportal.common.mongo.SequenceGenerator;
import com.jobportal.contracts.CreateProfileRequest;
import com.jobportal.contracts.Messaging;
import com.jobportal.contracts.NotificationEvent;
import com.jobportal.jwt.JwtTokens;
import com.jobportal.user.api.LoginDTO;
import com.jobportal.user.api.UserDTO;
import com.jobportal.user.domain.OTP;
import com.jobportal.user.domain.OTPRepository;
import com.jobportal.user.domain.User;
import com.jobportal.user.domain.UserRepository;

import jakarta.mail.internet.MimeMessage;

@Service
public class UserService {

	private static final Logger log = LoggerFactory.getLogger(UserService.class);
	private static final SecureRandom RANDOM = new SecureRandom();

	private final UserRepository users;
	private final OTPRepository otps;
	private final SequenceGenerator sequences;
	private final PasswordEncoder passwordEncoder;
	private final ProfileClient profiles;
	private final JavaMailSender mail;
	private final RabbitTemplate rabbit;
	private final JwtTokens jwt;
	private final String mailUser;

	public UserService(UserRepository users, OTPRepository otps, SequenceGenerator sequences, PasswordEncoder passwordEncoder,
			ProfileClient profiles, JavaMailSender mail, RabbitTemplate rabbit, JwtTokens jwt,
			@Value("${spring.mail.username:}") String mailUser) {
		this.users = users;
		this.otps = otps;
		this.sequences = sequences;
		this.passwordEncoder = passwordEncoder;
		this.profiles = profiles;
		this.mail = mail;
		this.rabbit = rabbit;
		this.jwt = jwt;
		this.mailUser = mailUser;
	}

	public UserDTO register(UserDTO dto) throws JobPortalException {
		if (users.findByEmail(dto.getEmail()).isPresent()) throw new JobPortalException("USER_FOUND");
		Long profileId;
		try {
			profileId = profiles.create(new CreateProfileRequest(dto.getName(), dto.getEmail())); // sync call via Feign
		} catch (ProfileServiceUnavailableException e) {
			log.warn("profile-service unavailable during registration: {}", e.getCause() == null ? e : e.getCause().toString());
			throw new JobPortalException("PROFILE_SERVICE_UNAVAILABLE");
		}
		User user = new User(sequences.next("users"), dto.getName(), dto.getEmail(), passwordEncoder.encode(dto.getPassword()),
				dto.getAccountType(), profileId);
		return UserDTO.of(users.save(user));
	}

	public UserDTO login(LoginDTO login) throws JobPortalException {
		User user = users.findByEmail(login.getEmail()).orElseThrow(() -> new JobPortalException("USER_NOT_FOUND"));
		if (!passwordEncoder.matches(login.getPassword(), user.getPassword())) throw new JobPortalException("INVALID_CREDENTIALS");
		return UserDTO.of(user);
	}

	/** Same claims as the monolith's JwtHelper: id, name, accountType, profileId; subject = email. */
	public String issueToken(LoginDTO login) throws JobPortalException {
		User user = users.findByEmail(login.getEmail()).orElse(null);
		if (user == null || login.getPassword() == null || !passwordEncoder.matches(login.getPassword(), user.getPassword())) {
			throw new JobPortalException("Incorrect username or password");
		}
		Map<String, Object> claims = new HashMap<>();
		claims.put("id", user.getId());
		claims.put("name", user.getName());
		claims.put("accountType", user.getAccountType());
		claims.put("profileId", user.getProfileId());
		return jwt.issue(user.getEmail(), claims);
	}

	public void sendOtp(String email) throws Exception {
		User user = users.findByEmail(email).orElseThrow(() -> new JobPortalException("USER_NOT_FOUND"));
		String code = String.format("%06d", RANDOM.nextInt(1_000_000));
		otps.save(new OTP(email, code, LocalDateTime.now(), false));
		if (mailUser == null || mailUser.isBlank()) {
			log.info("Mail is not configured; OTP for {} is {}", email, code); // development only
			return;
		}
		MimeMessage mm = mail.createMimeMessage();
		MimeMessageHelper message = new MimeMessageHelper(mm, true);
		message.setTo(email);
		message.setSubject("Your OTP Code");
		message.setText(OtpEmail.body(code, user.getName()), true);
		mail.send(mm);
	}

	public void verifyOtp(String email, String code) throws JobPortalException {
		OTP otp = otps.findById(email).orElseThrow(() -> new JobPortalException("OTP_NOT_FOUND"));
		if (!otp.getOtpCode().equals(code)) throw new JobPortalException("OTP_INCORRECT");
		otp.setVerified(true);
		otps.save(otp);
	}

	/** Requires a verified, unexpired OTP for this email (the monolith accepted any email). */
	public ResponseDTO changePassword(LoginDTO login) throws JobPortalException {
		User user = users.findByEmail(login.getEmail()).orElseThrow(() -> new JobPortalException("USER_NOT_FOUND"));
		OTP otp = otps.findById(login.getEmail()).orElse(null);
		if (otp == null || !otp.isVerified() || otp.getCreationTime().isBefore(LocalDateTime.now().minusMinutes(5))) {
			throw new JobPortalException("OTP_NOT_VERIFIED");
		}
		user.setPassword(passwordEncoder.encode(login.getPassword()));
		users.save(user);
		otps.delete(otp); // one reset per OTP
		publish(new NotificationEvent(user.getId(), "Password Reset Successfull", "Password Reset", null));
		return new ResponseDTO("Password changed successfully.");
	}

	@Scheduled(fixedRate = 60_000)
	public void removeExpiredOtps() {
		List<OTP> expired = otps.findByCreationTimeBefore(LocalDateTime.now().minusMinutes(5));
		if (!expired.isEmpty()) {
			otps.deleteAll(expired);
			log.info("Removed {} expired OTPs", expired.size());
		}
	}

	private void publish(NotificationEvent event) {
		try {
			rabbit.convertAndSend(Messaging.EXCHANGE, Messaging.NOTIFICATION_ROUTING_KEY, event);
		} catch (RuntimeException e) {
			// A notification must never fail the user's action.
			log.warn("Could not publish notification for user {}: {}", event.userId(), e.toString());
		}
	}
}
