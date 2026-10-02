import api from '../api/client';

// GET /notification/get/{userId} -> Notification[] (unread)
export const getNotifications = async (userId) => {
  const res = await api.get(`/notification/get/${userId}`);
  return res.data;
};

// PUT /notification/read/{id} -> ResponseDTO
export const readNotification = async (id) => {
  const res = await api.put(`/notification/read/${id}`);
  return res.data;
};
