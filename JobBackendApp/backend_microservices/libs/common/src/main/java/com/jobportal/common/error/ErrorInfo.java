package com.jobportal.common.error;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Error body, identical to the monolith's so the frontend needs no changes. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ErrorInfo {
	private String errorMessage;
	private Integer errorCode;
	private LocalDateTime timeStamp;
}
