package com.jobportal.job.api;

import java.time.LocalDateTime;
import java.util.List;

import com.jobportal.job.domain.Job;
import com.jobportal.job.domain.JobStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobDTO {
	private Long id;
	private String jobTitle;
	private String company;
	private List<ApplicantDTO> applicants;
	private String about;
	private String experience;
	private String jobType;
	private String location;
	private Long packageOffered;
	private LocalDateTime postTime;
	private String description;
	private List<String> skillsRequired;
	private JobStatus jobStatus;
	private Long postedBy;

	public static JobDTO of(Job j) {
		return new JobDTO(j.getId(), j.getJobTitle(), j.getCompany(),
				j.getApplicants() != null ? j.getApplicants().stream().map(ApplicantDTO::of).toList() : null, j.getAbout(),
				j.getExperience(), j.getJobType(), j.getLocation(), j.getPackageOffered(), j.getPostTime(), j.getDescription(),
				j.getSkillsRequired(), j.getJobStatus(), j.getPostedBy());
	}

	public Job toEntity() {
		return new Job(id, jobTitle, company, applicants != null ? applicants.stream().map(ApplicantDTO::toEntity).toList() : null,
				about, experience, jobType, location, packageOffered, postTime, description, skillsRequired, jobStatus, postedBy);
	}
}
