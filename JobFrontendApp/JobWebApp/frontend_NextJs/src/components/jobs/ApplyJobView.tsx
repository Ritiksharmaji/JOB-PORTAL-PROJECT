'use client';

import { Button, Divider, FileInput, NumberInput, Textarea, TextInput } from '@mantine/core';
import { isNotEmpty, useForm } from '@mantine/form';
import { IconPaperclip } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import BackButton from '@/components/shared/BackButton';
import CompanyLogo from '@/components/shared/CompanyLogo';
import { useApi } from '@/hooks/useApi';
import { getErrorMessage } from '@/lib/api/client';
import { jobApi } from '@/lib/api/services';
import { errorNotification, successNotification } from '@/lib/notifications';
import { timeAgo } from '@/lib/utils/date';
import { fileToBase64 } from '@/lib/utils/file';
import { useAppStore } from '@/store/app-store-provider';

interface ApplicationValues {
  name: string;
  email: string;
  phone: number | string;
  website: string;
  resume: File | null;
  coverLetter: string;
}

/** Two-step application: fill in -> preview -> submit. */
function ApplicationForm({ jobId }: { jobId: string }) {
  const router = useRouter();
  const user = useAppStore((s) => s.user);
  const track = useAppStore((s) => s.track);
  const [preview, setPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<ApplicationValues>({
    mode: 'controlled',
    validateInputOnChange: true,
    initialValues: { name: user?.name ?? '', email: user?.email ?? '', phone: '', website: '', resume: null, coverLetter: '' },
    validate: {
      name: isNotEmpty('Name cannot be empty'),
      email: isNotEmpty('Email cannot be empty'),
      phone: (v) => (/^\d{10}$/.test(String(v)) ? null : 'Enter a valid 10 digit phone number'),
      website: isNotEmpty('Website cannot be empty'),
      resume: isNotEmpty('Resume cannot be empty'),
    },
  });

  const togglePreview = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (form.validate().hasErrors) return;
    setPreview((p) => !p);
  };

  const submit = async () => {
    const values = form.getValues();
    if (!user || !values.resume) return;
    setSubmitting(true);
    try {
      const resume = await fileToBase64(values.resume);
      await track(jobApi.applyJob(jobId, { ...values, phone: Number(values.phone), resume, applicantId: user.id }));
      successNotification('Success', 'Job Applied Successfully');
      router.push('/job-history');
    } catch (err) {
      errorNotification('Error', getErrorMessage(err));
      setSubmitting(false);
    }
  };

  const look = (editable: boolean) => ({
    variant: preview ? 'unstyled' : 'default',
    readOnly: !editable || preview,
    className: preview ? 'font-semibold text-mine-shaft-300' : '',
  });

  return (
    <>
      <h2 className="mb-5 text-xl font-semibold">Submit Your Application</h2>
      <div className="flex flex-col gap-5">
        <div className="flex gap-10 *:w-1/2 max-md:gap-5 max-sm:flex-wrap max-sm:*:w-full!">
          <TextInput {...form.getInputProps('name')} {...look(false)} label="Full Name" withAsterisk />
          <TextInput {...form.getInputProps('email')} {...look(false)} label="Email" withAsterisk />
        </div>
        <div className="flex gap-10 *:w-1/2 max-md:gap-5 max-sm:flex-wrap max-sm:*:w-full!">
          <NumberInput {...form.getInputProps('phone')} {...look(true)} clampBehavior="strict" min={0} max={9999999999} label="Phone Number" withAsterisk placeholder="Enter phone" hideControls />
          <TextInput {...form.getInputProps('website')} {...look(true)} label="Personal Website" withAsterisk placeholder="Enter url" />
        </div>
        <FileInput {...form.getInputProps('resume')} {...look(true)} withAsterisk leftSection={<IconPaperclip stroke={1.5} />} accept="application/pdf" label="Resume/CV" placeholder="Attach Resume/CV" leftSectionPointerEvents="none" />
        <Textarea {...form.getInputProps('coverLetter')} {...look(true)} placeholder="Type something about yourself" label="Cover Letter" autosize minRows={4} />
        {preview ? (
          <div className="flex gap-10">
            <Button fullWidth onClick={togglePreview} color="brightSun.4" variant="outline">
              Edit
            </Button>
            <Button fullWidth onClick={submit} loading={submitting} color="brightSun.4" variant="light">
              Submit
            </Button>
          </div>
        ) : (
          <Button onClick={togglePreview} color="brightSun.4" variant="light">
            Preview
          </Button>
        )}
      </div>
    </>
  );
}

export default function ApplyJobView({ id }: { id: string }) {
  const { data: job } = useApi(() => jobApi.getJob(id), [id], { overlay: true });

  return (
    <div className="min-h-[90vh] bg-mine-shaft-950 p-4">
      <Divider size="xs" mb="xs" />
      <BackButton className="mb-2" />
      {job && (
        <div className="m-auto w-2/3 max-bs:w-4/5 max-sm:w-full">
          <div className="flex items-center gap-2">
            <div className="flex shrink-0 rounded-xl bg-mine-shaft-800 p-3">
              <CompanyLogo name={job.company} className="h-14 w-14 max-xs:h-10 max-xs:w-10" />
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-semibold max-xs:text-xl">{job.jobTitle}</h1>
              <div className="flex flex-wrap gap-1 text-lg text-mine-shaft-300 max-xs:text-base">
                <span>{job.company} &bull;</span>
                <span>{timeAgo(job.postTime)} &bull;</span>
                <span>{job.applicants?.length ?? 0} Applicants</span>
              </div>
            </div>
          </div>
          <Divider size="xs" my="xl" />
          <ApplicationForm jobId={id} />
        </div>
      )}
    </div>
  );
}
