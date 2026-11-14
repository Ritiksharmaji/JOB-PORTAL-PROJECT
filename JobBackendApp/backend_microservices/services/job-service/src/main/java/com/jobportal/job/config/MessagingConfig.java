package com.jobportal.job.config;

import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.jobportal.contracts.Messaging;

@Configuration
public class MessagingConfig {

	@Bean
	TopicExchange eventsExchange() {
		return new TopicExchange(Messaging.EXCHANGE, true, false);
	}

	@Bean
	MessageConverter jsonMessageConverter() {
		return new Jackson2JsonMessageConverter();
	}
}
