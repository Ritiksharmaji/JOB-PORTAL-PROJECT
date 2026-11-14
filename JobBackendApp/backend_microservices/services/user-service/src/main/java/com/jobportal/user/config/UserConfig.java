package com.jobportal.user.config;

import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.jobportal.contracts.Messaging;
import com.jobportal.jwt.JwtTokens;

@Configuration
public class UserConfig {

	@Bean
	PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	JwtTokens jwtTokens(@Value("${jobportal.jwt.secret}") String secret) {
		return new JwtTokens(secret);
	}

	@Bean
	TopicExchange eventsExchange() {
		return new TopicExchange(Messaging.EXCHANGE, true, false);
	}

	@Bean
	MessageConverter jsonMessageConverter() {
		return new Jackson2JsonMessageConverter();
	}
}
