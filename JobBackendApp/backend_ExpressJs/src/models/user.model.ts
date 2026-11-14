import { Schema, model, type InferSchemaType } from 'mongoose';
import { ACCOUNT_TYPES } from '../constants/enums.js';

/** `users` collection (Spring entity: User). Numeric `_id` from the `sequence` counter. */
const userSchema = new Schema(
  {
    _id: { type: Number, required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    /** BCrypt hash — compatible with Spring's BCryptPasswordEncoder. */
    password: { type: String, required: true },
    accountType: { type: String, enum: ACCOUNT_TYPES, required: true, default: 'APPLICANT' },
    profileId: { type: Number },
  },
  { collection: 'users', versionKey: false },
);

export type UserDoc = InferSchemaType<typeof userSchema>;
export const User = model('User', userSchema);
