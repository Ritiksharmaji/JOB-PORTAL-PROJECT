import type { ApplicationStatus } from '../constants/enums.js';
import { Job } from '../models/job.model.js';
import { nextSequenceId } from '../models/sequence.model.js';
import type { AuthUser } from '../types/auth.js';
import { AppError } from '../utils/app-error.js';
import { fromBase64, toJobDto } from '../utils/mappers.js';
import type { ApplyInput, ChangeStatusInput, JobInput } from '../validators/job.schemas.js';
import { sendNotification } from './notification.service.js';

const isAdmin = (u: AuthUser) => u.accountType === 'ADMIN';

/**
 * Create (`id` 0 / missing) or update a job (Spring: JobServiceImpl.postJob).
 * - `postedBy` comes from the token, never from the request body.
 * - On update only the job's owner (or an admin) may edit it, and the existing
 *   applicants are always kept (the Spring version overwrote them with whatever the client sent).
 * - `postTime` is reset when a draft is published or a job is closed, as in Spring.
 */
export async function postJob(input: JobInput, requester: AuthUser) {
  const { id, postedBy: _ignored, ...fields } = input;

  if (!id) {
    const newId = await nextSequenceId('jobs');
    const job = await Job.create({ _id: newId, ...fields, postedBy: requester.id, postTime: new Date() });
    await sendNotification({
      userId: requester.id,
      action: 'Job Posted',
      message: `Job Posted Successfully for ${fields.jobTitle ?? ''} at ${fields.company ?? ''}`,
      route: `/posted-jobs/${newId}`,
    });
    return toJobDto(job.toObject());
  }

  const job = await Job.findById(id);
  if (!job) throw new AppError('JOB_NOT_FOUND');
  if (job.postedBy !== requester.id && !isAdmin(requester)) throw new AppError('FORBIDDEN');

  const resetPostTime = job.jobStatus === 'DRAFT' || fields.jobStatus === 'CLOSED';
  // Only apply fields the client sent, so a partial body never wipes existing data.
  const provided = Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined && v !== null));
  job.set({ ...provided, ...(resetPostTime ? { postTime: new Date() } : {}) });
  await job.save();
  return toJobDto(job.toObject());
}

export async function getAllJobs(viewer: AuthUser) {
  const jobs = await Job.find().sort({ _id: 1 }).lean();
  return jobs.map((j) => toJobDto(j, viewer));
}

export async function getJob(id: number, viewer: AuthUser) {
  const job = await Job.findById(id).lean();
  if (!job) throw new AppError('JOB_NOT_FOUND');
  return toJobDto(job, viewer);
}

/** Applies the logged-in applicant to an active job (Spring: applyJob). */
export async function applyJob(id: number, input: ApplyInput, requester: AuthUser) {
  const job = await Job.findById(id);
  if (!job) throw new AppError('JOB_NOT_FOUND');
  if (job.jobStatus !== 'ACTIVE') throw new AppError('JOB_NOT_ACTIVE');
  if (job.applicants?.some((a) => a.applicantId === requester.id)) throw new AppError('JOB_APPLIED_ALREADY');

  job.set('applicants', [
    ...(job.applicants ?? []),
    {
      ...input,
      resume: fromBase64(input.resume),
      applicantId: requester.id,
      applicationStatus: 'APPLIED',
      timestamp: new Date(),
    },
  ]);
  await job.save();
  return { message: 'Applied Successfully' };
}

/** Jobs where the user has an application with the given status. Users only see their own history. */
export async function getHistory(userId: number, status: ApplicationStatus, requester: AuthUser) {
  if (userId !== requester.id && !isAdmin(requester)) throw new AppError('FORBIDDEN');
  const jobs = await Job.find({ applicants: { $elemMatch: { applicantId: userId, applicationStatus: status } } }).lean();
  return jobs.map((j) => toJobDto(j, requester));
}

export async function getJobsPostedBy(userId: number, requester: AuthUser) {
  if (userId !== requester.id && !isAdmin(requester)) throw new AppError('FORBIDDEN');
  const jobs = await Job.find({ postedBy: userId }).sort({ _id: 1 }).lean();
  return jobs.map((j) => toJobDto(j, requester));
}

/** Moves an applicant through the pipeline. Only the job's owner (or an admin) may do this. */
export async function changeApplicationStatus(input: ChangeStatusInput, requester: AuthUser) {
  const job = await Job.findById(input.id);
  if (!job) throw new AppError('JOB_NOT_FOUND');
  if (job.postedBy !== requester.id && !isAdmin(requester)) throw new AppError('FORBIDDEN');

  const applicant = job.applicants?.find((a) => a.applicantId === input.applicantId);
  if (!applicant) throw new AppError('APPLICANT_NOT_FOUND');

  applicant.applicationStatus = input.applicationStatus;
  if (input.applicationStatus === 'INTERVIEWING') applicant.interviewTime = input.interviewTime;
  job.markModified('applicants');
  await job.save();

  if (input.applicationStatus === 'INTERVIEWING') {
    await sendNotification({
      userId: input.applicantId,
      action: 'Interview Scheduled',
      message: `Interview scheduled for job id: ${input.id}`,
      route: '/job-history',
    });
  }
  return { message: 'Status Changed Successfully' };
}
