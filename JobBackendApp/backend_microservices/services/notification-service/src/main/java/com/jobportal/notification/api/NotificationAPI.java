package com.jobportal.notification.api;

import java.util.List;
import java.util.Objects;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jobportal.common.dto.ResponseDTO;
import com.jobportal.common.error.JobPortalException;
import com.jobportal.common.security.Viewer;
import com.jobportal.notification.domain.Notification;
import com.jobportal.notification.domain.NotificationRepository;
import com.jobportal.notification.domain.NotificationStatus;

/** Same endpoints as the monolith; users can only see and mark their own notifications. */
@RestController
@RequestMapping("/notification")
public class NotificationAPI {

	private final NotificationRepository notifications;

	public NotificationAPI(NotificationRepository notifications) {
		this.notifications = notifications;
	}

	@GetMapping("/get/{userId}")
	public ResponseEntity<List<Notification>> unread(@PathVariable Long userId) throws JobPortalException {
		requireSelfOrAdmin(userId);
		return ResponseEntity.ok(notifications.findByUserIdAndStatus(userId, NotificationStatus.UNREAD));
	}

	@PutMapping("/read/{id}")
	public ResponseEntity<ResponseDTO> read(@PathVariable Long id) throws JobPortalException {
		Notification n = notifications.findById(id).orElseThrow(() -> new JobPortalException("NOTIFICATION_NOT_FOUND"));
		requireSelfOrAdmin(n.getUserId());
		n.setStatus(NotificationStatus.READ);
		notifications.save(n);
		return ResponseEntity.ok(new ResponseDTO("Success"));
	}

	private void requireSelfOrAdmin(Long userId) throws JobPortalException {
		Viewer v = Viewer.current();
		if (v == null) throw new JobPortalException("LOGIN_REQUIRED");
		if (!(v.isAdmin() || Objects.equals(v.id(), userId))) throw new JobPortalException("NOT_ALLOWED");
	}
}
