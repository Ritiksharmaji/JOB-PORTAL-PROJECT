import type { ReactNode } from 'react';
import CompanyLogo from '@/components/shared/CompanyLogo';
import { formatMonthYear } from '@/lib/utils/date';
import type { Certification, Experience } from '@/types';

/** Read-only experience entry (talent profile + own profile list). */
export function ExperienceItem({ experience: e, children }: { experience: Experience; children?: ReactNode }) {
  return (
    <div data-aos="fade-up" className="flex flex-col gap-2">
      <div className="flex flex-wrap justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="rounded-md bg-mine-shaft-800 p-2">
            <CompanyLogo name={e.company} />
          </div>
          <div className="flex flex-col">
            <div className="font-semibold">{e.title}</div>
            <div className="text-sm text-mine-shaft-300">
              {e.company} &bull; {e.location}
            </div>
          </div>
        </div>
        <div className="text-sm text-mine-shaft-300">
          {formatMonthYear(e.startDate)} - {e.working ? 'Present' : formatMonthYear(e.endDate)}
        </div>
      </div>
      <p className="text-justify text-sm text-mine-shaft-300 max-xs:text-xs">{e.description}</p>
      {children}
    </div>
  );
}

/** Read-only certification entry; `children` renders e.g. a delete button. */
export function CertificationItem({ certification: c, children }: { certification: Certification; children?: ReactNode }) {
  return (
    <div data-aos="fade-up" className="flex flex-wrap justify-between gap-2">
      <div className="flex items-center gap-2">
        <div className="shrink-0 rounded-md bg-mine-shaft-800 p-2">
          <CompanyLogo name={c.issuer} />
        </div>
        <div className="flex flex-col">
          <div className="font-semibold max-xs:text-sm">{c.name}</div>
          <div className="text-sm text-mine-shaft-300 max-xs:text-xs">{c.issuer}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex flex-col items-end max-sm:flex-row max-sm:gap-2">
          <div className="text-sm text-mine-shaft-300 max-xs:text-xs">Issued {formatMonthYear(c.issueDate)}</div>
          <div className="text-sm text-mine-shaft-300 max-xs:text-xs">ID: {c.certificateId}</div>
        </div>
        {children}
      </div>
    </div>
  );
}
