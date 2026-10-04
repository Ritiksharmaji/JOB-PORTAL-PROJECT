import { Profile } from '../models/profile.model.js';
import type { AuthUser } from '../types/auth.js';
import { AppError } from '../utils/app-error.js';
import { fromBase64, toProfileDto } from '../utils/mappers.js';
import type { ProfileInput } from '../validators/profile.schemas.js';

export async function getProfile(id: number) {
  const profile = await Profile.findById(id).lean();
  if (!profile) throw new AppError('PROFILE_NOT_FOUND');
  return toProfileDto(profile);
}

export async function getAllProfiles() {
  const profiles = await Profile.find().sort({ _id: 1 }).lean();
  return profiles.map(toProfileDto);
}

/** Replaces the profile with the submitted one. Users may only update their own profile. */
export async function updateProfile(input: ProfileInput, requester: AuthUser) {
  if (input.id !== requester.profileId && requester.accountType !== 'ADMIN') throw new AppError('FORBIDDEN');
  const existing = await Profile.exists({ _id: input.id });
  if (!existing) throw new AppError('PROFILE_NOT_FOUND');

  const { id, picture, ...fields } = input;
  const update = { ...fields, picture: fromBase64(picture) };
  // $set for provided fields, $unset for cleared ones — keeps unknown fields (e.g. Spring's `_class`).
  const $unset = Object.fromEntries(
    Object.entries(update)
      .filter(([, v]) => v === undefined || v === null)
      .map(([k]) => [k, 1]),
  );
  const $set = Object.fromEntries(Object.entries(update).filter(([, v]) => v !== undefined && v !== null));

  const saved = await Profile.findByIdAndUpdate(
    id,
    { $set, ...(Object.keys($unset).length ? { $unset } : {}) },
    { returnDocument: 'after', lean: true, runValidators: true },
  );
  return toProfileDto(saved!);
}
