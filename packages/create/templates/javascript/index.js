#!js name=lib api_version=1.0.0

import { registerFunction } from '@redis/gears-sdk';

registerFunction(
  'random',
  (client, key) => {
    const value = Math.random().toString();
    client.set(key, value);
    return value;
  }
);
