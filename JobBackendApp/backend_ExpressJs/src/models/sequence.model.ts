import { Schema, model } from 'mongoose';

/**
 * Auto-increment counters — same `sequence` collection the Spring backend uses
 * (`{ _id: 'users', seq: 42 }`), so IDs stay unique when both backends share a database.
 */
const sequenceSchema = new Schema(
  {
    _id: { type: String, required: true },
    seq: { type: Number, required: true, default: 0 },
  },
  { collection: 'sequence', versionKey: false },
);

export const Sequence = model('Sequence', sequenceSchema);

/** Atomically returns the next id for `key` ("users", "profiles", "jobs", "notification"). */
export async function nextSequenceId(key: string): Promise<number> {
  const doc = await Sequence.findOneAndUpdate(
    { _id: key },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: 'after', lean: true },
  );
  return doc!.seq;
}
