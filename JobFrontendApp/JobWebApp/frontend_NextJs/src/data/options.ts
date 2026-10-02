import { IconBriefcase, IconMapPin, IconPremiumRights, IconRecharging, IconSearch, type Icon } from '@tabler/icons-react';
import type { MultiFilterKey } from '@/types';

/** Dropdown option lists shared by filters and forms. */

export const JOB_TITLES = [
  'Designer', 'Developer', 'Product Manager', 'Marketing Specialist',
  'Data Analyst', 'Sales Executive', 'Content Writer', 'Customer Support',
];
export const COMPANY_NAMES = ['Google', 'Microsoft', 'Meta', 'Netflix', 'Adobe', 'Facebook', 'Amazon', 'Apple', 'Spotify'];
export const LOCATIONS = ['Delhi', 'New York', 'San Francisco', 'London', 'Berlin', 'Tokyo', 'Sydney', 'Toronto'];
export const EXPERIENCE_LEVELS = ['Entry Level', 'Intermediate', 'Expert'];
export const JOB_TYPES = ['Full Time', 'Part Time', 'Contract', 'Freelance', 'Internship'];
export const SKILLS = [
  'HTML', 'CSS', 'JavaScript', 'React', 'Angular', 'Node.js', 'Python', 'Java', 'Ruby', 'PHP', 'SQL',
  'MongoDB', 'PostgreSQL', 'Git', 'API Development', 'Testing and Debugging', 'Agile Methodologies',
  'DevOps', 'AWS', 'Azure', 'Google Cloud',
];

export interface FilterField {
  key: MultiFilterKey;
  title: string;
  icon: Icon;
  options: string[];
}

export const JOB_FILTER_FIELDS: FilterField[] = [
  { key: 'jobTitle', title: 'Job Title', icon: IconSearch, options: JOB_TITLES },
  { key: 'location', title: 'Location', icon: IconMapPin, options: LOCATIONS },
  { key: 'experience', title: 'Experience', icon: IconBriefcase, options: EXPERIENCE_LEVELS },
  { key: 'jobType', title: 'Job Type', icon: IconRecharging, options: JOB_TYPES },
];

export const TALENT_FILTER_FIELDS: FilterField[] = [
  { key: 'jobTitle', title: 'Job Title', icon: IconSearch, options: JOB_TITLES },
  { key: 'location', title: 'Location', icon: IconMapPin, options: LOCATIONS },
  { key: 'skills', title: 'Skills', icon: IconRecharging, options: SKILLS },
];

/** Info strip on the job description page. */
export const JOB_FACTS: { name: string; icon: Icon; key: 'location' | 'experience' | 'packageOffered' | 'jobType' }[] = [
  { name: 'Location', icon: IconMapPin, key: 'location' },
  { name: 'Experience', icon: IconBriefcase, key: 'experience' },
  { name: 'Salary', icon: IconPremiumRights, key: 'packageOffered' },
  { name: 'Job Type', icon: IconRecharging, key: 'jobType' },
];

/** Default rich-text template for a new job description. */
export const JOB_DESCRIPTION_TEMPLATE =
  '<h4>About The Job</h4><p>Write description here...</p><h4>Responsibilities</h4><ul><li>Add responsibilities here...</li></ul><h4>Qualifications and Skill Sets</h4><ul><li>Add required qualification and skill set here...</li></ul>';
