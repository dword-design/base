// Simple test for type-safe commands without external dependencies
export type CommandHandler<TParams extends readonly unknown[] = readonly unknown[]> = (
  ...args: TParams
) => unknown;

export type CommandObject<TParams extends readonly unknown[] = readonly unknown[]> = {
  description?: string;
  handler: CommandHandler<TParams>;
};

export type CommandDefinition<TParams extends readonly unknown[] = readonly unknown[]> =
  | CommandObject<TParams>
  | CommandHandler<TParams>;

export type CommandsRecord = Record<string, CommandDefinition<any>>;

export type CommandNames<T extends CommandsRecord> = keyof T;

export type CommandParams<
  T extends CommandsRecord,
  K extends CommandNames<T>
> = T[K] extends CommandDefinition<infer P> ? P : never;

// Simple base class for testing
class SimpleBase<TCommands extends CommandsRecord = {}> {
  commands: TCommands;

  constructor(commands: TCommands) {
    this.commands = commands;
  }

  run<K extends CommandNames<TCommands>>(
    name: K,
    ...args: CommandParams<TCommands, K>
  ): unknown {
    const command = this.commands[name];
    const handler: CommandHandler<any> = typeof command === 'function' ? command : command.handler;
    return handler(...args);
  }
}

// Test commands
const testCommands = {
  build: (options: { watch?: boolean; target?: string }) => {
    console.log('Building with options:', options);
  },
  
  deploy: (environment: string, force: boolean = false) => {
    console.log(`Deploying to ${environment}, force: ${force}`);
  },
  
  clean: () => {
    console.log('Cleaning...');
  },
  
  test: {
    description: 'Run tests',
    handler: (pattern?: string) => {
      console.log(`Running tests with pattern: ${pattern || 'all'}`);
    }
  }
} satisfies CommandsRecord;

// Test usage
const base = new SimpleBase(testCommands);

// These should be type-safe
base.run('build', { watch: true, target: 'production' });
base.run('deploy', 'staging', true);
base.run('clean');
base.run('test', 'unit');

// These would cause TypeScript errors:
// base.run('build', 'wrong-type'); // ❌ TypeScript error
// base.run('deploy'); // ❌ Missing required parameter  
// base.run('nonexistent'); // ❌ Command doesn't exist

console.log('Type-safe commands working correctly!');
