import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { otpEmailTemplate } from '../templates/otp-email.js';

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  transporter ??= nodemailer.createTransport({
    host: env.mail.host,
    port: env.mail.port,
    secure: env.mail.port === 465, // 587 uses STARTTLS, like Spring's mail.smtp.starttls.enable
    auth: { user: env.mail.user, pass: env.mail.password },
  });
  return transporter;
}

/**
 * Sends the OTP email. Without MAIL_USERNAME / MAIL_PASSWORD (local development)
 * the code is written to the server log instead, so the reset flow can still be tested.
 */
export async function sendOtpEmail(to: string, name: string, otp: string): Promise<void> {
  if (!env.mail.enabled) {
    if (env.isProduction) throw new Error('Email is not configured (MAIL_USERNAME / MAIL_PASSWORD).');
    logger.warn({ to, otp }, 'Mail not configured — OTP printed here instead of being emailed');
    return;
  }
  await getTransporter().sendMail({
    from: env.mail.user,
    to,
    subject: 'Your OTP Code',
    html: otpEmailTemplate(otp, name),
  });
}
