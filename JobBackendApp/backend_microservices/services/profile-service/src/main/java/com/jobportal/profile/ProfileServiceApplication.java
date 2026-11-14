package com.jobportal.profile;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = "com.jobportal")
public class ProfileServiceApplication {
	public static void main(String[] args) {
		SpringApplication.run(ProfileServiceApplication.class, args);
	}
}
