import request from 'supertest';
import { createApp } from '../src/app.js';

export const app = createApp();
export const api = () => request(app);

export const PASSWORD = 'Test@1234';

/** Registers a user and returns its id, profileId and a JWT. */
export async function createUser(name: string, accountType: 'APPLICANT' | 'EMPLOYER' | 'ADMIN') {
  const email = `${name.toLowerCase().replace(/\s+/g, '.')}@jobhook.test`;
  const reg = await api().post('/users/register').send({ name, email, password: PASSWORD, accountType });
  if (reg.status !== 201) throw new Error(`register failed: ${reg.status} ${JSON.stringify(reg.body)}`);
  const login = await api().post('/auth/login').send({ email, password: PASSWORD });
  return { id: reg.body.id as number, profileId: reg.body.profileId as number, email, token: login.body.jwt as string };
}

export const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });
