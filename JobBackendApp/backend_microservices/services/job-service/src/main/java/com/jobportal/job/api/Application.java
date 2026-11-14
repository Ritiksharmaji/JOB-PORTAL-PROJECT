package com.jobportal.job.api;

import java.time.LocalDateTime;

import com.jobportal.job.domain.ApplicationStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Status change for one applicant on one job (id = job id). */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Application {
	private Long id;
	private Long applicantId;
	private LocalDateTime interviewTime;
	private ApplicationStatus applicationStatus;
}
