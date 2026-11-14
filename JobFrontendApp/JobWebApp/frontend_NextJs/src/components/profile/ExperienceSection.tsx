'use client';

import { ActionIcon, Button, Checkbox, Textarea, TextInput } from '@mantine/core';
import { MonthPickerInput } from '@mantine/dates';
import { isNotEmpty, useForm } from '@mantine/form';
import { IconBriefcase, IconMapPin, IconPencil, IconPlus, IconTrash, IconX } from '@tabler/icons-react';
import { useState } from 'react';
import SelectInput from '@/components/shared/SelectInput';
import { COMPANY_NAMES, JOB_TITLES, LOCATIONS } from '@/data/options';
import { useAppStore } from '@/store/app-store-provider';
import type { Certification, Experience } from '@/types';
import { CertificationItem, ExperienceItem } from './ProfileItems';
import { SectionTitle } from './ProfileSections';

// Mantine 8 date pickers use "YYYY-MM-DD" strings; the API uses ISO date-times.
// Noon UTC on the 1st keeps the month stable in every timezone.
const toPicker = (iso?: string) => (iso ? iso.slice(0, 10) : new Date().toISOString().slice(0, 10));
const toIso = (picker: string | null) => {
  const [y, m] = (picker ?? toPicker()).split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, 1, 12)).toISOString();
};
const today = () => new Date().toISOString().slice(0, 10);
const row = 'my-3 flex gap-10 *:w-1/2 max-md:gap-5 max-xs:flex-wrap max-xs:*:w-full';

function AddEditButtons({ editing, onAdd, onToggle, label }: { editing: boolean; onAdd: () => void; onToggle: () => void; label: string }) {
  return (
    <div className="flex gap-2">
      <ActionIcon onClick={onAdd} variant="subtle" color="brightSun.4" size="lg" aria-label={`Add ${label}`}>
        <IconPlus className="h-4/5 w-4/5" stroke={1.5} />
      </ActionIcon>
      <ActionIcon onClick={onToggle} variant="subtle" color={editing ? 'red.8' : 'brightSun.4'} size="lg" aria-label={editing ? 'Done editing' : `Edit ${label}`}>
        {editing ? <IconX className="h-4/5 w-4/5" stroke={1.5} /> : <IconPencil className="h-4/5 w-4/5" stroke={1.5} />}
      </ActionIcon>
    </div>
  );
}

function ExperienceForm({ experience, onSave, onCancel }: { experience?: Experience; onSave: (e: Experience) => void; onCancel: () => void }) {
  const form = useForm({
    mode: 'controlled',
    validateInputOnChange: true,
    initialValues: {
      title: experience?.title ?? '',
      company: experience?.company ?? '',
      location: experience?.location ?? '',
      description: experience?.description ?? '',
      startDate: toPicker(experience?.startDate) as string | null,
      endDate: toPicker(experience?.endDate) as string | null,
      working: experience?.working ?? false,
    },
    validate: {
      title: isNotEmpty('Title cannot be empty'),
      company: isNotEmpty('Company cannot be empty'),
      location: isNotEmpty('Location cannot be empty'),
      description: isNotEmpty('Description cannot be empty'),
    },
  });
  const values = form.getValues();

  const submit = () => {
    if (form.validate().hasErrors) return;
    onSave({ ...values, startDate: toIso(values.startDate), endDate: toIso(values.endDate) });
  };

  return (
    <div data-aos="zoom-out">
      <h3 className="text-lg font-semibold">{experience ? 'Edit' : 'Add'} Experience</h3>
      <div className={row}>
        <SelectInput {...form.getInputProps('title')} label="Job Title" placeholder="Enter Job Title" options={JOB_TITLES} leftSection={IconBriefcase} />
        <SelectInput {...form.getInputProps('company')} label="Company" placeholder="Enter Company Name" options={COMPANY_NAMES} leftSection={IconBriefcase} />
      </div>
      <SelectInput {...form.getInputProps('location')} label="Location" placeholder="Enter Job Location" options={LOCATIONS} leftSection={IconMapPin} />
      <Textarea {...form.getInputProps('description')} withAsterisk className="my-3" label="Summary" autosize minRows={2} placeholder="Enter Summary" />
      <div className={row}>
        <MonthPickerInput {...form.getInputProps('startDate')} maxDate={values.endDate ?? undefined} withAsterisk label="Start Date" />
        <MonthPickerInput {...form.getInputProps('endDate')} disabled={values.working} minDate={values.startDate ?? undefined} maxDate={today()} withAsterisk label="End Date" />
      </div>
      <Checkbox autoContrast label="Currently working here" checked={values.working} onChange={(e) => form.setFieldValue('working', e.currentTarget.checked)} />
      <div className="my-3 flex gap-5">
        <Button color="green.8" onClick={submit} variant="light">
          Save
        </Button>
        <Button color="red.8" onClick={onCancel} variant="light">
          Cancel
        </Button>
      </div>
    </div>
  );
}

