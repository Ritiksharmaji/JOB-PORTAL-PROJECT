'use client';

import { Avatar, Button, Divider } from '@mantine/core';
import { IconBriefcase, IconMapPin } from '@tabler/icons-react';
import Image from 'next/image';
import { CertificationItem, ExperienceItem } from '@/components/profile/ProfileItems';
import BackButton from '@/components/shared/BackButton';
import { useApi } from '@/hooks/useApi';
import { profileApi } from '@/lib/api/services';
import { pictureSrc } from '@/lib/utils/file';
import TalentCard from './TalentCard';

const avatarClass =
  'h-48! w-48! rounded-full border-8 border-mine-shaft-950 max-md:h-40! max-md:w-40! max-sm:h-36! max-sm:w-36! max-xs:h-32! max-xs:w-32!';

/** Employer view of a candidate profile, with recommended talents alongside. */
export default function TalentProfileView({ id }: { id: string }) {
  const { data: profile } = useApi(() => profileApi.getProfile(id), [id], { overlay: true });
  const { data: talents } = useApi(() => profileApi.getAllProfiles(), []);
  const recommended = (talents ?? []).filter((t) => String(t.id) !== id).slice(0, 4);

  return (
    <div className="min-h-[90vh] bg-mine-shaft-950 p-4">
      <Divider size="xs" mx="md" />
      <BackButton className="my-3" />
      <div className="flex gap-5 max-lg:flex-wrap">
        {profile && (
          <article data-aos="zoom-out" className="w-2/3 max-lg:w-full">
            <div className="relative">
              <Image className="h-auto w-full rounded-t-2xl max-xl:h-40 max-xs:h-32" src="/Profile/banner.jpg" alt="" width={1200} height={300} />
              <div className="absolute -bottom-1/3 left-6 max-md:-bottom-10 max-sm:-bottom-16">
                <Avatar className={avatarClass} src={pictureSrc(profile.picture)} alt={profile.name} />
              </div>
            </div>
            <div className="mt-16 px-3">
              <div className="flex justify-between text-3xl font-semibold max-xs:text-2xl">
                {profile.name}
                <Button color="brightSun.4" variant="light">
                  Message
                </Button>
              </div>
              <div className="flex items-center gap-1 text-xl max-xs:text-base">
                <IconBriefcase className="h-5 w-5" stroke={1.5} /> {profile.jobTitle} &bull; {profile.company}
              </div>
              <div className="flex items-center gap-1 text-lg text-mine-shaft-300 max-xs:text-base">
                <IconMapPin className="h-5 w-5" stroke={1.5} /> {profile.location}
              </div>
              <div className="flex items-center gap-1 text-lg text-mine-shaft-300 max-xs:text-base">
                <IconBriefcase className="h-5 w-5" stroke={1.5} /> Experience: {profile.totalExp} Years
              </div>

              <Divider my="xl" />
              <h2 className="mb-3 text-2xl font-semibold">About</h2>
              <p className="text-justify text-sm text-mine-shaft-300">{profile.about}</p>

              <Divider my="xl" />
              <h2 className="mb-3 text-2xl font-semibold">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {profile.skills?.map((skill) => (
                  <span key={skill} className="rounded-3xl bg-bright-sun-300/15 px-3 py-1 text-sm font-medium text-bright-sun-400">
                    {skill}
                  </span>
                ))}
              </div>

              <Divider my="xl" />
              <h2 className="mb-4 text-2xl font-semibold">Experience</h2>
              <div className="flex flex-col gap-8">
                {profile.experiences?.map((exp, i) => <ExperienceItem key={i} experience={exp} />)}
              </div>

              <Divider my="xl" />
              <h2 className="mb-4 text-2xl font-semibold">Certifications</h2>
              <div className="flex flex-col gap-8">
                {profile.certifications?.map((cert, i) => <CertificationItem key={i} certification={cert} />)}
              </div>
            </div>
          </article>
        )}
        <aside data-aos="zoom-out">
          <h2 className="mb-5 text-xl font-semibold">Recommended Talent</h2>
          <div className="flex flex-col gap-5">
            {recommended.map((talent) => (
              <TalentCard key={talent.id} talent={talent} />
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
