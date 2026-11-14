package com.jobportal.profile.api;

import java.util.ArrayList;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.jobportal.common.error.JobPortalException;
import com.jobportal.common.mongo.SequenceGenerator;
import com.jobportal.common.security.Viewer;
import com.jobportal.contracts.CreateProfileRequest;
import com.jobportal.profile.domain.Profile;
import com.jobportal.profile.domain.ProfileRepository;

@RestController
public class ProfileAPI {

	private final ProfileRepository profiles;
	private final SequenceGenerator sequences;

	public ProfileAPI(ProfileRepository profiles, SequenceGenerator sequences) {
		this.profiles = profiles;
		this.sequences = sequences;
	}

	/** Public (anyone can browse talent); email and saved jobs are hidden from logged-out visitors. */
	@GetMapping("/profiles/get/{id}")
	public ResponseEntity<ProfileDTO> get(@PathVariable Long id) throws JobPortalException {
		return ResponseEntity.ok(publicView(ProfileDTO.of(find(id))));
	}

	@GetMapping("/profiles/getAll")
	public ResponseEntity<List<ProfileDTO>> getAll() {
		return ResponseEntity.ok(profiles.findAll().stream().map(ProfileDTO::of).map(this::publicView).toList());
	}

	/** Only the profile's owner (or an admin) may change it; the monolith let any logged-in user update any profile. */
	@PutMapping("/profiles/update")
	public ResponseEntity<ProfileDTO> update(@RequestBody ProfileDTO dto) throws JobPortalException {
		Profile existing = find(dto.getId());
		Viewer viewer = Viewer.current();
		if (viewer == null || !(viewer.isAdmin() || existing.getEmail().equalsIgnoreCase(viewer.email()))) {
			throw new JobPortalException("PROFILE_NOT_YOURS");
		}
		dto.setEmail(existing.getEmail()); // the email belongs to the account, not the profile form
		profiles.save(dto.toEntity());
		return ResponseEntity.ok(dto);
	}

	/** Service-to-service only (not routed by the gateway): user-service calls this on registration. */
	@PostMapping("/internal/profiles")
	public Long create(@RequestBody CreateProfileRequest request) throws JobPortalException {
		Profile p = new Profile();
		p.setId(sequences.next("profiles"));
		p.setName(request.name());
		p.setEmail(request.email());
		p.setSkills(new ArrayList<>());
		p.setExperiences(new ArrayList<>());
		p.setCertifications(new ArrayList<>());
		return profiles.save(p).getId();
	}

	private Profile find(Long id) throws JobPortalException {
		return profiles.findById(id).orElseThrow(() -> new JobPortalException("PROFILE_NOT_FOUND"));
	}

	private ProfileDTO publicView(ProfileDTO p) {
		if (Viewer.current() == null) {
			p.setEmail(null);
			p.setSavedJobs(null);
		}
		return p;
	}
}
