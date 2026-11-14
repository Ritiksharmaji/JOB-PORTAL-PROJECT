import type { Request, Response } from 'express';
import { currentUser } from '../middlewares/authenticate.js';
import * as jobService from '../services/job.service.js';
import type { JobInput } from '../validators/job.schemas.js';

/** POST /jobs/post -> 201 job */
export async function postJob(req: Request, res: Response) {
  res.status(201).json(await jobService.postJob(res.locals.body, currentUser(req)));
}

/** POST /jobs/postAll -> 201 jobs (bulk create/update, used for seeding) */
export async function postAllJobs(req: Request, res: Response) {
  const user = currentUser(req);
  const jobs = [];
  for (const job of res.locals.body as JobInput[]) jobs.push(await jobService.postJob(job, user));
  res.status(201).json(jobs);
}

/** GET /jobs/getAll -> 200 jobs */
export async function getAllJobs(req: Request, res: Response) {
  res.json(await jobService.getAllJobs(currentUser(req)));
}

/** GET /jobs/get/:id -> 200 job */
export async function getJob(req: Request, res: Response) {
  res.json(await jobService.getJob(res.locals.params.id, currentUser(req)));
}

/** POST /jobs/apply/:id -> 200 `{ message }` */
export async function applyJob(req: Request, res: Response) {
  res.json(await jobService.applyJob(res.locals.params.id, res.locals.body, currentUser(req)));
}

/** GET /jobs/postedBy/:id -> 200 jobs */
export async function getJobsPostedBy(req: Request, res: Response) {
  res.json(await jobService.getJobsPostedBy(res.locals.params.id, currentUser(req)));
}

/** GET /jobs/history/:id/:applicationStatus -> 200 jobs */
export async function getHistory(req: Request, res: Response) {
  const { id, applicationStatus } = res.locals.params;
  res.json(await jobService.getHistory(id, applicationStatus, currentUser(req)));
}

/** POST /jobs/changeAppStatus -> 200 `{ message }` */
export async function changeAppStatus(req: Request, res: Response) {
  res.json(await jobService.changeApplicationStatus(res.locals.body, currentUser(req)));
}
