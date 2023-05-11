#!js name=lib api_version=1.1

import { registerFunction, registerStreamConsumer } from '@redis/gears-sdk';

registerFunction(
  'random',
  (client, key) => {
    const value = Math.random().toString();
    client.set(key, value);
    return value;
  }
);

registerStreamConsumer(
  'consumer',
  'stream',
  1,
  false,
  (client, { key }) => client.incr(`${key}:counter`)
);
