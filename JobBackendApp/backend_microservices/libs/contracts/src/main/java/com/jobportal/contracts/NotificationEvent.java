package com.jobportal.contracts;

/** "Tell this user something" — published by any service, stored by notification-service. */
public record NotificationEvent(Long userId, String message, String action, String route) {
}
