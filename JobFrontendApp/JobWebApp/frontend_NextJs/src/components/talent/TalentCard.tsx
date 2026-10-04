'use client';

import { Avatar, Button, Divider, Modal, Text } from '@mantine/core';
import { DateInput, TimeInput } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { IconCalendarMonth, IconHeart, IconMapPin } from '@tabler/icons-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getErrorMessage } from '@/lib/api/client';
import { jobApi, profileApi } from '@/lib/api/services';
import { errorNotification, successNotification } from '@/lib/notifications';
import { formatInterviewTime } from '@/lib/utils/date';
import { openPdf, pictureSrc } from '@/lib/utils/file';
import type { Applicant, ApplicationStatus, Profile } from '@/types';

/**
 * - `default` : talent search result (Profile + Message)
 * - `posted`  : new applicant of the employer's job (Profile + Schedule)
 * - `invited` : applicant in interview stage (Accept / Reject)
 * - `offered` : offered or rejected applicant (read-only)
 */
export type TalentCardMode = 'default' | 'posted' | 'invited' | 'offered';

const STATUS_MESSAGES: Record<ApplicationStatus, [string, string]> = {
  INTERVIEWING: ['Interview Scheduled', 'Interview has been scheduled successfully'],
  OFFERED: ['Offered', 'Offer has been sent successfully'],
  REJECTED: ['Rejected', 'Applicant has been rejected'],
  APPLIED: ['Updated', 'Application updated'],
};

interface TalentCardProps {
  /** A talent Profile (Find Talent) or an Applicant record of a posted job. */
  talent: Profile | Applicant;
  mode?: TalentCardMode;
  /** Job the applicant applied to (posted / invited modes). */
  jobId?: number;
  /** Called after the application status changed so the parent can reload. */
  onStatusChange?: () => void;
}

