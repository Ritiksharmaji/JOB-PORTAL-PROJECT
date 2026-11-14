import type { Request, Response } from 'express';
import * as userService from '../services/user.service.js';

/** POST /users/register -> 201 user (password null) */
export async function register(_req: Request, res: Response) {
  res.status(201).json(await userService.registerUser(res.locals.body));
}

/** POST /users/login -> 200 user (legacy; the frontends use /auth/login) */
export async function login(_req: Request, res: Response) {
  res.json(await userService.loginUser(res.locals.body));
}

/** POST /users/changePass -> 200 `{ message }` */
export async function changePassword(_req: Request, res: Response) {
  res.json(await userService.changePassword(res.locals.body));
}

/** POST /users/sendOtp/:email -> 200 `{ message }` */
export async function sendOtp(_req: Request, res: Response) {
  await userService.sendOtp(res.locals.params.email);
  res.json({ message: 'OTP sent successfully.' });
}

/** GET /users/verifyOtp/:email/:otp -> 202 `{ message }` */
export async function verifyOtp(_req: Request, res: Response) {
  await userService.verifyOtp(res.locals.params.email, res.locals.params.otp);
  res.status(202).json({ message: 'OTP has been verified.' });
}
