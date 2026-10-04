import { beforeAll, describe, expect, it } from 'vitest';
import { api, bearer, createUser } from './helpers.js';

type User = Awaited<ReturnType<typeof createUser>>;

const RESUME = Buffer.from('%PDF-1.4 test resume').toString('base64');

describe('jobs & applications', () => {
  let employer: User;
  let otherEmployer: User;
  let applicant: User;
  let otherApplicant: User;
  let jobId: number;

  beforeAll(async () => {
    employer = await createUser('Emma Employer', 'EMPLOYER');
    otherEmployer = await createUser('Oscar Employer', 'EMPLOYER');
    applicant = await createUser('Ali Applicant', 'APPLICANT');
    otherApplicant = await createUser('Bea Applicant', 'APPLICANT');
  });

  it('lets an employer post a job (id 0 = new) and notifies them', async () => {
    const res = await api()
      .post('/jobs/post')
      .set(bearer(employer.token))
      .send({ id: 0, jobTitle: 'Developer', company: 'Google', packageOffered: 40, skillsRequired: ['Node.js'], jobStatus: 'ACTIVE', postedBy: 999 });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ jobTitle: 'Developer', postedBy: employer.id, applicants: null, jobStatus: 'ACTIVE' });
    expect(res.body.postTime).toBeTruthy();
    jobId = res.body.id;

    const notes = await api().get(`/notification/get/${employer.id}`).set(bearer(employer.token));
    expect(notes.body[0]).toMatchObject({ action: 'Job Posted', route: `/posted-jobs/${jobId}`, status: 'UNREAD' });
  });

  it('accepts the id as a string, like the React app sends it', async () => {
    const res = await api().post('/jobs/post').set(bearer(employer.token)).send({ id: '0', jobTitle: 'Draft', jobStatus: 'DRAFT' });
    expect(res.status).toBe(201);
    expect(res.body.id).not.toBe(jobId);
  });

  it('stops applicants from posting jobs', async () => {
    const res = await api().post('/jobs/post').set(bearer(applicant.token)).send({ jobTitle: 'Nope' });
    expect(res.status).toBe(403);
  });

  it('applies with a Base64 resume and blocks duplicate applications', async () => {
    const body = { name: 'Ali Applicant', email: applicant.email, phone: '9876543210', website: 'https://ali.dev', resume: RESUME, coverLetter: 'Hi' };
    const res = await api().post(`/jobs/apply/${jobId}`).set(bearer(applicant.token)).send(body);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Applied Successfully');

    const again = await api().post(`/jobs/apply/${jobId}`).set(bearer(applicant.token)).send(body);
    expect(again.status).toBe(409);
    expect(again.body.errorMessage).toBe('Already Applied to this Job.');

    await api().post(`/jobs/apply/${jobId}`).set(bearer(otherApplicant.token)).send({ name: 'Bea', resume: RESUME });
  });

  it('shows full applicant data to the owner, own data to the applicant, status only to others', async () => {
    const asOwner = await api().get(`/jobs/get/${jobId}`).set(bearer(employer.token));
    expect(asOwner.body.applicants).toHaveLength(2);
    expect(asOwner.body.applicants[0]).toMatchObject({ applicantId: applicant.id, phone: 9876543210, resume: RESUME, applicationStatus: 'APPLIED' });

    const asApplicant = await api().get(`/jobs/get/${jobId}`).set(bearer(applicant.token));
    const mine = asApplicant.body.applicants.find((a: { applicantId: number }) => a.applicantId === applicant.id);
    const theirs = asApplicant.body.applicants.find((a: { applicantId: number }) => a.applicantId === otherApplicant.id);
    expect(mine.resume).toBe(RESUME);
    expect(theirs).toMatchObject({ applicantId: otherApplicant.id, applicationStatus: 'APPLIED', resume: null, email: null });
  });

  it('only lets the job owner change application status, and notifies on interviews', async () => {
    const update = { id: jobId, applicantId: applicant.id, applicationStatus: 'INTERVIEWING', interviewTime: '2026-10-10T05:00:00.000Z' };

    const intruder = await api().post('/jobs/changeAppStatus').set(bearer(otherEmployer.token)).send(update);
    expect(intruder.status).toBe(403);

    const ok = await api().post('/jobs/changeAppStatus').set(bearer(employer.token)).send(update);
    expect(ok.status).toBe(200);

    const history = await api().get(`/jobs/history/${applicant.id}/INTERVIEWING`).set(bearer(applicant.token));
    expect(history.body).toHaveLength(1);
    expect(history.body[0].applicants.find((a: { applicantId: number }) => a.applicantId === applicant.id).interviewTime).toBe(
      '2026-10-10T05:00:00.000Z',
    );

    const notes = await api().get(`/notification/get/${applicant.id}`).set(bearer(applicant.token));
    expect(notes.body.map((n: { action: string }) => n.action)).toContain('Interview Scheduled');
  });

  it('keeps applicants when the owner edits the job, and resets postTime when it is closed', async () => {
    const before = (await api().get(`/jobs/get/${jobId}`).set(bearer(employer.token))).body;
    const edited = await api()
      .post('/jobs/post')
      .set(bearer(employer.token))
      .send({ id: jobId, jobTitle: 'Senior Developer', company: 'Google', jobStatus: 'CLOSED' });
    expect(edited.status).toBe(201);
    expect(edited.body.jobTitle).toBe('Senior Developer');
    expect(edited.body.applicants).toHaveLength(2);
    expect(new Date(edited.body.postTime).getTime()).toBeGreaterThanOrEqual(new Date(before.postTime).getTime());

    const closedApply = await api().post(`/jobs/apply/${jobId}`).set(bearer((await createUser('Late Applicant', 'APPLICANT')).token)).send({});
    expect(closedApply.status).toBe(400);
  });

  it("refuses to let another employer edit or list someone else's jobs", async () => {
    expect((await api().post('/jobs/post').set(bearer(otherEmployer.token)).send({ id: jobId, jobTitle: 'Hijack' })).status).toBe(403);
    expect((await api().get(`/jobs/postedBy/${employer.id}`).set(bearer(otherEmployer.token))).status).toBe(403);
    const own = await api().get(`/jobs/postedBy/${employer.id}`).set(bearer(employer.token));
    expect(own.body.length).toBeGreaterThanOrEqual(2);
  });

  it('returns 404 with the Spring message for unknown jobs', async () => {
    const res = await api().get('/jobs/get/987654').set(bearer(applicant.token));
    expect(res.status).toBe(404);
    expect(res.body.errorMessage).toBe('Job not found.');
  });
});

