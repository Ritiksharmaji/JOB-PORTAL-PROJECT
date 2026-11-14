package com.jobportal.job.domain;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "jobs")
public class Job {
	@Id
	private Long id;
	private String jobTitle;
	private String company;
	private List<Applicant> applicants;
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
}
