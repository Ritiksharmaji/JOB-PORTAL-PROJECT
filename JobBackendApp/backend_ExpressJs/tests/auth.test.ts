import jwt from 'jsonwebtoken';
import { describe, expect, it } from 'vitest';
import { env } from '../src/config/env.js';
import { Otp } from '../src/models/otp.model.js';
import { PASSWORD, api, bearer, createUser } from './helpers.js';

describe('registration & login', () => {
  it('registers a user with a profile and hides the password', async () => {
    const res = await api()
      .post('/users/register')
      .send({ name: 'Asha Rao', email: 'asha@jobhook.test', password: PASSWORD, accountType: 'APPLICANT' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ name: 'Asha Rao', email: 'asha@jobhook.test', password: null, accountType: 'APPLICANT' });
    expect(res.body.id).toBeTypeOf('number');

    const login = await api().post('/auth/login').send({ email: 'asha@jobhook.test', password: PASSWORD });
    const profile = await api().get(`/profiles/get/${res.body.profileId}`).set(bearer(login.body.jwt));
    expect(profile.status).toBe(200);
    expect(profile.body).toMatchObject({ name: 'Asha Rao', skills: [], experiences: [], certifications: [] });
  });

  it('rejects a duplicate email with the Spring message', async () => {
    const res = await api()
      .post('/users/register')
      .send({ name: 'Asha', email: 'asha@jobhook.test', password: PASSWORD, accountType: 'APPLICANT' });
    expect(res.status).toBe(409);
    expect(res.body).toMatchObject({ errorMessage: 'Email registered already.', errorCode: 409 });
  });

  it('validates input like Spring (messages joined with ", ")', async () => {
    const res = await api().post('/users/register').send({ name: '', email: 'not-an-email', password: 'weak' });
    expect(res.status).toBe(400);
    expect(res.body.errorMessage).toBe('Name is null or empty., Email is invalid., Password is invalid.');
  });

  it('issues an HS512 JWT with the same claims as Spring, valid for 10 hours', async () => {
    const res = await api().post('/auth/login').send({ email: 'asha@jobhook.test', password: PASSWORD });
    expect(res.status).toBe(200);
    // Spring/jjwt treat JWT_SECRET as Base64 — verifying with that key proves compatibility.
    const claims = jwt.verify(res.body.jwt, Buffer.from(env.jwtSecret, 'base64'), { algorithms: ['HS512'] }) as jwt.JwtPayload;
    expect(claims).toMatchObject({ sub: 'asha@jobhook.test', name: 'Asha Rao', accountType: 'APPLICANT' });
    expect(claims.id).toBeTypeOf('number');
    expect(claims.profileId).toBeTypeOf('number');
    expect(claims.exp! - claims.iat!).toBe(36_000);
  });

  it('returns a clear message for wrong credentials (not 401, which means "session expired" to the frontends)', async () => {
    const res = await api().post('/auth/login').send({ email: 'asha@jobhook.test', password: 'Wrong@1234' });
    expect(res.status).toBe(400);
    expect(res.body.errorMessage).toBe('Invalid Credentials.');
  });

  it('requires a valid token on protected routes', async () => {
    expect((await api().get('/jobs/getAll')).status).toBe(401);
    expect((await api().get('/jobs/getAll').set(bearer('garbage'))).status).toBe(401);
  });
});

describe('password reset with OTP', () => {
  it('only allows changing the password after the OTP was verified', async () => {
    const user = await createUser('Reset User', 'APPLICANT');
    const newPassword = 'New@12345';

    expect((await api().post(`/users/sendOtp/${user.email}`)).status).toBe(200);
    const otp = (await Otp.findById(user.email).lean())!.otpCode;

    // Without verification the reset is refused (the Spring version allowed it).
    const early = await api().post('/users/changePass').send({ email: user.email, password: newPassword });
    expect(early.status).toBe(400);

    const wrong = await api().get(`/users/verifyOtp/${user.email}/${otp === '000000' ? '111111' : '000000'}`);
    expect(wrong.body.errorMessage).toBe('OTP is incorrect.');

    const verified = await api().get(`/users/verifyOtp/${user.email}/${otp}`);
    expect(verified.status).toBe(202);

    const changed = await api().post('/users/changePass').send({ email: user.email, password: newPassword });
    expect(changed.status).toBe(200);
    expect(await Otp.findById(user.email)).toBeNull(); // one-time use

    expect((await api().post('/auth/login').send({ email: user.email, password: newPassword })).status).toBe(200);

    const notes = await api().get(`/notification/get/${user.id}`).set(bearer(user.token));
    expect(notes.body.map((n: { action: string }) => n.action)).toContain('Password Reset');
  });

  it('rejects malformed OTPs', async () => {
    const res = await api().get('/users/verifyOtp/asha@jobhook.test/12ab');
    expect(res.status).toBe(400);
    expect(res.body.errorMessage).toBe('OTP is invalid.');
  });
});
