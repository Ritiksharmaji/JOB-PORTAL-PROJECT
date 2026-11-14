package com.jobportal.job.api;

import java.time.LocalDateTime;
import java.util.Base64;

import com.jobportal.job.domain.Applicant;
import com.jobportal.job.domain.ApplicationStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Same JSON as the monolith (resume as base64). */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplicantDTO {
	private Long applicantId;
	private String name;
	private String email;
	private Long phone;
	private String website;
	private String resume;
	private String coverLetter;
	private LocalDateTime timestamp;
	private ApplicationStatus applicationStatus;
	private LocalDateTime interviewTime;

	public static ApplicantDTO of(Applicant a) {
		return new ApplicantDTO(a.getApplicantId(), a.getName(), a.getEmail(), a.getPhone(), a.getWebsite(),
				a.getResume() != null ? Base64.getEncoder().encodeToString(a.getResume()) : null, a.getCoverLetter(),
				a.getTimestamp(), a.getApplicationStatus(), a.getInterviewTime());
	}

	public Applicant toEntity() {
		return new Applicant(applicantId, name, email, phone, website, resume != null ? Base64.getDecoder().decode(resume) : null,
				coverLetter, timestamp, applicationStatus, interviewTime);
	}
}
