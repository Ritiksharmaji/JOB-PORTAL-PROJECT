import { Schema, model } from 'mongoose';

/** `otp` collection — one document per email (the email is the `_id`, as in Spring). */
const otpSchema = new Schema(
  {
    _id: { type: String, required: true }, // email
    otpCode: { type: String, required: true },
    creationTime: { type: Date, required: true },
    /**
     * Set once the code is verified; /users/changePass requires it. Spring ignores
     * this extra field, so the collection stays compatible.
     */
    verified: { type: Boolean, default: false },
  },
  { collection: 'otp', versionKey: false },
);

export const Otp = model('Otp', otpSchema);
