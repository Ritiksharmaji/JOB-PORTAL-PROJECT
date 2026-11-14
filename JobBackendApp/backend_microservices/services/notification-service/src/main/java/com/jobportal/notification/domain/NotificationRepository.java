package com.jobportal.notification.domain;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface NotificationRepository extends MongoRepository<Notification, Long> {
	List<Notification> findByUserIdAndStatus(Long userId, NotificationStatus status);
}
