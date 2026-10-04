'use client';

import { Button, PasswordInput, TextInput } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconAt, IconLock } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { getErrorMessage } from '@/lib/api/client';
import { authApi } from '@/lib/api/services';
import { errorNotification, successNotification } from '@/lib/notifications';
import { loginValidation } from '@/lib/utils/validation';
import { useAppStore } from '@/store/app-store-provider';
import ResetPassword from './ResetPassword';

const EMPTY = { email: '', password: '' };

export default function Login() {
  const router = useRouter();
  const login = useAppStore((s) => s.login);
  const [opened, { open, close }] = useDisclosure(false);
  const [data, setData] = useState(EMPTY);
  const [errors, setErrors] = useState(EMPTY);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const next = { email: loginValidation('email', data.email), password: loginValidation('password', data.password) };
    setErrors(next);
    if (next.email || next.password) return;

    setLoading(true);
    try {
      const { jwt } = await authApi.login(data);
      if (!login(jwt)) throw new Error('Invalid token');
      successNotification('Login Successful', 'Redirecting to home page...');
      router.push('/');
      router.refresh(); // re-render server components with the new session cookie
    } catch (err) {
      errorNotification('Login Failed', getErrorMessage(err));
      setLoading(false);
    }
  };

  const goToSignup = () => {
    setData(EMPTY);
    setErrors(EMPTY);
    router.push('/signup');
  };

  return (
    <>
      <form onSubmit={handleSubmit} noValidate data-aos="zoom-out" className="flex w-1/2 flex-col justify-center gap-3 px-20 max-bs:px-10 max-md:px-5 max-sm:w-full">
        <h1 className="text-2xl font-semibold">Login</h1>
        <TextInput value={data.email} error={errors.email} name="email" type="email" autoComplete="email" onChange={handleChange} leftSection={<IconAt size={16} />} label="Email" withAsterisk placeholder="Your email" />
        <PasswordInput value={data.password} error={errors.password} name="password" autoComplete="current-password" onChange={handleChange} leftSection={<IconLock size={16} />} label="Password" withAsterisk placeholder="Password" />
        <Button type="submit" loading={loading} autoContrast variant="filled">
          Login
        </Button>
        <p className="text-center max-sm:text-sm max-xs:text-xs">
          Don&apos;t have an account?{' '}
          <button type="button" className="text-bright-sun-400 hover:underline" onClick={goToSignup}>
            SignUp
          </button>
        </p>
        <button type="button" className="text-center text-bright-sun-400 hover:underline max-sm:text-sm max-xs:text-xs" onClick={open}>
          Forget Password?
        </button>
      </form>
      <ResetPassword opened={opened} close={close} />
    </>
  );
}
