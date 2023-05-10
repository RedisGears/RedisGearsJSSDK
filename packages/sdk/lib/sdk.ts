import { CommandSignature } from '@redis/client/dist/lib/RESP/types.js';
import COMMANDS from './commands.js';

interface NativeClient {
  call<T = unknown>(...args: Array<string | ArrayBuffer>): T;
}

declare global {
  const redis: {
    register_function(
      name: string,
      // TODO: return type?
      fn: (client: NativeClient, ...args: Array<string> | Array<ArrayBuffer>) => unknown
    ): void;
  };
}

type WithCommands = {
  // TODO: flags?
  [P in keyof typeof COMMANDS]: CommandSignature<typeof COMMANDS[P], 3, {}>;
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

// Buffer "polyfill"
// TODO
(globalThis as any).Buffer = class extends ArrayBuffer {
  static isBuffer(x: unknown) {
    return x instanceof ArrayBuffer
  }
};
