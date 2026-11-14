package com.jobportal.job.api;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jobportal.common.dto.ResponseDTO;
import com.jobportal.common.error.JobPortalException;
import com.jobportal.common.mongo.SequenceGenerator;
import com.jobportal.common.security.Viewer;
import com.jobportal.contracts.Messaging;
import com.jobportal.contracts.NotificationEvent;
import com.jobportal.job.domain.Applicant;
import com.jobportal.job.domain.ApplicationStatus;
import com.jobportal.job.domain.Job;
import com.jobportal.job.domain.JobRepository;
import com.jobportal.job.domain.JobStatus;

/**
 * Same endpoints as the monolith's JobAPI. Differences: the caller comes from the gateway (not from IDs in
 * the request body), applicant IDs are compared by value (the monolith used == on Long, which breaks above
 * 127), and applicants' personal data is only shown to the job's poster, the applicant and admins.
 */
@RestController
@RequestMapping("/jobs")
public class JobAPI {

	private static final Logger log = LoggerFactory.getLogger(JobAPI.class);

	private final JobRepository jobs;
	private final SequenceGenerator sequences;
	private final RabbitTemplate rabbit;

	public JobAPI(JobRepository jobs, SequenceGenerator sequences, RabbitTemplate rabbit) {
		this.jobs = jobs;
		this.sequences = sequences;
		this.rabbit = rabbit;
	}

	@PostMapping("/post")
	public ResponseEntity<JobDTO> post(@RequestBody JobDTO dto) throws JobPortalException {
		return new ResponseEntity<>(JobDTO.of(save(dto, requireRecruiter())), HttpStatus.CREATED);
	}

	@PostMapping("/postAll")
	public ResponseEntity<List<JobDTO>> postAll(@RequestBody List<JobDTO> dtos) throws JobPortalException {
		Viewer viewer = requireRecruiter();
		List<JobDTO> saved = new ArrayList<>();
		for (JobDTO dto : dtos) saved.add(JobDTO.of(save(dto, viewer)));
		return new ResponseEntity<>(saved, HttpStatus.CREATED);
	}

	@GetMapping("/getAll")
	public ResponseEntity<List<JobDTO>> getAll() {
		Viewer viewer = Viewer.current();
		return ResponseEntity.ok(jobs.findAll().stream().map(JobDTO::of).map(j -> redact(j, viewer)).toList());
	}

	@GetMapping("/get/{id}")
	public ResponseEntity<JobDTO> get(@PathVariable Long id) throws JobPortalException {
		return ResponseEntity.ok(redact(JobDTO.of(find(id)), Viewer.current()));
	}

	@PostMapping("/apply/{id}")
	public ResponseEntity<ResponseDTO> apply(@PathVariable Long id, @RequestBody ApplicantDTO dto) throws JobPortalException {
		Viewer viewer = require();
		Job job = find(id);
		List<Applicant> applicants = job.getApplicants() == null ? new ArrayList<>() : new ArrayList<>(job.getApplicants());
		if (applicants.stream().anyMatch(a -> Objects.equals(a.getApplicantId(), viewer.id()))) {
			throw new JobPortalException("JOB_APPLIED_ALREADY");
		}
		dto.setApplicantId(viewer.id());
		dto.setApplicationStatus(ApplicationStatus.APPLIED);
		dto.setInterviewTime(null);
		if (dto.getTimestamp() == null) dto.setTimestamp(LocalDateTime.now());
		applicants.add(dto.toEntity());
		job.setApplicants(applicants);
		jobs.save(job);
		return ResponseEntity.ok(new ResponseDTO("Applied Successfully"));
	}

	@GetMapping("/postedBy/{id}")
	public ResponseEntity<List<JobDTO>> postedBy(@PathVariable Long id) throws JobPortalException {
		requireSelfOrAdmin(id);
		return ResponseEntity.ok(jobs.findByPostedBy(id).stream().map(JobDTO::of).toList());
	}

	@GetMapping("/history/{id}/{status}")
	public ResponseEntity<List<JobDTO>> history(@PathVariable Long id, @PathVariable ApplicationStatus status)
			throws JobPortalException {
		Viewer viewer = requireSelfOrAdmin(id);
		return ResponseEntity.ok(jobs.findByApplicantIdAndApplicationStatus(id, status).stream().map(JobDTO::of)
				.map(j -> redact(j, viewer)).toList());
	}

