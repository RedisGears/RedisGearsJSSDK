import GET from '@redis/client/dist/lib/commands/GET.js';
import SET from '@redis/client/dist/lib/commands/SET.js';
import HSET from '@redis/client/dist/lib/commands/HSET.js';

export default {
  GET,
  get: GET,
  SET,
  set: SET,
  HSET,
  hSet: HSET
} as const;
