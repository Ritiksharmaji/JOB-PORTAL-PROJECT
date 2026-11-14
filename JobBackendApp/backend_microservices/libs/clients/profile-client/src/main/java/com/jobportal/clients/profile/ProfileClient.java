package com.jobportal.clients.profile;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.jobportal.contracts.CreateProfileRequest;

/**
 * Calls profile-service through Eureka (service name, load-balanced). The /internal path is not routed by
 * the API gateway, so only other services can create profiles. Wrapped in a Resilience4j circuit breaker.
 */
@FeignClient(name = "profile-service", path = "/internal/profiles", fallbackFactory = ProfileClientFallback.class)
public interface ProfileClient {

	@PostMapping
	Long create(@RequestBody CreateProfileRequest request);
}
