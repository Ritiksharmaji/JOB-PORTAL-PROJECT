import { z } from 'zod';

/** Empty string / null -> undefined, so optional fields behave like Jackson's null handling. */
const blankToUndefined = (v: unknown) => (v === null || v === '' ? undefined : v);

/** Numeric id that may arrive as a string ("12") — Spring/Jackson accepts both. */
export const numericId = z.preprocess(blankToUndefined, z.coerce.number().int().nonnegative());

export const optionalNumber = z.preprocess(blankToUndefined, z.coerce.number().optional());
export const optionalString = z.preprocess((v) => (v === null ? undefined : v), z.string().optional());

/**
 * Date-time from the client: ISO-8601 with `Z`/offset, or Spring-style local
 * "2026-10-02T14:30:00". Stored as a BSON Date like Spring's LocalDateTime.
 */
export const optionalDate = z.preprocess(blankToUndefined, z.coerce.date().optional());

export const idParams = z.object({ id: numericId });
