'use client';

import { Avatar, Divider, FileInput, Overlay } from '@mantine/core';
import { useHover } from '@mantine/hooks';
import { IconEdit } from '@tabler/icons-react';
import Image from 'next/image';
import { errorNotification } from '@/lib/notifications';
import { fileToBase64, pictureSrc } from '@/lib/utils/file';
import { useAppStore } from '@/store/app-store-provider';
import { CertificationSection, ExperienceSection } from './ExperienceSection';
import { About, Info, Skills } from './ProfileSections';

const MAX_PICTURE_BYTES = 2 * 1024 * 1024;
const avatarClass =
  'h-48! w-48! rounded-full border-8 border-mine-shaft-950 max-md:h-40! max-md:w-40! max-sm:h-36! max-sm:w-36! max-xs:h-32! max-xs:w-32!';

/** The logged-in user's editable profile. Every edit goes through store.updateProfile(). */
export default function ProfileView() {
  const profile = useAppStore((s) => s.profile);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const { hovered, ref } = useHover();

  const changePicture = async (file: File | null) => {
    if (!file) return;
    if (file.size > MAX_PICTURE_BYTES) return errorNotification('Image too large', 'Please choose an image under 2 MB.');
    await updateProfile({ picture: await fileToBase64(file) }, 'Profile Picture Updated Successfully');
  };

  if (!profile) return <p className="min-h-[90vh] py-20 text-center text-mine-shaft-300">Loading profile…</p>;

  return (
    <div className="min-h-[90vh] bg-mine-shaft-950">
      <Divider mx="md" mb="xl" />
      <div className="mx-auto w-4/5 max-lg:w-full">
        <div data-aos="zoom-out" className="relative px-5">
          <Image className="h-auto w-full rounded-t-2xl max-xs:h-32" src="/Profile/banner.jpg" alt="" width={1200} height={300} priority />
          <div ref={ref} className="absolute -bottom-1/3 left-6 flex cursor-pointer items-center justify-center rounded-full max-md:-bottom-10 max-sm:-bottom-16" title="Change profile picture">
            <Avatar className={avatarClass} src={pictureSrc(profile.picture)} alt="Profile picture" />
            {hovered && <Overlay className="rounded-full!" color="#000" backgroundOpacity={0.75} />}
            {hovered && <IconEdit className="absolute z-[300] h-16! w-16!" />}
            {hovered && (
              <FileInput
                onChange={changePicture}
                className="absolute z-[301] h-full! w-full [&_*]:h-full! [&_*]:rounded-full!"
                variant="unstyled"
                accept="image/png,image/jpeg"
                aria-label="Upload profile picture"
              />
            )}
          </div>
        </div>
        <div className="mt-16 px-3 pt-2">
          <Info />
          <Divider my="xl" />
          <About />
          <Divider my="xl" />
          <Skills />
          <Divider my="xl" />
          <ExperienceSection />
          <Divider my="xl" />
          <CertificationSection />
        </div>
      </div>
    </div>
  );
}
