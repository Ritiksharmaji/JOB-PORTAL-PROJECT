package com.jobportal.notification.domain;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Same document and JSON as the monolith's Notification. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "notification")
public class Notification {
	@Id
	private Long id;
	private Long userId;
	private String message;
	private String action;
	private String route;
	private NotificationStatus status;
	private LocalDateTime timestamp;
}
