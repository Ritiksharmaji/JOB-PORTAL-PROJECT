package com.jobportal.service;

import java.util.Objects;
import com.jobportal.dto.AccountType;
import com.jobportal.jwt.CustomUserDetails;
import com.jobportal.utility.PublicView;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.jobportal.dto.ApplicantDTO;
import com.jobportal.dto.Application;
import com.jobportal.dto.ApplicationStatus;
import com.jobportal.dto.JobDTO;
import com.jobportal.dto.JobStatus;
import com.jobportal.dto.NotificationDTO;
import com.jobportal.entity.Applicant;
import com.jobportal.entity.Job;
import com.jobportal.exception.JobPortalException;
import com.jobportal.repository.JobRepository;
import com.jobportal.utility.Utilities;

@Service("jobService")
public class JobServiceImpl implements JobService {

	@Autowired
	private JobRepository jobRepository;
	@Autowired
	private NotificationService notificationService;

	@Override
	public JobDTO postJob(JobDTO jobDTO) throws JobPortalException {
		CustomUserDetails viewer = PublicView.requireViewer();
		if (!PublicView.isAdmin(viewer) && viewer.getAccountType() != AccountType.EMPLOYER) throw new JobPortalException("NOT_ALLOWED");
		if(jobDTO.getId()==null || jobDTO.getId()==0) {
			jobDTO.setPostedBy(viewer.getId()); // not from the request body
			jobDTO.setApplicants(null);
			jobDTO.setId(Utilities.getNextSequenceId("jobs"));
			jobDTO.setPostTime(LocalDateTime.now());
			NotificationDTO notiDto=new NotificationDTO();
			notiDto.setAction("Job Posted");
			notiDto.setMessage("Job Posted Successfully for "+jobDTO.getJobTitle()+" at "+ jobDTO.getCompany());
			
			notiDto.setUserId(jobDTO.getPostedBy());
			notiDto.setRoute("/posted-jobs/"+jobDTO.getId());
				notificationService.sendNotification(notiDto);
		}
		else {
			Job job=jobRepository.findById(jobDTO.getId()).orElseThrow(() -> new JobPortalException("JOB_NOT_FOUND"));
			if (!PublicView.isAdmin(viewer) && !Objects.equals(job.getPostedBy(), viewer.getId())) throw new JobPortalException("NOT_ALLOWED");
			if(job.getJobStatus().equals(JobStatus.DRAFT) || jobDTO.getJobStatus().equals(JobStatus.CLOSED))jobDTO.setPostTime(LocalDateTime.now());
			else jobDTO.setPostTime(job.getPostTime());
			jobDTO.setPostedBy(job.getPostedBy());
			Job updated = jobDTO.toEntity();
			updated.setApplicants(job.getApplicants()); // editing or closing a job must not wipe its applications
			return jobRepository.save(updated).toDTO();
		}
		return jobRepository.save(jobDTO.toEntity()).toDTO();
	}

	
	@Override
	public List<JobDTO> getAllJobs() throws JobPortalException {
		return jobRepository.findAll().stream().map((x) -> x.toDTO()).toList();
	}

	@Override
	public JobDTO getJob(Long id) throws JobPortalException {
		return jobRepository.findById(id).orElseThrow(() -> new JobPortalException("JOB_NOT_FOUND")).toDTO();
	}

	@Override
	public void applyJob(Long id, ApplicantDTO applicantDTO) throws JobPortalException {
		Job job = jobRepository.findById(id).orElseThrow(() -> new JobPortalException("JOB_NOT_FOUND"));
		applicantDTO.setApplicantId(PublicView.requireViewer().getId()); // not from the request body
		List<Applicant> applicants = job.getApplicants();
		if (applicants == null)applicants = new ArrayList<>();
		if (applicants.stream().filter((x) -> Objects.equals(x.getApplicantId(), applicantDTO.getApplicantId())).toList().size() > 0)throw new JobPortalException("JOB_APPLIED_ALREADY");
		applicantDTO.setApplicationStatus(ApplicationStatus.APPLIED);
		applicants.add(applicantDTO.toEntity());
		job.setApplicants(applicants);
		jobRepository.save(job);
	}

	@Override
	public List<JobDTO> getHistory(Long id, ApplicationStatus applicationStatus) {
		return jobRepository.findByApplicantIdAndApplicationStatus(id, applicationStatus).stream().map((x) -> x.toDTO())
				.toList();
	}

	@Override
	public List<JobDTO> getJobsPostedBy(Long id) throws JobPortalException {
		return jobRepository.findByPostedBy(id).stream().map((x) -> x.toDTO()).toList();
	}


	@Override
	public void changeAppStatus(Application application) throws JobPortalException {
		Job job = jobRepository.findById(application.getId()).orElseThrow(() -> new JobPortalException("JOB_NOT_FOUND"));
		CustomUserDetails viewer = PublicView.requireViewer();
		if (!PublicView.isAdmin(viewer) && !Objects.equals(job.getPostedBy(), viewer.getId())) throw new JobPortalException("NOT_ALLOWED");
		List<Applicant> apps = job.getApplicants().stream().map((x) -> {
			if (Objects.equals(application.getApplicantId(), x.getApplicantId())) {
				x.setApplicationStatus(application.getApplicationStatus());
				if(application.getApplicationStatus().equals(ApplicationStatus.INTERVIEWING)) {
					x.setInterviewTime(application.getInterviewTime());
					NotificationDTO notiDto=new NotificationDTO();
					notiDto.setAction("Interview Scheduled");
					notiDto.setMessage("Interview scheduled for job id: "+application.getId());
					notiDto.setUserId(application.getApplicantId());
					notiDto.setRoute("/job-history");
					try {
						notificationService.sendNotification(notiDto);
					} catch (JobPortalException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}
				}
			}
			return x;
		}).toList();
		job.setApplicants(apps);
		jobRepository.save(job);
		
	}

}
