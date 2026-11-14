package com.jobportal.clients.profile;

import org.springframework.cloud.openfeign.FallbackFactory;
import org.springframework.stereotype.Component;

/** When profile-service is down or the circuit is open, registration fails with a clear message. */
@Component
public class ProfileClientFallback implements FallbackFactory<ProfileClient> {

	@Override
	public ProfileClient create(Throwable cause) {
		return request -> {
			throw new ProfileServiceUnavailableException(cause);
		};
	}

	public static class ProfileServiceUnavailableException extends RuntimeException {
		private static final long serialVersionUID = 1L;

		public ProfileServiceUnavailableException(Throwable cause) {
			super("PROFILE_SERVICE_UNAVAILABLE", cause);
		}
	}
}
