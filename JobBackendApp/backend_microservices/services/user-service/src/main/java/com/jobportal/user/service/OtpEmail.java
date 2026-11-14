package com.jobportal.user.service;

import java.time.Year;

import org.springframework.web.util.HtmlUtils;

/** OTP email body (same design as the monolith's Data.getMessageBody). */
final class OtpEmail {
	private OtpEmail() {
	}

	static String body(String otp, String name) {
		return """
				<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Your OTP Code</title>
				<style>
				body{font-family:Arial,sans-serif;margin:0;padding:0;background:#f4f4f4}
				.container{max-width:600px;margin:0 auto;padding:20px;background:#fff;border-radius:8px;box-shadow:0 4px 8px rgba(0,0,0,.1)}
				.header{background:#4CAF50;color:#fff;padding:10px;text-align:center;border-radius:8px 8px 0 0}
				.body{padding:20px;color:#333;text-align:center}.otp{font-size:24px;font-weight:bold;color:#4CAF50;margin:20px 0}
				.footer{margin-top:20px;font-size:12px;color:#888;text-align:center}
				</style></head><body><div class="container">
				<div class="header"><h1>Your OTP Code</h1></div>
				<div class="body"><p>Hello <strong>%s</strong>,</p>
				<p>We have received a request to verify your email address. Your OTP code is:</p>
				<div class="otp">%s</div>
				<p>This OTP code is valid for 5 minutes. If you did not request this, please ignore this email.</p>
				<p>Thank you for using our service!</p></div>
				<div class="footer"><p>&copy;%d JobPilot AI. All rights reserved.</p></div>
				</div></body></html>
				""".formatted(HtmlUtils.htmlEscape(name), otp, Year.now().getValue());
	}
}
