export interface Experience {
  title: string;
  company: string;
  location: string;
  description: string;
  startDate: string;
  endDate: string;
  working: boolean;
}

export interface Certification {
  name: string;
  issuer: string;
  issueDate: string;
  certificateId: string;
}

export interface Profile {
  id: number;
  name: string;
  email: string;
  jobTitle?: string;
  company?: string;
  location?: string;
  about?: string;
  /** Base64 encoded image (no data: prefix). */
  picture?: string;
  totalExp?: number;
  skills?: string[];
  experiences?: Experience[];
  certifications?: Certification[];
  savedJobs?: number[];
}
