import { CommandReply, ReplyWithFlags } from '@redis/client/dist/lib/RESP/types.js';
import COMMANDS from './commands.js';

interface NativeClient {
  call<T = unknown>(...args: Array<string | ArrayBuffer>): T;
}

interface StreamConsumerData {
  id: [ms: `${number}`, seq: `${number}`];
  stream_name: string;
  stream_name_raw: ArrayBuffer;
  record: Array<[string, string]>;
  record_raw: Array<[ArrayBuffer, ArrayBuffer]>
}

declare global {
  const redis: {
    register_function(
      name: string,
      // TODO: return type?
      fn: (client: NativeClient, ...args: Array<string> | Array<ArrayBuffer>) => unknown
    ): void;

    register_stream_consumer(
      name: string,
      prefix: string,
      window: number,
      trim: boolean,
      fn: (client: NativeClient, data: StreamConsumerData) => unknown
    ): void;
  };
}

type WithCommands = {
  // TODO: flags?
  [P in keyof typeof COMMANDS]: (...args: Parameters<typeof COMMANDS[P]['transformArguments']>) => ReplyWithFlags<CommandReply<typeof COMMANDS[P], 3>, {}>;
};

type SdkClientType = SdkClient & WithCommands;

class SdkClient {
  _client;

  constructor(client) {
    this._client = client;
  }
}

for (const [name, command] of Object.entries(COMMANDS)) {
  const transformReply = command.transformReply?.[3] ?? command.transformReply;
  
  SdkClient.prototype[name] = transformReply ?
    function (...args) {
      return transformReply(
        this._client.call.apply(
          this._client,
          command.transformArguments.apply(undefined, args)
        )
      );
    }:
    function (...args) {
      return this._client.call.apply(
        this._client,
        command.transformArguments.apply(undefined, args)
      )
    };
}

export function registerFunction(
  name: string,
  fn: (client: SdkClientType, ...args: Array<string> | Array<ArrayBuffer>) => unknown
) {
  redis.register_function(
    name,
    (client, ...args) => fn(new SdkClient(client) as SdkClientType, ...args)
  );
}

export function registerStreamConsumer(
  name: string,
  prefix: string,
  window: number,
  trim: boolean,
  fn: (client: SdkClient, data: StreamConsumerData) => unknown
): void {
  redis.register_stream_consumer(
    name,
    prefix,
    window,
    trim,
    (client, data) => fn(new SdkClient(client), data)
  );
}

// Buffer "polyfill"
// TODO
(globalThis as any).Buffer = class extends ArrayBuffer {
  static isBuffer(x: unknown) {
    return x instanceof ArrayBuffer
  }
};
