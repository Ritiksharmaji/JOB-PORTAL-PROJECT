'use client';

import { Button, TextInput } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useState, type FormEvent } from 'react';
import { errorNotification, successNotification } from '@/lib/notifications';
import { EMAIL_PATTERN } from '@/lib/utils/validation';

export default function Subscribe() {
  const sm = useMediaQuery('(max-width: 639px)');
  const xs = useMediaQuery('(max-width: 475px)');
  const size = xs ? 'sm' : sm ? 'md' : 'xl';
  const [email, setEmail] = useState('');

  const subscribe = (e: FormEvent) => {
    e.preventDefault();
    if (!EMAIL_PATTERN.test(email)) return errorNotification('Invalid Email', 'Please enter a valid email address.');
    successNotification('Subscribed', 'You will now receive job news in your inbox.');
    setEmail('');
  };

  return (
    <section data-aos="zoom-out" className="mx-20 mt-20 flex flex-wrap items-center justify-around gap-4 rounded-xl bg-mine-shaft-900 py-3 max-sm:mx-5">
      <h2 className="w-2/5 text-center text-4xl font-semibold text-mine-shaft-100 max-bs:w-4/5 max-md:text-3xl max-sm:text-2xl max-xs:text-xl">
        Never Wants to Miss Any <span className="text-bright-sun-400">Job News?</span>
      </h2>
      <form onSubmit={subscribe} className="flex gap-4 rounded-xl bg-mine-shaft-700 px-3 py-2 max-xs:flex-col xs:items-center">
        <TextInput
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
          className="font-semibold [&_input]:text-mine-shaft-100!"
          variant="unstyled"
          placeholder="Your@email.com"
          aria-label="Email address"
          size={size}
        />
        <Button type="submit" className="rounded-lg!" size={size} color="brightSun.4" variant="filled">
          Subscribe
        </Button>
      </form>
    </section>
  );
}
