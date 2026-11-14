package com.jobportal.common.error;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;

/** Same error responses as the monolith's ExceptionControllerAdvice. */
@RestControllerAdvice
public class GlobalExceptionHandler {

	private final Environment environment;

	public GlobalExceptionHandler(Environment environment) {
		this.environment = environment;
	}

	@ExceptionHandler(JobPortalException.class)
	public ResponseEntity<ErrorInfo> jobPortal(JobPortalException e) {
		String msg = environment.getProperty("messages." + e.getMessage(), e.getMessage());
		return new ResponseEntity<>(new ErrorInfo(msg, 500, LocalDateTime.now()), HttpStatus.INTERNAL_SERVER_ERROR);
	}

	@ExceptionHandler({ MethodArgumentNotValidException.class, ConstraintViolationException.class })
	public ResponseEntity<ErrorInfo> validation(Exception e) {
		String msg;
		if (e instanceof MethodArgumentNotValidException m) {
			msg = m.getBindingResult().getAllErrors().stream().map(ObjectError::getDefaultMessage).map(this::resolve)
					.collect(Collectors.joining(", "));
		} else {
			msg = ((ConstraintViolationException) e).getConstraintViolations().stream().map(ConstraintViolation::getMessage)
					.map(this::resolve).collect(Collectors.joining(", "));
		}
		return new ResponseEntity<>(new ErrorInfo(msg, 400, LocalDateTime.now()), HttpStatus.BAD_REQUEST);
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<ErrorInfo> general(Exception e) {
		return new ResponseEntity<>(new ErrorInfo(e.getMessage(), 500, LocalDateTime.now()), HttpStatus.INTERNAL_SERVER_ERROR);
	}

	/** Bean-validation messages written as {key} are looked up in configuration. */
	private String resolve(String msg) {
		if (msg != null && msg.startsWith("{") && msg.endsWith("}")) {
			return environment.getProperty("messages." + msg.substring(1, msg.length() - 1), msg);
		}
		return msg;
	}
}