	@PostMapping("/changeAppStatus")
	public ResponseEntity<ResponseDTO> changeAppStatus(@RequestBody Application change) throws JobPortalException {
		Viewer viewer = require();
		Job job = find(change.getId());
		if (!(viewer.isAdmin() || Objects.equals(job.getPostedBy(), viewer.id()))) throw new JobPortalException("NOT_ALLOWED");
		Applicant applicant = (job.getApplicants() == null ? List.<Applicant>of() : job.getApplicants()).stream()
				.filter(a -> Objects.equals(a.getApplicantId(), change.getApplicantId())).findFirst()
				.orElseThrow(() -> new JobPortalException("APPLICANT_NOT_FOUND"));
		applicant.setApplicationStatus(change.getApplicationStatus());
		if (change.getApplicationStatus() == ApplicationStatus.INTERVIEWING) {
			applicant.setInterviewTime(change.getInterviewTime());
			publish(new NotificationEvent(applicant.getApplicantId(), "Interview scheduled for job id: " + job.getId(),
					"Interview Scheduled", "/job-history"));
		}
		jobs.save(job);
		return ResponseEntity.ok(new ResponseDTO("Status Chhanged Successfully"));
	}

	// --- helpers ---

	private Job save(JobDTO dto, Viewer viewer) throws JobPortalException {
		if (dto.getId() == null || dto.getId() == 0) {
			dto.setId(sequences.next("jobs"));
			dto.setPostTime(LocalDateTime.now());
			dto.setPostedBy(viewer.id());
			dto.setApplicants(null);
			Job saved = jobs.save(dto.toEntity());
			publish(new NotificationEvent(viewer.id(), "Job Posted Successfully for " + dto.getJobTitle() + " at " + dto.getCompany(),
					"Job Posted", "/posted-jobs/" + saved.getId()));
			return saved;
		}
		Job existing = find(dto.getId());
		if (!(viewer.isAdmin() || Objects.equals(existing.getPostedBy(), viewer.id()))) throw new JobPortalException("NOT_ALLOWED");
		if (existing.getJobStatus() == JobStatus.DRAFT || dto.getJobStatus() == JobStatus.CLOSED) dto.setPostTime(LocalDateTime.now());
		else dto.setPostTime(existing.getPostTime());
		dto.setPostedBy(existing.getPostedBy());
		Job updated = dto.toEntity();
		updated.setApplicants(existing.getApplicants()); // editing a job never rewrites its applications
		return jobs.save(updated);
	}

	private JobDTO redact(JobDTO job, Viewer viewer) {
		if (job.getApplicants() == null) return job;
		if (viewer != null && (viewer.isAdmin() || Objects.equals(viewer.id(), job.getPostedBy()))) return job;
		Long me = viewer == null ? null : viewer.id();
		job.setApplicants(job.getApplicants().stream()
				.map(a -> me != null && Objects.equals(me, a.getApplicantId()) ? a : new ApplicantDTO()).toList());
		return job;
	}

	private Job find(Long id) throws JobPortalException {
		return jobs.findById(id).orElseThrow(() -> new JobPortalException("JOB_NOT_FOUND"));
	}

	private Viewer require() throws JobPortalException {
		Viewer v = Viewer.current();
		if (v == null) throw new JobPortalException("LOGIN_REQUIRED");
		return v;
	}

	private Viewer requireRecruiter() throws JobPortalException {
		Viewer v = require();
		if (!("EMPLOYER".equals(v.role()) || v.isAdmin())) throw new JobPortalException("NOT_ALLOWED");
		return v;
	}

	private Viewer requireSelfOrAdmin(Long userId) throws JobPortalException {
		Viewer v = require();
		if (!(v.isAdmin() || Objects.equals(v.id(), userId))) throw new JobPortalException("NOT_ALLOWED");
		return v;
	}

	private void publish(NotificationEvent event) {
		try {
			rabbit.convertAndSend(Messaging.EXCHANGE, Messaging.NOTIFICATION_ROUTING_KEY, event);
		} catch (RuntimeException e) {
			log.warn("Could not publish notification for user {}: {}", event.userId(), e.toString());
		}
	}
}
