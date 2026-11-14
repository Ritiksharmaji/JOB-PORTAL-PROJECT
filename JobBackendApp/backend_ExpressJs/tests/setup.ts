import mongoose from 'mongoose';
import { afterAll, beforeAll } from 'vitest';
import { connectDatabase } from '../src/config/db.js';
import { env } from '../src/config/env.js';

beforeAll(async () => {
  // Safety net: never wipe a real database.
  const dbName = new URL(env.mongoUri.replace(/^mongodb(\+srv)?:/, 'http:')).pathname.slice(1);
  if (!dbName.endsWith('_test')) throw new Error(`Refusing to run tests against "${dbName}" (name must end with _test)`);
  await connectDatabase();
  await mongoose.connection.dropDatabase();
  await Promise.all(Object.values(mongoose.models).map((m) => m.syncIndexes()));
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});
