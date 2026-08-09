/**
 * Prefixed-ULID generator matching the scheme in packages/schemas/src/ids.ts.
 *
 * Implementation is a self-contained ULID so we don't take a runtime dep for
 * a 26-character random string. Uses `crypto.getRandomValues` when available,
 * which is present in Node 20+ globally.
 */

const ENCODING = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'; // Crockford's base32
const ENCODING_LEN = ENCODING.length;
const TIME_LEN = 10;
const RANDOM_LEN = 16;

function encodeTime(now: number): string {
  let mod: number;
  let str = '';
  let time = now;
  for (let i = TIME_LEN; i > 0; i--) {
    mod = time % ENCODING_LEN;
    str = ENCODING[mod] + str;
    time = (time - mod) / ENCODING_LEN;
  }
  return str;
}

function encodeRandom(): string {
  const bytes = new Uint8Array(RANDOM_LEN);
  crypto.getRandomValues(bytes);
  let out = '';
  for (let i = 0; i < RANDOM_LEN; i++) {
    // Map each byte into 32-value space; slight bias but acceptable for IDs.
    out += ENCODING[bytes[i]! % ENCODING_LEN];
  }
  return out;
}

export function ulid(): string {
  return encodeTime(Date.now()) + encodeRandom();
}

export function prefixId<P extends string>(prefix: P): `${P}_${string}` {
  return `${prefix}_${ulid()}`;
}

// Convenience constructors — one per entity so callers pick the right prefix.
export const newUserId = () => prefixId('usr');
export const newOrgId = () => prefixId('org');
export const newMembershipId = () => prefixId('mem');
export const newSessionId = () => prefixId('ses');
export const newProjectId = () => prefixId('prj');
export const newRepositoryId = () => prefixId('rpo');
export const newMissionId = () => prefixId('msn');
export const newTaskId = () => prefixId('tsk');
export const newEventId = () => prefixId('evt');
