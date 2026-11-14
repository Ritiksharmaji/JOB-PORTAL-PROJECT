package com.jobportal.user.domain;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserRepository extends MongoRepository<User, Long> {
	Optional<User> findByEmail(String email);
}
