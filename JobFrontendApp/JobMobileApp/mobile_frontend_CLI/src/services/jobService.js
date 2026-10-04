import api from '../api/client';

// POST /jobs/post  — create OR edit a job; also used to close (pass {...job, jobStatus:'CLOSED'}).
export const postJob = async (job) => {
  const res = await api.post('/jobs/post', job);
  return res.data;
};

// GET /jobs/getAll -> JobDTO[]
export const getAllJobs = async () => {
  const res = await api.get('/jobs/getAll');
  return res.data;
};

// GET /jobs/get/{id} -> JobDTO
export const getJob = async (id) => {
  const res = await api.get(`/jobs/get/${id}`);
  return res.data;
};

// POST /jobs/apply/{id}  body ApplicantDTO -> ResponseDTO
export const applyJob = async (id, application) => {
  const res = await api.post(`/jobs/apply/${id}`, application);
  return res.data;
};

// GET /jobs/postedBy/{id} -> JobDTO[] (employer's own jobs)
export const getJobsPostedBy = async (id) => {
  const res = await api.get(`/jobs/postedBy/${id}`);
  return res.data;
};

// GET /jobs/history/{id}/{status} -> JobDTO[]
export const getHistory = async (id, status) => {
  const res = await api.get(`/jobs/history/${id}/${status}`);
  return res.data;
};

// POST /jobs/changeAppStatus  body { id (jobId), applicantId, applicationStatus, interviewTime? }
export const changeAppStatus = async (application) => {
  const res = await api.post('/jobs/changeAppStatus', application);
  return res.data;
};
