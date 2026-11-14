import type { Request, Response } from 'express';
import * as userService from '../services/user.service.js';

/** POST /auth/login -> 200 `{ jwt }` */
export async function login(_req: Request, res: Response) {
  res.json(await userService.login(res.locals.body));
}
