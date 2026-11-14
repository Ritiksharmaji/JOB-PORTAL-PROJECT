package com.jobportal.contracts;

/** RabbitMQ names shared by publishers (user-service, job-service) and the consumer (notification-service). */
public final class Messaging {
	private Messaging() {
	}

	public static final String EXCHANGE = "jobportal.events";
	public static final String NOTIFICATION_ROUTING_KEY = "notification.create";
	public static final String NOTIFICATION_QUEUE = "notification.create.q";
	public static final String DEAD_LETTER_EXCHANGE = "jobportal.events.dlx";
	public static final String NOTIFICATION_DLQ = "notification.create.dlq";
}