describe('profiles & notifications', () => {
  it('updates only your own profile and round-trips the picture as Base64', async () => {
    const me = await createUser('Pat Profile', 'APPLICANT');
    const other = await createUser('Quinn Other', 'APPLICANT');
    const picture = Buffer.from('fake-image-bytes').toString('base64');

    const current = (await api().get(`/profiles/get/${me.profileId}`).set(bearer(me.token))).body;
    const res = await api()
      .put('/profiles/update')
      .set(bearer(me.token))
      .send({ ...current, about: 'Hello', picture, savedJobs: [1, 2], experiences: [{ title: 'Dev', startDate: '2024-02-01T12:00:00.000Z', working: true }] });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ about: 'Hello', picture, savedJobs: [1, 2] });
    expect(res.body.experiences[0]).toMatchObject({ title: 'Dev', working: true });

    const forbidden = await api().put('/profiles/update').set(bearer(other.token)).send({ ...current, about: 'Hacked' });
    expect(forbidden.status).toBe(403);
  });

  it('only shows and reads your own notifications', async () => {
    const a = await createUser('Nora Notes', 'EMPLOYER');
    const b = await createUser('Sam Snoop', 'APPLICANT');
    await api().post('/jobs/post').set(bearer(a.token)).send({ jobTitle: 'QA', company: 'Meta', jobStatus: 'ACTIVE' });

    expect((await api().get(`/notification/get/${a.id}`).set(bearer(b.token))).status).toBe(403);
    const [note] = (await api().get(`/notification/get/${a.id}`).set(bearer(a.token))).body;
    expect((await api().put(`/notification/read/${note.id}`).set(bearer(b.token))).status).toBe(403);
    expect((await api().put(`/notification/read/${note.id}`).set(bearer(a.token))).status).toBe(200);
    expect((await api().get(`/notification/get/${a.id}`).set(bearer(a.token))).body).toHaveLength(0);
  });
});
