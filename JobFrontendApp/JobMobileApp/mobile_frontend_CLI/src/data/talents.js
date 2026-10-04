export const TALENTS = [
  { id: 0, name: 'Jarrod Wood', role: 'Software Engineer', company: 'Google', topSkills: ['React', 'SpringBoot', 'MongoDB'], expectedCtc: '₹48 - 60 LPA', location: 'New York, US', avatar: 'avatar', about: "Software Engineer at Google specializing in scalable, high-performance applications. Strong foundation in React and SpringBoot with a focus on MongoDB for database solutions." },
  { id: 1, name: 'Alice Johnson', role: 'Frontend Developer', company: 'Meta', topSkills: ['HTML', 'CSS', 'JavaScript'], expectedCtc: '₹40 - 55 LPA', location: 'San Francisco, US', avatar: 'avatar1', about: "Frontend Developer creating visually appealing, highly interactive web applications. Expertise in HTML, CSS and JavaScript for responsive, user-friendly interfaces." },
  { id: 2, name: 'Bob Smith', role: 'Backend Developer', company: 'Amazon', topSkills: ['Node.js', 'Express', 'MySQL'], expectedCtc: '₹50 - 65 LPA', location: 'Seattle, US', avatar: 'avatar', about: "Backend Developer specializing in server-side development and database management. Builds robust, scalable APIs with Node.js and Express." },
  { id: 3, name: 'Diana Prince', role: 'UX/UI Designer', company: 'Adobe', topSkills: ['Figma', 'Sketch', 'InVision'], expectedCtc: '₹35 - 50 LPA', location: 'Los Angeles, US', avatar: 'avatar2', about: "UX/UI Designer crafting visually compelling, user-centric designs. Expertise in Figma, Sketch and InVision to create intuitive interfaces." },
  { id: 4, name: 'Charlie Brown', role: 'Full Stack Developer', company: 'Microsoft', topSkills: ['Python', 'Django', 'React'], expectedCtc: '₹45 - 60 LPA', location: 'Redmond, US', avatar: 'avatar', about: "Full Stack Developer building end-to-end web solutions. Python and Django on the backend with React on the frontend for cohesive applications." },
  { id: 5, name: 'Fiona Gallagher', role: 'DevOps Engineer', company: 'Netflix', topSkills: ['Docker', 'Kubernetes', 'AWS'], expectedCtc: '₹50 - 65 LPA', location: 'Los Gatos, US', avatar: 'avatar1', about: "DevOps Engineer automating infrastructure and optimizing deployments. Expert in Docker, Kubernetes and AWS for scalable cloud environments." },
];

export const talentById = (id) => TALENTS.find((t) => t.id === id) || TALENTS[0];

// Applicants shown on an employer's posted-job detail.
export const APPLICANTS = [
  { talentId: 0, status: 'New' },
  { talentId: 1, status: 'Shortlisted' },
  { talentId: 3, status: 'Interview' },
  { talentId: 4, status: 'New' },
];
