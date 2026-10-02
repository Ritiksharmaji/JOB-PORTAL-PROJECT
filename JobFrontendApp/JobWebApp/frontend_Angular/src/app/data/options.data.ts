import { MultiFilterKey } from '../core/models';
import { IconName } from '../shared/ui/icon/icons';

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
  icon: IconName;
  options: string[];
}

export const JOB_FILTER_FIELDS: FilterField[] = [
  { key: 'jobTitle', title: 'Job Title', icon: 'search', options: JOB_TITLES },
  { key: 'location', title: 'Location', icon: 'map-pin', options: LOCATIONS },
  { key: 'experience', title: 'Experience', icon: 'briefcase', options: EXPERIENCE_LEVELS },
  { key: 'jobType', title: 'Job Type', icon: 'recharging', options: JOB_TYPES },
];

export const TALENT_FILTER_FIELDS: FilterField[] = [
  { key: 'jobTitle', title: 'Job Title', icon: 'search', options: JOB_TITLES },
  { key: 'location', title: 'Location', icon: 'map-pin', options: LOCATIONS },
  { key: 'skills', title: 'Skills', icon: 'recharging', options: SKILLS },
];

/** Info strip on the job description page. */
export const JOB_FACTS: { name: string; icon: IconName; key: 'location' | 'experience' | 'packageOffered' | 'jobType' }[] = [
  { name: 'Location', icon: 'map-pin', key: 'location' },
  { name: 'Experience', icon: 'briefcase', key: 'experience' },
  { name: 'Salary', icon: 'premium-rights', key: 'packageOffered' },
  { name: 'Job Type', icon: 'recharging', key: 'jobType' },
];

/** Default rich-text template for a new job description. */
export const JOB_DESCRIPTION_TEMPLATE =
  '<h4>About The Job</h4><p>Write description here...</p><h4>Responsibilities</h4><ul><li>Add responsibilities here...</li></ul><h4>Qualifications and Skill Sets</h4><ul><li>Add required qualification and skill set here...</li></ul>';
