package com.jobportal.notification.messaging;

import java.time.LocalDateTime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.AmqpRejectAndDontRequeueException;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import com.jobportal.common.error.JobPortalException;
import com.jobportal.common.mongo.SequenceGenerator;
import com.jobportal.contracts.Messaging;
import com.jobportal.contracts.NotificationEvent;
import com.jobportal.notification.domain.Notification;
import com.jobportal.notification.domain.NotificationRepository;
import com.jobportal.notification.domain.NotificationStatus;

/** Turns NotificationEvents from user-service and job-service into unread notifications. */
@Component
public class NotificationListener {

	private static final Logger log = LoggerFactory.getLogger(NotificationListener.class);

	private final NotificationRepository notifications;
	private final SequenceGenerator sequences;

	public NotificationListener(NotificationRepository notifications, SequenceGenerator sequences) {
		this.notifications = notifications;
		this.sequences = sequences;
	}

	@RabbitListener(queues = Messaging.NOTIFICATION_QUEUE)
	public void onEvent(NotificationEvent event) throws JobPortalException {
		if (event == null || event.userId() == null) {
			throw new AmqpRejectAndDontRequeueException("Notification event without a user"); // straight to the DLQ
		}
		notifications.save(new Notification(sequences.next("notification"), event.userId(), event.message(), event.action(),
				event.route(), NotificationStatus.UNREAD, LocalDateTime.now()));
		log.info("Stored '{}' notification for user {}", event.action(), event.userId());
	}
}
