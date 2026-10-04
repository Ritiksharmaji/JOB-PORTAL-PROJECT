import type { Request, Response } from 'express';
import { currentUser } from '../middlewares/authenticate.js';
import * as profileService from '../services/profile.service.js';

/** GET /profiles/get/:id -> 200 profile */
export async function getProfile(_req: Request, res: Response) {
  res.json(await profileService.getProfile(res.locals.params.id));
}

/** GET /profiles/getAll -> 200 profiles */
export async function getAllProfiles(_req: Request, res: Response) {
  res.json(await profileService.getAllProfiles());
}

/** PUT /profiles/update -> 200 profile */
export async function updateProfile(req: Request, res: Response) {
  res.json(await profileService.updateProfile(res.locals.body, currentUser(req)));
}
