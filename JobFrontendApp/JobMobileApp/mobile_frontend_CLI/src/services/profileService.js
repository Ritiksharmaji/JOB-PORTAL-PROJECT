import api from '../api/client';

// GET /profiles/get/{id} -> ProfileDTO
export const getProfile = async (id) => {
  const res = await api.get(`/profiles/get/${id}`);
  return res.data;
};

// GET /profiles/getAll -> ProfileDTO[]  (Find Talent)
export const getAllProfiles = async () => {
  const res = await api.get('/profiles/getAll');
  return res.data;
};

// PUT /profiles/update  body full ProfileDTO -> updated ProfileDTO
export const updateProfile = async (profile) => {
  const res = await api.put('/profiles/update', profile);
  return res.data;
};
