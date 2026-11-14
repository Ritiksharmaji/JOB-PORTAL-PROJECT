package com.jobportal.job.domain;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Stored inside its Job document, as in the monolith. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Applicant {
	private Long applicantId;
	private String name;
	private String email;
	private Long phone;
	private String website;
	private byte[] resume;
	private String coverLetter;
	private LocalDateTime timestamp;
	private ApplicationStatus applicationStatus;
	private LocalDateTime interviewTime;
}