export default function TalentCard({ talent, mode = 'default', jobId, onStatusChange }: TalentCardProps) {
  const applicant = 'applicantId' in talent ? talent : null;
  const [fetched, setFetched] = useState<Profile | null>(null);
  const profile = applicant ? fetched : (talent as Profile);
  const [scheduleOpen, schedule] = useDisclosure(false);
  const [applicationOpen, application] = useDisclosure(false);
  const [date, setDate] = useState<string | null>(null); // Mantine 8 dates use "YYYY-MM-DD" strings
  const [time, setTime] = useState('');
  const [saving, setSaving] = useState(false);

  // Applicants only carry contact details — fetch their full profile.
  const applicantId = applicant?.applicantId;
  useEffect(() => {
    if (applicantId === undefined) return;
    let active = true;
    profileApi
      .getProfile(applicantId)
      .then((p) => active && setFetched(p))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [applicantId]);

  const changeStatus = async (status: ApplicationStatus) => {
    const id = profile?.id ?? applicantId;
    if (jobId === undefined || id === undefined) return;
    const interviewTime = status === 'INTERVIEWING' && date && time ? new Date(`${date}T${time}`).toISOString() : undefined;
    setSaving(true);
    try {
      await jobApi.changeApplicationStatus({ id: jobId, applicantId: id, applicationStatus: status, interviewTime });
      successNotification(...STATUS_MESSAGES[status]);
      schedule.close();
      onStatusChange?.();
    } catch (err) {
      errorNotification('Error', getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <article
      data-aos="fade-up"
      className="flex w-96 flex-col gap-3 rounded-xl bg-mine-shaft-900 p-4 transition duration-300 ease-in-out hover:shadow-[0_0_5px_1px] hover:shadow-bright-sun-400 max-bs:w-[48%] max-md:w-full"
    >
      <div className="flex justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-mine-shaft-800 p-2">
            <Avatar size="lg" src={pictureSrc(profile?.picture)} alt="" />
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-lg font-semibold">{talent.name}</div>
            <div className="text-sm text-mine-shaft-300">
              {profile?.jobTitle} &bull; {profile?.company}
            </div>
          </div>
        </div>
        <IconHeart className="text-mine-shaft-300" stroke={1.5} />
      </div>

      <div className="flex flex-wrap gap-2">
        {profile?.skills?.slice(0, 4).map((skill) => (
          <div key={skill} className="rounded-lg bg-mine-shaft-800 p-2 py-1 text-xs text-bright-sun-400">
            {skill}
          </div>
        ))}
      </div>

      <Text className="text-justify text-xs! text-mine-shaft-300!" lineClamp={3}>
        {profile?.about}
      </Text>

      <Divider color="mineShaft.7" size="xs" />
      {mode === 'invited' ? (
        <div className="flex items-center gap-1 text-sm text-mine-shaft-200">
          <IconCalendarMonth stroke={1.5} /> Interview: {formatInterviewTime(applicant?.interviewTime)}
        </div>
      ) : (
        <div className="flex justify-between">
          <div className="font-medium text-mine-shaft-200">Exp: {profile?.totalExp || 1} Years</div>
          <div className="flex items-center gap-1 text-xs text-mine-shaft-400">
            <IconMapPin className="h-5 w-5" /> {profile?.location}
          </div>
        </div>
      )}
      <Divider color="mineShaft.7" size="xs" />

      <div className="flex gap-2">
        {mode === 'invited' ? (
          <>
            <Button onClick={() => changeStatus('OFFERED')} color="brightSun.4" variant="outline" fullWidth>
              Accept
            </Button>
            <Button onClick={() => changeStatus('REJECTED')} color="brightSun.4" variant="light" fullWidth>
              Reject
            </Button>
          </>
        ) : (
          <>
            <Button component={Link} href={`/talent-profile/${profile?.id ?? applicantId}`} color="brightSun.4" variant="outline" fullWidth>
              Profile
            </Button>
            {mode === 'posted' ? (
              <Button color="brightSun.4" variant="light" onClick={schedule.open} rightSection={<IconCalendarMonth className="h-5 w-5" />} fullWidth>
                Schedule
              </Button>
            ) : (
              <Button color="brightSun.4" variant="light" fullWidth>
                Message
              </Button>
            )}
          </>
        )}
      </div>
      {applicant && (
        <Button color="brightSun.4" variant="filled" onClick={application.open} autoContrast fullWidth>
          View Application
        </Button>
      )}

      <Modal opened={scheduleOpen} onClose={schedule.close} radius="lg" title="Schedule Interview" centered>
        <div className="flex flex-col gap-4">
          <DateInput value={date} onChange={setDate} minDate={new Date()} label="Date" placeholder="Enter Date" withAsterisk />
          <TimeInput label="Time" value={time} onChange={(e) => setTime(e.currentTarget.value)} withAsterisk />
          <Button onClick={() => changeStatus('INTERVIEWING')} disabled={!date || !time} loading={saving} color="brightSun.4" variant="light" fullWidth>
            Schedule
          </Button>
        </div>
      </Modal>

      {applicant && (
        <Modal opened={applicationOpen} onClose={application.close} radius="lg" title="Application" centered>
          <dl className="flex flex-col gap-4 text-sm">
            <div className="flex gap-4">
              <dt className="w-24 shrink-0">Email:</dt>
              <dd>
                <a className="text-bright-sun-400 hover:underline" href={`mailto:${applicant.email}`}>
                  {applicant.email}
                </a>
              </dd>
            </div>
            <div className="flex gap-4">
              <dt className="w-24 shrink-0">Website:</dt>
              <dd>
                <a className="break-all text-bright-sun-400 hover:underline" target="_blank" rel="noopener noreferrer" href={applicant.website}>
                  {applicant.website}
                </a>
              </dd>
            </div>
            <div className="flex gap-4">
              <dt className="w-24 shrink-0">Resume:</dt>
              <dd>
                <button type="button" className="text-bright-sun-400 hover:underline" onClick={() => openPdf(applicant.resume)}>
                  {applicant.name}
                </button>
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt>Cover Letter:</dt>
              <dd className="whitespace-pre-wrap text-mine-shaft-300">{applicant.coverLetter}</dd>
            </div>
          </dl>
        </Modal>
      )}
    </article>
  );
}
