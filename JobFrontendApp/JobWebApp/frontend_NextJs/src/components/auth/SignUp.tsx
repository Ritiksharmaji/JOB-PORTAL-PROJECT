'use client';

import { Button, PasswordInput, Radio, TextInput } from '@mantine/core';
import { IconAt, IconLock } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { getErrorMessage } from '@/lib/api/client';
import { userApi } from '@/lib/api/services';
import { errorNotification, successNotification } from '@/lib/notifications';
import { signupValidation } from '@/lib/utils/validation';
import type { AccountType } from '@/types';

type Field = 'name' | 'email' | 'password' | 'confirmPassword';
const EMPTY: Record<Field, string> = { name: '', email: '', password: '', confirmPassword: '' };

export default function SignUp() {
  const router = useRouter();
  const [data, setData] = useState(EMPTY);
  const [accountType, setAccountType] = useState<AccountType>('APPLICANT');
  const [errors, setErrors] = useState(EMPTY);
  const [loading, setLoading] = useState(false);

  const validate = (name: Field, values: Record<Field, string>) =>
    name === 'confirmPassword'
      ? !values.confirmPassword
        ? 'Confirm password is required.'
        : values.confirmPassword !== values.password
          ? 'Passwords do not match.'
          : ''
      : signupValidation(name, values[name]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name as Field;
    const next = { ...data, [name]: e.target.value };
    setData(next);
    setErrors((prev) => ({
      ...prev,
      [name]: validate(name, next),
      // Re-check the confirmation when the password changes.
      ...(name === 'password' && next.confirmPassword ? { confirmPassword: validate('confirmPassword', next) } : {}),
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const next = Object.fromEntries((Object.keys(EMPTY) as Field[]).map((k) => [k, validate(k, data)])) as Record<Field, string>;
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    setLoading(true);
    try {
      await userApi.register({ name: data.name, email: data.email, password: data.password, accountType });
      successNotification('Registered Successfully', 'Redirecting to login page...');
      goToLogin();
    } catch (err) {
      errorNotification('Registration Failed', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  function goToLogin() {
    setData(EMPTY);
    setErrors(EMPTY);
    router.push('/login');
  }

  const radioClass =
    'rounded-lg border border-mine-shaft-800 px-6 py-4 hover:bg-mine-shaft-900 has-[:checked]:border-bright-sun-400! max-sm:px-4 max-sm:py-2';

  return (
    <form onSubmit={handleSubmit} noValidate className="flex w-1/2 flex-col justify-center gap-3 px-20 max-bs:px-10 max-md:px-5 max-sm:w-full max-sm:py-20">
      <h1 className="text-2xl font-semibold">Create Account</h1>
      <TextInput value={data.name} error={errors.name} name="name" autoComplete="name" onChange={handleChange} label="Full Name" withAsterisk placeholder="Your name" />
      <TextInput value={data.email} error={errors.email} name="email" type="email" autoComplete="email" onChange={handleChange} leftSection={<IconAt size={16} />} label="Email" withAsterisk placeholder="Your email" />
      <PasswordInput value={data.password} error={errors.password} name="password" autoComplete="new-password" onChange={handleChange} leftSection={<IconLock size={16} />} label="Password" withAsterisk placeholder="Password" />
      <PasswordInput value={data.confirmPassword} error={errors.confirmPassword} name="confirmPassword" autoComplete="new-password" onChange={handleChange} leftSection={<IconLock size={16} />} label="Confirm Password" withAsterisk placeholder="Confirm password" />
      <Radio.Group value={accountType} onChange={(v) => setAccountType(v as AccountType)} label="You are?" withAsterisk>
        <div className="flex gap-6 max-xs:gap-3">
          <Radio className={radioClass} value="APPLICANT" label="Applicant" />
          <Radio className={radioClass} value="EMPLOYER" label="Employer" />
        </div>
      </Radio.Group>
      <Button type="submit" loading={loading} autoContrast variant="filled">
        Sign up
      </Button>
      <p className="text-center max-sm:text-sm max-xs:text-xs">
        Have an account?{' '}
        <button type="button" className="text-bright-sun-400 hover:underline" onClick={goToLogin}>
          Login
        </button>
      </p>
    </form>
  );
}
