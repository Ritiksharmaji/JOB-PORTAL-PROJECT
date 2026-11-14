package com.jobportal.user.domain;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface OTPRepository extends MongoRepository<OTP, String> {
	List<OTP> findByCreationTimeBefore(LocalDateTime time);
}
