import { Base, defineBaseConfig, type BaseConfig } from './src/index';

// Test interface that extends BaseConfig
interface TestConfig extends BaseConfig {
  apiUrl: string;
  environment: 'dev' | 'prod';
}

// Test commands without any type assertions
const testCommands = {
  simple: function(this: Base<TestConfig>) {
    console.log(`Environment: ${this.config.environment}`);
    console.log(`API: ${this.config.apiUrl}`);
    return { success: true };
  },
  
  withParams: function(this: Base<TestConfig>, message: string, count: number) {
    console.log(`Message: ${message}, Count: ${count}`);
    console.log(`Using API: ${this.config.apiUrl}`);
    return { message, count, environment: this.config.environment };
  },
  
  // Test command as object
  objectCommand: {
    description: 'Test object command',
    handler: function(this: Base<TestConfig>, value: boolean) {
      console.log(`Value: ${value}, Environment: ${this.config.environment}`);
      return { value, api: this.config.apiUrl };
    }
  }
};

// Create config with no type assertions
const config = defineBaseConfig<TestConfig>({
  global: false,
  commands: testCommands,
  apiUrl: 'https://test-api.com',
  environment: 'dev'
});

// Test usage
const base = new Base<TestConfig>(config);

console.log('=== Testing commands without type assertions ===');

// Test function command
const result1 = base.run('simple');
console.log('Simple result:', result1);

// Test function command with parameters
const result2 = base.run('withParams', 'Hello World', 42);
console.log('WithParams result:', result2);

// Test object command
const result3 = base.run('objectCommand', true);
console.log('ObjectCommand result:', result3);

console.log('All tests passed without type assertions!');

export { config, base };