export function ExperienceSection() {
  const experiences = useAppStore((s) => s.profile?.experiences) ?? [];
  const updateProfile = useAppStore((s) => s.updateProfile);
  const [editMode, setEditMode] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  return (
    <section data-aos="fade-up">
      <SectionTitle actions={<AddEditButtons editing={editMode} onAdd={() => setAdding(true)} onToggle={() => setEditMode(!editMode)} label="experience" />}>
        Experience
      </SectionTitle>
      <div className="flex flex-col gap-8">
        {experiences.map((exp, i) =>
          editingIndex === i ? (
            <ExperienceForm
              key={i}
              experience={exp}
              onCancel={() => setEditingIndex(null)}
              onSave={(updated) => {
                void updateProfile({ experiences: experiences.map((e, j) => (j === i ? updated : e)) }, 'Experience Updated Successfully');
                setEditingIndex(null);
              }}
            />
          ) : (
            <ExperienceItem key={i} experience={exp}>
              {editMode && (
                <div className="flex gap-5">
                  <Button color="brightSun.4" onClick={() => setEditingIndex(i)} variant="outline">
                    Edit
                  </Button>
                  <Button color="red.8" variant="light" onClick={() => void updateProfile({ experiences: experiences.filter((_, j) => j !== i) }, 'Experience Deleted Successfully')}>
                    Delete
                  </Button>
                </div>
              )}
            </ExperienceItem>
          ),
        )}
        {adding && (
          <ExperienceForm
            onCancel={() => setAdding(false)}
            onSave={(exp) => {
              void updateProfile({ experiences: [...experiences, exp] }, 'Experience Added Successfully');
              setAdding(false);
            }}
          />
        )}
      </div>
    </section>
  );
}

function CertificationForm({ onSave, onCancel }: { onSave: (c: Certification) => void; onCancel: () => void }) {
  const form = useForm({
    mode: 'controlled',
    validateInputOnChange: true,
    initialValues: { name: '', issuer: '', issueDate: today() as string | null, certificateId: '' },
    validate: {
      name: isNotEmpty('Title cannot be empty'),
      issuer: isNotEmpty('Issuer cannot be empty'),
      issueDate: isNotEmpty('Issue Date cannot be empty'),
      certificateId: isNotEmpty('Certificate ID cannot be empty'),
    },
  });

  const submit = () => {
    if (form.validate().hasErrors) return;
    const v = form.getValues();
    onSave({ ...v, issueDate: toIso(v.issueDate) });
  };

  return (
    <div data-aos="zoom-out">
      <h3 className="text-lg font-semibold">Add Certificate</h3>
      <div className={row}>
        <TextInput withAsterisk {...form.getInputProps('name')} label="Title" placeholder="Enter title" />
        <SelectInput {...form.getInputProps('issuer')} label="Issuer" placeholder="Enter Company Name" options={COMPANY_NAMES} leftSection={IconBriefcase} />
      </div>
      <div className={row}>
        <MonthPickerInput {...form.getInputProps('issueDate')} maxDate={today()} withAsterisk label="Issue Date" placeholder="Pick date" />
        <TextInput {...form.getInputProps('certificateId')} withAsterisk label="Certificate ID" placeholder="Enter ID" />
      </div>
      <div className="my-3 flex gap-5">
        <Button color="green.8" onClick={submit} variant="light">
          Save
        </Button>
        <Button color="red.8" onClick={onCancel} variant="light">
          Cancel
        </Button>
      </div>
    </div>
  );
}

export function CertificationSection() {
  const certifications = useAppStore((s) => s.profile?.certifications) ?? [];
  const updateProfile = useAppStore((s) => s.updateProfile);
  const [editMode, setEditMode] = useState(false);
  const [adding, setAdding] = useState(false);

  return (
    <section data-aos="fade-up">
      <SectionTitle actions={<AddEditButtons editing={editMode} onAdd={() => setAdding(true)} onToggle={() => setEditMode(!editMode)} label="certifications" />}>
        Certifications
      </SectionTitle>
      <div className="flex flex-col gap-8">
        {certifications.map((cert, i) => (
          <CertificationItem key={i} certification={cert}>
            {editMode && (
              <ActionIcon
                variant="subtle"
                color="red.8"
                size="lg"
                aria-label="Delete certification"
                onClick={() => void updateProfile({ certifications: certifications.filter((_, j) => j !== i) }, 'Certificate Deleted Successfully')}
              >
                <IconTrash className="h-4/5 w-4/5" stroke={1.5} />
              </ActionIcon>
            )}
          </CertificationItem>
        ))}
        {adding && (
          <CertificationForm
            onCancel={() => setAdding(false)}
            onSave={(cert) => {
              void updateProfile({ certifications: [...certifications, cert] }, 'Certificate Added Successfully');
              setAdding(false);
            }}
          />
        )}
      </div>
    </section>
  );
}
