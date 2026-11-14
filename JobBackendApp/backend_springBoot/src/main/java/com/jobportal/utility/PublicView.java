package com.jobportal.utility;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import com.jobportal.dto.AccountType;
import com.jobportal.dto.ApplicantDTO;
import com.jobportal.dto.JobDTO;
import com.jobportal.dto.ProfileDTO;
import com.jobportal.exception.JobPortalException;
import com.jobportal.jwt.CustomUserDetails;

/**
 * Job and profile listings are public (anyone can browse). These helpers hide personal
 * data from viewers who shouldn't see it:
 * - applicants' details are visible only to the job's poster, the applicant themselves and admins
 *   (everyone else gets empty entries, so the applicant count still works);
 * - profile email and saved jobs are hidden from visitors who aren't logged in.
 */
public final class PublicView {

	private PublicView() {
	}

	/** The logged-in user, or null for an anonymous visitor. */
	public static CustomUserDetails viewer() {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		if (auth != null && auth.getPrincipal() instanceof CustomUserDetails user) {
			return user;
		}
		return null;
	}

	/** The logged-in user; throws if there is none (should not happen behind Spring Security). */
	public static CustomUserDetails requireViewer() throws JobPortalException {
		CustomUserDetails v = viewer();
		if (v == null) throw new JobPortalException("NOT_ALLOWED");
		return v;
	}

	public static boolean isAdmin(CustomUserDetails v) {
		return v != null && v.getAccountType() == AccountType.ADMIN;
	}

	/** Only the user themself (or an admin) may read their history, posted jobs or notifications. */
	public static CustomUserDetails requireSelfOrAdmin(Long userId) throws JobPortalException {
		CustomUserDetails v = requireViewer();
		if (!isAdmin(v) && !java.util.Objects.equals(v.getId(), userId)) throw new JobPortalException("NOT_ALLOWED");
		return v;
	}

	public static JobDTO job(JobDTO job) {
		if (job == null || job.getApplicants() == null) return job;
		CustomUserDetails viewer = viewer();
		if (viewer != null && (viewer.getAccountType() == AccountType.ADMIN
				|| viewer.getId().equals(job.getPostedBy()))) {
			return job;
		}
		Long viewerId = viewer == null ? null : viewer.getId();
		job.setApplicants(job.getApplicants().stream()
				.map(a -> viewerId != null && viewerId.equals(a.getApplicantId()) ? a : new ApplicantDTO())
				.toList());
		return job;
	}

	public static List<JobDTO> jobs(List<JobDTO> jobs) {
		return jobs.stream().map(PublicView::job).toList();
	}

	public static ProfileDTO profile(ProfileDTO profile) {
		if (profile != null && viewer() == null) {
			profile.setEmail(null);
			profile.setSavedJobs(null);
		}
		return profile;
	}

	public static List<ProfileDTO> profiles(List<ProfileDTO> profiles) {
		return profiles.stream().map(PublicView::profile).toList();
	}
}
