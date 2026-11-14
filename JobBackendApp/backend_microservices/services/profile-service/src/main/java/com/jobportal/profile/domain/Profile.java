package com.jobportal.profile.domain;

import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "profiles")
public class Profile {
	@Id
	private Long id;
	private String name;
	private String email;
	private String jobTitle;
	private String company;
	private String location;
	private String about;
	private byte[] picture;
	private Long totalExp;
	private List<String> skills;
	private List<Experience> experiences;
	private List<Certification> certifications;
	private List<Long> savedJobs;
}
