package com.jobportal.notification.messaging;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.jobportal.contracts.Messaging;

/** Durable queue bound to the events exchange, with a dead-letter queue for messages that keep failing. */
@Configuration
public class RabbitConfig {

	@Bean
	TopicExchange eventsExchange() {
		return new TopicExchange(Messaging.EXCHANGE, true, false);
	}

	@Bean
	DirectExchange deadLetterExchange() {
		return new DirectExchange(Messaging.DEAD_LETTER_EXCHANGE, true, false);
	}

	@Bean
	Queue notificationQueue() {
		return QueueBuilder.durable(Messaging.NOTIFICATION_QUEUE).deadLetterExchange(Messaging.DEAD_LETTER_EXCHANGE)
				.deadLetterRoutingKey(Messaging.NOTIFICATION_DLQ).build();
	}

	@Bean
	Queue notificationDeadLetterQueue() {
		return QueueBuilder.durable(Messaging.NOTIFICATION_DLQ).build();
	}

	@Bean
	Binding notificationBinding() {
		return BindingBuilder.bind(notificationQueue()).to(eventsExchange()).with(Messaging.NOTIFICATION_ROUTING_KEY);
	}

	@Bean
	Binding deadLetterBinding() {
		return BindingBuilder.bind(notificationDeadLetterQueue()).to(deadLetterExchange()).with(Messaging.NOTIFICATION_DLQ);
	}

	@Bean
	MessageConverter jsonMessageConverter() {
		return new Jackson2JsonMessageConverter();
	}
}
