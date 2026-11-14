'use client';

import { Button, Modal, PasswordInput, PinInput, TextInput } from '@mantine/core';
import { useInterval } from '@mantine/hooks';
import { IconAt, IconLock } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { getErrorMessage } from '@/lib/api/client';
import { userApi } from '@/lib/api/services';
import { errorNotification, successNotification } from '@/lib/notifications';
import { signupValidation } from '@/lib/utils/validation';

const RESEND_SECONDS = 60;

/** Forgot-password flow: email -> OTP -> new password. */
export default function ResetPassword({ opened, close }: { opened: boolean; close: () => void }) {
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [verified, setVerified] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const interval = useInterval(() => setSeconds((s) => s - 1), 1000);
  useEffect(() => {
    if (seconds <= 0) interval.stop();
  }, [seconds, interval]);

  const sendOtp = async () => {
    setSending(true);
    try {
      await userApi.sendOtp(email);
      successNotification('OTP Sent Successfully.', 'Enter OTP to reset password.');
      setOtpSent(true);
      setSeconds(RESEND_SECONDS);
      interval.start();
    } catch (err) {
      errorNotification('OTP Sending Failed.', getErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  const changeEmail = () => {
    setOtpSent(false);
    setVerified(false);
    setSeconds(0);
    interval.stop();
  };

  const verifyOtp = async (otp: string) => {
    try {
      await userApi.verifyOtp(email, otp);
      successNotification('OTP Verified Successfully.', 'Enter new password.');
      setVerified(true);
      interval.stop();
    } catch (err) {
      errorNotification('OTP Verification Failed.', getErrorMessage(err));
    }
  };

  const resetPassword = async () => {
    try {
      await userApi.resetPassword(email, password);
      successNotification('Password Reset Successfully.', 'You can now log in with your new password.');
      changeEmail();
      setEmail('');
      setPassword('');
      close();
    } catch (err) {
      errorNotification('Password Reset Failed.', getErrorMessage(err));
    }
  };

  return (
    <Modal opened={opened} onClose={close} overlayProps={{ backgroundOpacity: 0.55, blur: 3 }} title="Reset Password" centered>
      <div className="flex flex-col gap-6">
        <TextInput
          disabled={otpSent}
          value={email}
          size="md"
          type="email"
          onChange={(e) => setEmail(e.currentTarget.value)}
          leftSection={<IconAt size={16} />}
          label="Email"
          withAsterisk
          placeholder="Your email"
          rightSectionWidth="xl"
          rightSection={
            <Button loading={sending && !otpSent} onClick={sendOtp} disabled={!email || otpSent} className="mr-1" size="xs" autoContrast>
              Send OTP
            </Button>
          }
        />
        {otpSent && <PinInput onComplete={verifyOtp} disabled={verified} className="mx-auto" gap="lg" size="md" length={6} type="number" />}
        {otpSent && !verified && (
          <div className="flex gap-2">
            <Button loading={sending} disabled={seconds > 0} onClick={sendOtp} fullWidth color="brightSun.4" variant="light">
              {seconds > 0 ? seconds : 'Resend'}
            </Button>
            <Button fullWidth onClick={changeEmail} autoContrast variant="filled">
              Change Email
            </Button>
          </div>
        )}
        {verified && (
          <>
            <PasswordInput
              value={password}
              error={error}
              onChange={(e) => {
                setPassword(e.currentTarget.value);
                setError(signupValidation('password', e.currentTarget.value));
              }}
              leftSection={<IconLock size={16} />}
              label="Password"
              withAsterisk
              placeholder="Password"
            />
            <Button onClick={resetPassword} disabled={!password || !!error} autoContrast variant="filled">
              Reset Password
            </Button>
          </>
        )}
      </div>
    </Modal>
  );
}
