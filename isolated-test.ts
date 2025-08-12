// Isolated test for extended config functionality

// Simplified types to test the core functionality
type CommandHandler<
  TParams extends readonly unknown[],
  TCommands,
  TAdditionalConfig
> = (this: { config: any }, ...args: TParams) => unknown;

type CommandDefinition<TParams extends readonly unknown[], TCommands, TAdditionalConfig> =
  | CommandHandler<TParams, TCommands, TAdditionalConfig>
  | { handler: CommandHandler<TParams, TCommands, TAdditionalConfig> };

type CommandsRecord<TCommands, TAdditionalConfig> = 
  Record<string, CommandDefinition<any, TCommands, TAdditionalConfig>>;

interface BaseConfig {
  global: boolean;
  commands: any;
}

type Config<TCommands, TAdditionalConfig> = BaseConfig & TAdditionalConfig & {
  commands: TCommands;
};

class TestBase<TCommands, TAdditionalConfig> {
  config: Config<TCommands, TAdditionalConfig>;
  
  constructor(config: Config<TCommands, TAdditionalConfig>) {
    this.config = config;
  }
  
  run<K extends keyof TCommands>(name: K, ...args: any[]): unknown {
    const command = this.config.commands[name];
    const handler = typeof command === 'function' ? command : command.handler;
    return handler.call(this, ...args);
  }
}

// Test: Additional config interface
interface MyAdditionalConfig {
  apiUrl: string;
  apiKey: string;
  environment: 'development' | 'staging' | 'production';
  features: {
    enableCache: boolean;
    enableMetrics: boolean;
  };
}

// Test: Commands that use additional config
const testCommands = {
  deploy: function(this: TestBase<any, MyAdditionalConfig>, target?: string) {
    // ✅ Should have access to additional config fields
    console.log(`Deploying to ${target || this.config.environment}`);
    console.log(`Using API URL: ${this.config.apiUrl}`);
    console.log(`Cache enabled: ${this.config.features.enableCache}`);
    return 'deployed';
  },
  
  makeRequest: function(this: TestBase<any, MyAdditionalConfig>, endpoint: string) {
    const fullUrl = `${this.config.apiUrl}${endpoint}`;
    console.log(`Making request to: ${fullUrl}`);
    return { url: fullUrl };
  },
  
  status: function(this: TestBase<any, MyAdditionalConfig>) {
    return {
      environment: this.config.environment,
      features: this.config.features,
      hasApi: !!this.config.apiUrl
    };
  }
};

// Test: Create config with additional fields
const testConfig: Config<typeof testCommands, MyAdditionalConfig> = {
  global: false,
  commands: testCommands,
  
  // Additional config fields
  apiUrl: 'https://api.example.com',
  apiKey: 'secret-key-12345',
  environment: 'development',
  features: {
    enableCache: true,
    enableMetrics: false
  }
};

// Test: Usage
const testBase = new TestBase(testConfig);

// These should work and be type-safe
const deployResult = testBase.run('deploy');
const requestResult = testBase.run('makeRequest', '/users');
const statusResult = testBase.run('status');

console.log('Extended config test completed successfully!');
console.log('Deploy result:', deployResult);
console.log('Request result:', requestResult);
console.log('Status result:', statusResult);

// Type assertions to verify the types work correctly
const _typeTest1: string = testConfig.apiUrl; // ✅ Should work
const _typeTest2: 'development' | 'staging' | 'production' = testConfig.environment; // ✅ Should work
const _typeTest3: boolean = testConfig.features.enableCache; // ✅ Should work

export { testConfig, testBase };
