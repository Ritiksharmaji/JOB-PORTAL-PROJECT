/** Client-side search criteria shared by Find Jobs and Find Talent. */
export interface SearchFilter {
  jobTitle?: string[];
  location?: string[];
  experience?: string[];
  jobType?: string[];
  skills?: string[];
  /** Salary range in LPA (Find Jobs). */
  salary?: [number, number];
  /** Experience range in years (Find Talent). */
  exp?: [number, number];
  /** Talent name search (Find Talent). */
  name?: string;
}

/** Keys of SearchFilter that hold multi-select string lists. */
export type MultiFilterKey = 'jobTitle' | 'location' | 'experience' | 'jobType' | 'skills';

export type JobSort = 'Relevance' | 'Most Recent' | 'Salary: Low to High' | 'Salary: High to Low';
export type TalentSort = 'Relevance' | 'Experience: Low to High' | 'Experience: High to Low';
export type SortOption = JobSort | TalentSort;
