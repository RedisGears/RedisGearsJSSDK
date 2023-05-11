#!js name=lib api_version=1.1

import { registerFunction, registerStreamConsumer, registerNotificationsConsumer } from '@redis/gears-sdk';

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
  (client, { stream_name }) => client.incr(`${stream_name}:stream-counter`)
);

registerNotificationsConsumer(
  'consumer',
  '',
  (client, { key }) => client.incr(`${key}:notifications-counter`)
);
