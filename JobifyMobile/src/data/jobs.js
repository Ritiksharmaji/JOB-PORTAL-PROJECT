// Sample data carried over from the web job portal.

export const JOBS = [
  { id: 0, jobTitle: 'Product Designer', company: 'Meta', applicants: 25, experience: 'Entry Level', jobType: 'Full-Time', location: 'New York', pkg: '32 LPA', days: 12, description: "Meta is seeking a Product Designer to design user-centric interfaces for our platform. A great opportunity for entry-level designers to grow in a dynamic environment." },
  { id: 1, jobTitle: 'Sr. UX Designer', company: 'Netflix', applicants: 14, experience: 'Expert', jobType: 'Part-Time', location: 'San Francisco', pkg: '40 LPA', days: 5, description: "Netflix is looking for a Sr. UX Designer to enhance the streaming experience. Ideal candidates have deep experience in user research and interaction design." },
  { id: 2, jobTitle: 'Product Designer', company: 'Microsoft', applicants: 58, experience: 'Intermediate', jobType: 'Full-Time', location: 'Remote', pkg: '35 LPA', days: 4, description: "Join Microsoft as a Product Designer and create intuitive, compelling experiences. This is a remote position offering flexibility and growth." },
  { id: 3, jobTitle: 'Product Designer', company: 'Adobe', applicants: 23, experience: 'Expert', jobType: 'Part-Time', location: 'Toronto', pkg: '33 LPA', days: 22, description: "Adobe seeks a part-time Product Designer to enhance our user experience. Perfect for experienced designers looking for flexible hours." },
  { id: 4, jobTitle: 'Backend Developer', company: 'Google', applicants: 21, experience: 'Entry Level', jobType: 'Full-Time', location: 'Bangalore', pkg: '38 LPA', days: 8, description: "Google is hiring a Backend Developer to build scalable backend systems that power our services. Strong problem-solving skills required." },
  { id: 5, jobTitle: 'SMM Manager', company: 'Spotify', applicants: 73, experience: 'Intermediate', jobType: 'Full-Time', location: 'Delhi', pkg: '34 LPA', days: 8, description: "Spotify is looking for an SMM Manager to lead social media marketing. Create campaigns, engage audiences and drive growth for our music service." },
  { id: 6, jobTitle: 'Frontend Developer', company: 'Amazon', applicants: 50, experience: 'Intermediate', jobType: 'Full-Time', location: 'Seattle', pkg: '36 LPA', days: 10, description: "Amazon is looking for a Frontend Developer to build customer-facing applications with a dynamic team, creating seamless, responsive web apps." },
  { id: 7, jobTitle: 'iOS Developer', company: 'Apple', applicants: 30, experience: 'Expert', jobType: 'Full-Time', location: 'Cupertino', pkg: '42 LPA', days: 7, description: "Apple is seeking an iOS Developer to build cutting-edge applications for iOS devices, ensuring high performance and exceptional user experience." },
];

export const jobById = (id) => JOBS.find((j) => j.id === id) || JOBS[0];
export const agoText = (job) => `${job.days}d ago`;

export const CATEGORIES = [
  { name: 'Design', letter: 'D', count: '1.2k' },
  { name: 'Development', letter: '</>', count: '2.4k' },
  { name: 'Marketing', letter: 'M', count: '845' },
  { name: 'Finance', letter: '$', count: '530' },
  { name: 'Sales', letter: 'S', count: '670' },
  { name: 'Writing', letter: 'W', count: '410' },
];

export const REQUIRED_SKILLS = ['React', 'Spring Boot', 'Java', 'Python', 'Node.js', 'MongoDB', 'Express', 'PostgreSQL'];

// Applied jobs (with status) for the "My Jobs" screen.
export const APPLIED = [
  { jobId: 0, status: 'Interviewing', date: '2d ago' },
  { jobId: 4, status: 'Applied', date: '5d ago' },
  { jobId: 7, status: 'Offered', date: '1w ago' },
];

export const statusStyle = (st) => {
  if (st === 'Offered' || st === 'Shortlisted') return { color: '#34d399', bg: 'rgba(52,211,153,0.12)' };
  if (st === 'Interviewing' || st === 'Interview') return { color: '#ffbd20', bg: 'rgba(255,189,32,0.12)' };
  if (st === 'Rejected') return { color: '#f87171', bg: 'rgba(248,113,113,0.12)' };
  return { color: '#b0b0b0', bg: '#454545' };
};
