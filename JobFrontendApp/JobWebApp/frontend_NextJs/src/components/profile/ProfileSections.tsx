'use client';

import { ActionIcon, NumberInput, TagsInput, Textarea } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconBriefcase, IconCheck, IconMapPin, IconPencil, IconX } from '@tabler/icons-react';
import { useState, type ReactNode } from 'react';
import SelectInput from '@/components/shared/SelectInput';
import { COMPANY_NAMES, JOB_TITLES, LOCATIONS } from '@/data/options';
import { useAppStore } from '@/store/app-store-provider';

/** Pencil / save / cancel buttons used by every editable profile section. */
export function EditControls({ editing, onToggle, onSave, label }: { editing: boolean; onToggle: () => void; onSave?: () => void; label: string }) {
  return (
    <div className="flex gap-1">
      {editing && onSave && (
        <ActionIcon onClick={onSave} variant="subtle" color="green.8" size="lg" aria-label={`Save ${label}`}>
          <IconCheck className="h-4/5 w-4/5" stroke={1.5} />
        </ActionIcon>
      )}
      <ActionIcon onClick={onToggle} variant="subtle" color={editing ? 'red.8' : 'brightSun.4'} size="lg" aria-label={editing ? 'Cancel' : `Edit ${label}`}>
        {editing ? <IconX className="h-4/5 w-4/5" stroke={1.5} /> : <IconPencil className="h-4/5 w-4/5" stroke={1.5} />}
      </ActionIcon>
    </div>
  );
}

export function SectionTitle({ children, actions, size = 'text-2xl' }: { children: ReactNode; actions: ReactNode; size?: string }) {
  return (
    <div className={`mb-3 flex items-center justify-between font-semibold ${size}`}>
      {children}
      {actions}
    </div>
  );
}

export function Info() {
  const name = useAppStore((s) => s.user?.name);
  const profile = useAppStore((s) => s.profile);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const [editing, setEditing] = useState(false);
  const form = useForm({ mode: 'controlled', initialValues: { jobTitle: '', company: '', location: '', totalExp: 1 as number | string } });

  const toggle = () => {
    if (!editing) {
      form.setValues({ jobTitle: profile?.jobTitle ?? '', company: profile?.company ?? '', location: profile?.location ?? '', totalExp: profile?.totalExp ?? 1 });
    }
    setEditing(!editing);
  };

  const save = () => {
    const v = form.getValues();
    void updateProfile({ ...v, totalExp: Number(v.totalExp) }, 'Profile Updated Successfully');
    setEditing(false);
  };

  return (
    <>
      <SectionTitle size="text-3xl max-xs:text-2xl" actions={<EditControls editing={editing} onToggle={toggle} onSave={save} label="info" />}>
        {name}
      </SectionTitle>
      {editing ? (
        <>
          <div className="my-3 flex gap-10 *:w-1/2 max-md:gap-5 max-xs:flex-wrap max-xs:*:w-full">
            <SelectInput {...form.getInputProps('jobTitle')} label="Job Title" placeholder="Enter Job Title" options={JOB_TITLES} leftSection={IconBriefcase} />
            <SelectInput {...form.getInputProps('company')} label="Company" placeholder="Enter Company Name" options={COMPANY_NAMES} leftSection={IconBriefcase} />
          </div>
          <div className="my-3 flex gap-10 *:w-1/2 max-md:gap-5 max-xs:flex-wrap max-xs:*:w-full">
            <SelectInput {...form.getInputProps('location')} label="Location" placeholder="Enter Job Location" options={LOCATIONS} leftSection={IconMapPin} />
            <NumberInput {...form.getInputProps('totalExp')} label="Experience" withAsterisk hideControls clampBehavior="strict" min={1} max={50} />
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-1 text-xl max-xs:text-base">
            <IconBriefcase className="h-5 w-5" stroke={1.5} /> {profile?.jobTitle} &bull; {profile?.company}
          </div>
          <div className="flex items-center gap-1 text-lg text-mine-shaft-300 max-xs:text-base">
            <IconMapPin className="h-5 w-5" stroke={1.5} /> {profile?.location}
          </div>
          <div className="flex items-center gap-1 text-lg text-mine-shaft-300 max-xs:text-base">
            <IconBriefcase className="h-5 w-5" stroke={1.5} /> Experience: {profile?.totalExp} Years
          </div>
        </>
      )}
    </>
  );
}

export function About() {
  const about = useAppStore((s) => s.profile?.about);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  const toggle = () => {
    if (!editing) setDraft(about ?? '');
    setEditing(!editing);
  };

  return (
    <section data-aos="fade-up">
      <SectionTitle
        actions={
          <EditControls
            editing={editing}
            onToggle={toggle}
            label="about"
            onSave={() => {
              void updateProfile({ about: draft }, 'About Updated Successfully');
              setEditing(false);
            }}
          />
        }
      >
        About
      </SectionTitle>
      {editing ? (
        <Textarea value={draft} onChange={(e) => setDraft(e.currentTarget.value)} autosize minRows={2} placeholder="Enter about yourself" aria-label="About" />
      ) : (
        <p className="text-justify text-sm text-mine-shaft-300">{about}</p>
      )}
    </section>
  );
}

export function Skills() {
  const skills = useAppStore((s) => s.profile?.skills);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<string[]>([]);

  const toggle = () => {
    if (!editing) setDraft(skills ?? []);
    setEditing(!editing);
  };

  return (
    <section data-aos="fade-up">
      <SectionTitle
        actions={
          <EditControls
            editing={editing}
            onToggle={toggle}
            label="skills"
            onSave={() => {
              void updateProfile({ skills: draft }, 'Skills Updated Successfully');
              setEditing(false);
            }}
          />
        }
      >
        Skills
      </SectionTitle>
      {editing ? (
        <TagsInput placeholder="Add skill" value={draft} onChange={setDraft} splitChars={[',', ' ', '|']} aria-label="Skills" />
      ) : (
        <div className="flex flex-wrap gap-2">
          {skills?.map((skill) => (
            <span key={skill} className="rounded-3xl bg-bright-sun-300/15 px-3 py-1 text-sm font-medium text-bright-sun-400">
              {skill}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
