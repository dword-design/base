import { Base, defineBaseConfig, type CommandsRecord } from './src/index';

// Example of type-safe commands
const exampleCommands = {
  // Command with specific parameter types
  build: (options: { watch?: boolean; target?: string }) => {
    console.log('Building with options:', options);
  },
  
  // Command with multiple parameters
  deploy: (environment: string, force: boolean = false) => {
    console.log(`Deploying to ${environment}, force: ${force}`);
  },
  
  // Command with no parameters
  clean: () => {
    console.log('Cleaning...');
  },
  
  // Command as object with handler
  test: {
    description: 'Run tests',
    handler: (pattern?: string) => {
      console.log(`Running tests with pattern: ${pattern || 'all'}`);
    }
  }
} satisfies CommandsRecord;

// Type-safe config definition
const config = defineBaseConfig({
  commands: exampleCommands,
  global: false,
  // ... other config options
});

// Usage example
const base = new Base(config);

// These calls are now type-safe
base.run('build', { watch: true, target: 'production' }); // ✓ Correct types
base.run('deploy', 'staging', true); // ✓ Correct types  
base.run('clean'); // ✓ No parameters needed
base.run('test', 'unit'); // ✓ Optional parameter

// These would cause TypeScript errors:
//base.run('build', 'wrong-type'); // ❌ TypeScript error
// base.run('deploy'); // ❌ Missing required parameter
// base.run('nonexistent'); // ❌ Command doesn't exist

export { config };
