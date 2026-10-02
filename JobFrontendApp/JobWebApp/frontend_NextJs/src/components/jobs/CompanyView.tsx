'use client';

import { ActionIcon, Avatar, Divider, Tabs } from '@mantine/core';
import { IconExternalLink, IconMapPin } from '@tabler/icons-react';
import Image from 'next/image';
import Link from 'next/link';
import BackButton from '@/components/shared/BackButton';
import CompanyLogo from '@/components/shared/CompanyLogo';
import TalentCard from '@/components/talent/TalentCard';
import { COMPANY_DETAILS, SIMILAR_COMPANIES } from '@/data/company';
import { useApi } from '@/hooks/useApi';
import { jobApi, profileApi } from '@/lib/api/services';
import JobCard from './JobCard';
import { tabListClass } from './JobHistoryView';

/**
 * Company page. "Jobs" and "Employees" are real jobs / profiles whose company
 * matches the URL; the About section is static demo content.
 */
export default function CompanyView({ name }: { name: string }) {
  const { data: jobs } = useApi(() => jobApi.getAllJobs(), [], { overlay: true });
  const { data: profiles } = useApi(() => profileApi.getAllProfiles(), []);
  const matches = (company?: string) => company?.toLowerCase() === name.toLowerCase();

  const companyJobs = (jobs ?? []).filter((j) => j.jobStatus === 'ACTIVE' && matches(j.company));
  const employees = (profiles ?? []).filter((p) => matches(p.company)).slice(0, 6);

  return (
    <div className="min-h-[90vh] bg-mine-shaft-950 p-4">
      <Divider />
      <BackButton />
      <div className="flex justify-between gap-5 max-lg:flex-wrap">
        <div className="w-3/4 max-lg:w-full">
          <div className="relative">
            <Image className="h-auto w-full rounded-t-2xl" src="/Profile/banner.jpg" alt="" width={1200} height={300} />
            <div className="absolute -bottom-1/4 left-5 rounded-3xl border-8 border-mine-shaft-950 bg-mine-shaft-950 p-2">
              <CompanyLogo name={name} className="h-28 w-28 max-md:h-16 max-md:w-16" />
            </div>
          </div>
          <div className="mt-12 px-7">
            <div className="flex justify-between text-3xl font-semibold">
              {name}
              <Avatar.Group>
                <Avatar src="/avatar.png" />
                <Avatar src="/avatar1.png" />
                <Avatar src="/avatar2.png" />
                <Avatar className="[&>span]:text-xs!">+10k</Avatar>
              </Avatar.Group>
            </div>
            <div className="flex items-center gap-1 text-lg text-mine-shaft-300">
              <IconMapPin className="h-5 w-5" stroke={1.5} /> New York, United States
            </div>
          </div>
          <Divider my="xl" />
          <Tabs variant="outline" radius="md" defaultValue="about">
            <Tabs.List className={tabListClass}>
              <Tabs.Tab value="about">About</Tabs.Tab>
              <Tabs.Tab value="jobs">Jobs</Tabs.Tab>
              <Tabs.Tab value="employees">Employees</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="about">
              <div className="flex flex-col gap-5">
                {COMPANY_DETAILS.map((item) => (
                  <div key={item.title}>
                    <h3 className="mb-3 text-xl font-semibold">{item.title}</h3>
                    {item.link ? (
                      <a className="text-sm text-bright-sun-400 hover:text-bright-sun-300" href={String(item.value)} target="_blank" rel="noopener noreferrer">
                        {item.value}
                      </a>
                    ) : Array.isArray(item.value) ? (
                      <div className="text-justify text-sm text-mine-shaft-300">
                        {item.value.map((s) => (
                          <span key={s}> &bull; {s}</span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-justify text-sm text-mine-shaft-300">{item.value}</p>
                    )}
                  </div>
                ))}
              </div>
            </Tabs.Panel>
            <Tabs.Panel value="jobs">
              <div className="mt-10 flex flex-wrap gap-5">
                {companyJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
                {jobs && companyJobs.length === 0 && <p className="text-lg font-medium">No open jobs at {name} right now.</p>}
              </div>
            </Tabs.Panel>
            <Tabs.Panel value="employees">
              <div className="mt-10 flex flex-wrap gap-10">
                {employees.map((person) => (
                  <TalentCard key={person.id} talent={person} />
                ))}
                {profiles && employees.length === 0 && <p className="text-lg font-medium">No employees listed yet.</p>}
              </div>
            </Tabs.Panel>
          </Tabs>
        </div>

        <aside className="w-1/4 max-lg:w-full">
          <h2 className="mb-5 text-xl font-semibold">Similar Companies</h2>
          <div className="flex flex-col gap-5">
            {SIMILAR_COMPANIES.filter((c) => !matches(c.name)).map((company) => (
              <div key={company.name} className="flex items-center justify-between rounded-lg bg-mine-shaft-900 p-2">
                <div className="flex items-center gap-2">
                  <div className="rounded-md bg-mine-shaft-800 p-2">
                    <CompanyLogo name={company.name} />
                  </div>
                  <div>
                    <div className="font-semibold">{company.name}</div>
                    <div className="text-xs text-mine-shaft-300">{company.employees.toLocaleString()} Employees</div>
                  </div>
                </div>
                <ActionIcon component={Link} href={`/company/${company.name}`} variant="subtle" color="brightSun.4" aria-label={`Open ${company.name}`}>
                  <IconExternalLink />
                </ActionIcon>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
