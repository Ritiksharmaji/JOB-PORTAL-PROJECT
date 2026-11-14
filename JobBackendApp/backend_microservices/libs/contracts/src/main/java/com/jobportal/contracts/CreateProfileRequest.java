package com.jobportal.contracts;

/** user-service → profile-service when someone registers. */
public record CreateProfileRequest(String name, String email) {
}
