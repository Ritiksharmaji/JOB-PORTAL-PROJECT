'use client';

import { Button, Divider, NumberInput, TagsInput, Textarea } from '@mantine/core';
import { isNotEmpty, useForm } from '@mantine/form';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import SelectInput from '@/components/shared/SelectInput';
import TextEditor from '@/components/shared/TextEditor';
import { COMPANY_NAMES, EXPERIENCE_LEVELS, JOB_DESCRIPTION_TEMPLATE, JOB_TITLES, JOB_TYPES, LOCATIONS } from '@/data/options';
import { getErrorMessage } from '@/lib/api/client';
import { jobApi } from '@/lib/api/services';
import { errorNotification, successNotification } from '@/lib/notifications';
import { useAppStore } from '@/store/app-store-provider';
import type { Job, JobStatus } from '@/types';

interface JobFormValues {
  jobTitle: string;
  company: string;
  experience: string;
  jobType: string;
  location: string;
  packageOffered: number | string;
  skillsRequired: string[];
  about: string;
  description: string;
}

const EMPTY_JOB: JobFormValues = {
  jobTitle: '',
  company: '',
  experience: '',
  jobType: '',
  location: '',
  packageOffered: '',
  skillsRequired: [],
  about: '',
  description: JOB_DESCRIPTION_TEMPLATE,
};

const row = 'flex gap-10 *:w-1/2 max-md:gap-5 max-sm:flex-wrap max-sm:*:w-full!';

/** Create (`/post-job/0`) or edit (`/post-job/:id`) a job. */
export default function PostJobView({ id }: { id: string }) {
  const router = useRouter();
  const user = useAppStore((s) => s.user);
  const track = useAppStore((s) => s.track);
  const isEdit = Number(id) !== 0;
  /** The job being edited — re-sent on save so the backend keeps applicants and postTime. */
  const loadedJob = useRef<Job | null>(null);

  const form = useForm<JobFormValues>({
    mode: 'controlled',
    validateInputOnChange: true,
    initialValues: EMPTY_JOB,
    validate: {
      jobTitle: isNotEmpty('Title cannot be empty'),
      company: isNotEmpty('Company cannot be empty'),
      experience: isNotEmpty('Experience cannot be empty'),
      jobType: isNotEmpty('Job Type cannot be empty'),
      location: isNotEmpty('Location cannot be empty'),
      packageOffered: isNotEmpty('Salary cannot be empty'),
      skillsRequired: isNotEmpty('Skills cannot be empty'),
      about: isNotEmpty('About cannot be empty'),
      description: isNotEmpty('Description cannot be empty'),
    },
  });

  // Load the job when editing; reset to a blank form for a new one.
  const { setValues, reset } = form;
  useEffect(() => {
    window.scrollTo(0, 0);
    loadedJob.current = null;
    if (!isEdit) {
      reset();
      return;
    }
    let active = true;
    track(jobApi.getJob(id))
      .then((job) => {
        if (!active) return;
        loadedJob.current = job;
        const { jobTitle, company, experience, jobType, location, packageOffered, skillsRequired, about, description } = job;
        setValues({ jobTitle, company, experience, jobType, location, packageOffered, skillsRequired: skillsRequired ?? [], about, description });
      })
      .catch(() => {});
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- form helpers are stable
  }, [id, isEdit, track]);

  const save = async (status: JobStatus) => {
    // Drafts may be incomplete; publishing requires every field.
    if (status === 'ACTIVE' && form.validate().hasErrors) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!user) return;
    const values = form.getValues();
    try {
      const job = await track(
        jobApi.postJob({
          ...loadedJob.current,
          ...values,
          packageOffered: Number(values.packageOffered) || 0,
          // `id: 0` means "create" to the backends; Spring's postJob fails on a missing id.
          id: isEdit ? Number(id) : 0,
          postedBy: loadedJob.current?.postedBy ?? user.id,
          jobStatus: status,
        }),
      );
      successNotification('Success', status === 'ACTIVE' ? 'Job Posted Successfully' : 'Job Saved as Draft');
      router.push(`/posted-jobs/${job.id}`);
    } catch (err) {
      errorNotification('Error', getErrorMessage(err));
    }
  };

  return (
    <div className="min-h-[90vh] bg-mine-shaft-950">
      <Divider size="xs" mx="md" />
      <section data-aos="zoom-out" className="px-16 py-5 max-bs:px-10 max-md:px-5">
        <h1 className="mb-5 text-2xl font-semibold">{isEdit ? 'Edit Job' : 'Post a Job'}</h1>
        <div className="flex flex-col gap-5">
          <div className={row}>
            <SelectInput {...form.getInputProps('jobTitle')} label="Job Title" placeholder="Enter Job Title" options={JOB_TITLES} />
            <SelectInput {...form.getInputProps('company')} label="Company" placeholder="Enter Company Name" options={COMPANY_NAMES} />
          </div>
          <div className={row}>
            <SelectInput {...form.getInputProps('experience')} label="Experience" placeholder="Enter Experience Level" options={EXPERIENCE_LEVELS} />
            <SelectInput {...form.getInputProps('jobType')} label="Job Type" placeholder="Enter Job Type" options={JOB_TYPES} />
          </div>
          <div className={row}>
            <SelectInput {...form.getInputProps('location')} label="Location" placeholder="Enter Job Location" options={LOCATIONS} />
            <NumberInput {...form.getInputProps('packageOffered')} withAsterisk label="Salary (LPA)" placeholder="Enter Salary" hideControls min={1} max={300} clampBehavior="strict" />
          </div>
          <TagsInput {...form.getInputProps('skillsRequired')} withAsterisk label="Skills" placeholder="Enter skill" splitChars={[',', ' ', '|']} clearable />
          <Textarea {...form.getInputProps('about')} withAsterisk className="my-3" label="About Job" autosize minRows={2} placeholder="Enter about job.." />
          <div className="[&_button[data-active='true']]:bg-bright-sun-400/20! [&_button[data-active='true']]:text-bright-sun-400!">
            <div className="text-sm font-medium">
              Job Description<span className="text-red-600"> *</span>
            </div>
            <TextEditor value={form.getValues().description} onChange={(html) => form.setFieldValue('description', html)} />
            {form.errors.description && <div className="mt-1 text-xs text-red-500">{form.errors.description}</div>}
          </div>
          <div className="flex gap-4">
            <Button color="brightSun.4" onClick={() => save('ACTIVE')} variant="light">
              Publish Job
            </Button>
            <Button color="brightSun.4" onClick={() => save('DRAFT')} variant="outline">
              Save as Draft
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
