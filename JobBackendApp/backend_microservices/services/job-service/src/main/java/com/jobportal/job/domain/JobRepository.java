package com.jobportal.job.domain;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

public interface JobRepository extends MongoRepository<Job, Long> {

	@Query("{ 'applicants': { $elemMatch: { 'applicantId': ?0, 'applicationStatus': ?1 } } }")
	List<Job> findByApplicantIdAndApplicationStatus(Long applicantId, ApplicationStatus status);

	List<Job> findByPostedBy(Long postedBy);
}
