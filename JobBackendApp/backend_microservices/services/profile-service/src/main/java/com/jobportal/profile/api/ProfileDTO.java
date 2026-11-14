package com.jobportal.profile.api;

import java.util.Base64;
import java.util.List;

import com.jobportal.profile.domain.Certification;
import com.jobportal.profile.domain.Experience;
import com.jobportal.profile.domain.Profile;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Same JSON as the monolith (picture as base64). */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfileDTO {
	private Long id;
	private String name;
	private String email;
	private String jobTitle;
	private String company;
	private String location;
	private String about;
	private String picture;
	private Long totalExp;
	private List<String> skills;
	private List<Experience> experiences;
	private List<Certification> certifications;
	private List<Long> savedJobs;

	public static ProfileDTO of(Profile p) {
		return new ProfileDTO(p.getId(), p.getName(), p.getEmail(), p.getJobTitle(), p.getCompany(), p.getLocation(), p.getAbout(),
				p.getPicture() != null ? Base64.getEncoder().encodeToString(p.getPicture()) : null, p.getTotalExp(), p.getSkills(),
				p.getExperiences(), p.getCertifications(), p.getSavedJobs());
	}

	public Profile toEntity() {
		return new Profile(id, name, email, jobTitle, company, location, about,
				picture != null ? Base64.getDecoder().decode(picture) : null, totalExp, skills, experiences, certifications, savedJobs);
	}
}
