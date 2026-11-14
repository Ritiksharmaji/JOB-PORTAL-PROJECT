import { Router } from 'express';
import { z } from 'zod';
import * as auth from '../controllers/auth.controller.js';
import * as jobs from '../controllers/job.controller.js';
import * as notifications from '../controllers/notification.controller.js';
import * as profiles from '../controllers/profile.controller.js';
import * as users from '../controllers/user.controller.js';
import { authenticate, requireRole } from '../middlewares/authenticate.js';
import { authLimiter, otpLimiter } from '../middlewares/rate-limit.js';
import { validate } from '../middlewares/validate.js';
import { idParams, numericId } from '../validators/common.js';
import { applySchema, changeStatusSchema, historyParams, jobSchema } from '../validators/job.schemas.js';
import { profileSchema } from '../validators/profile.schemas.js';
import {
  changePasswordSchema,
  emailParams,
  loginSchema,
  registerSchema,
  verifyOtpParams,
} from '../validators/user.schemas.js';

/**
 * All routes — same paths, methods and status codes as the Spring Boot controllers.
 * Public routes match Spring's SecurityConfig permitAll list; everything else needs a JWT.
 */
export const router = Router();

// ---------- Public (no token) ----------
router.post('/auth/login', authLimiter, validate({ body: loginSchema }), auth.login);

router.post('/users/register', authLimiter, validate({ body: registerSchema }), users.register);
router.post('/users/sendOtp/:email', otpLimiter, validate({ params: emailParams }), users.sendOtp);
router.get('/users/verifyOtp/:email/:otp', otpLimiter, validate({ params: verifyOtpParams }), users.verifyOtp);
router.post('/users/changePass', otpLimiter, validate({ body: changePasswordSchema }), users.changePassword);

// ---------- Protected ----------
const secured = Router();
secured.use(authenticate);

secured.post('/users/login', validate({ body: loginSchema }), users.login);

const EMPLOYER = requireRole('EMPLOYER');
const APPLICANT = requireRole('APPLICANT');
secured.post('/jobs/post', EMPLOYER, validate({ body: jobSchema }), jobs.postJob);
secured.post('/jobs/postAll', EMPLOYER, validate({ body: z.array(jobSchema) }), jobs.postAllJobs);
secured.get('/jobs/getAll', jobs.getAllJobs);
secured.get('/jobs/get/:id', validate({ params: idParams }), jobs.getJob);
secured.post('/jobs/apply/:id', APPLICANT, validate({ params: idParams, body: applySchema }), jobs.applyJob);
secured.get('/jobs/postedBy/:id', validate({ params: idParams }), jobs.getJobsPostedBy);
secured.get('/jobs/history/:id/:applicationStatus', validate({ params: historyParams }), jobs.getHistory);
secured.post('/jobs/changeAppStatus', EMPLOYER, validate({ body: changeStatusSchema }), jobs.changeAppStatus);

secured.get('/profiles/get/:id', validate({ params: idParams }), profiles.getProfile);
secured.get('/profiles/getAll', profiles.getAllProfiles);
secured.put('/profiles/update', validate({ body: profileSchema }), profiles.updateProfile);

secured.get('/notification/get/:userId', validate({ params: z.object({ userId: numericId }) }), notifications.getNotifications);
secured.put('/notification/read/:id', validate({ params: idParams }), notifications.readNotification);

router.use(secured);
