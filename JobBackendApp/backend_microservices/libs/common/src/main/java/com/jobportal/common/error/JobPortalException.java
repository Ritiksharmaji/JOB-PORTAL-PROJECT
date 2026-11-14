package com.jobportal.common.error;

/** Business error. The message is a key (e.g. JOB_NOT_FOUND) resolved to text from configuration. */
public class JobPortalException extends Exception {
	private static final long serialVersionUID = 1L;

	public JobPortalException(String message) {
		super(message);
	}
}
