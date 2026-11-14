package com.jobportal.job;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = "com.jobportal")
public class JobServiceApplication {
	public static void main(String[] args) {
		SpringApplication.run(JobServiceApplication.class, args);
	}
}
