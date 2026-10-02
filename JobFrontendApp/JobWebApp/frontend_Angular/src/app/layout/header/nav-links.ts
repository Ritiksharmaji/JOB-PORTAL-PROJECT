import { AccountType } from '../../core/models';
import { APPLICANT_ROLES, EMPLOYER_ROLES } from '../../core/constants/roles';

export interface NavLink {
  name: string;
  url: string;
  roles: AccountType[];
}

/** Main navigation. Links are shown only to the roles that can open them. */
export const NAV_LINKS: NavLink[] = [
  { name: 'Find Jobs', url: '/find-jobs', roles: APPLICANT_ROLES },
  { name: 'Find Talent', url: '/find-talent', roles: EMPLOYER_ROLES },
  { name: 'Post Job', url: '/post-job/0', roles: EMPLOYER_ROLES },
  { name: 'Posted Jobs', url: '/posted-jobs/0', roles: EMPLOYER_ROLES },
  { name: 'Job History', url: '/job-history', roles: APPLICANT_ROLES },
];
