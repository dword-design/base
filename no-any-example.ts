import { Base, type BaseConfig, defineBaseConfig } from './src/index';

// Extended config interface that adds custom fields to BaseConfig
interface MyExtendedConfig extends BaseConfig {
  // Custom API configuration
  apiUrl: string;
  apiKey: string;
  
  // Environment settings
  environment: 'development' | 'staging' | 'production';
  
  // Feature flags
  features: {
    enableCache: boolean;
    enableMetrics: boolean;
    enableLogging: boolean;
  };
  
  // Database configuration
  database: {
    host: string;
    port: number;
    name: string;
  };
  
  // Custom deployment settings
  deploymentRegions: string[];
  maxRetries: number;
}

// Commands that can access the extended config (no unknown types!)
const extendedCommands = {
  // Deploy command with typed parameters and config access
  deploy: function(this: Base<MyExtendedConfig>, region?: string) {
    console.log(`Deploying to ${region || this.config.environment}`);
    console.log(`API URL: ${this.config.apiUrl}`);
    console.log(`Database: ${this.config.database.host}:${this.config.database.port}`);
    
    if (this.config.features.enableLogging) {
      console.log('Logging is enabled for this deployment');
    }
    
    if (this.config.environment === 'production') {
      console.log(`Available regions: ${this.config.deploymentRegions.join(', ')}`);
    }
    
    return { 
      region: region || this.config.environment,
      success: true 
    };
  },
  
  // Database command with proper return type
  connectDb: function(this: Base<MyExtendedConfig>) {
    const { host, port, name } = this.config.database;
    console.log(`Connecting to database: ${name} at ${host}:${port}`);
    
    if (this.config.features.enableMetrics) {
      console.log('Database metrics collection enabled');
    }
    
    return { connected: true, database: name };
  },
  
  // API request command with typed parameters
  makeApiCall: function(
    this: Base<MyExtendedConfig>, 
    endpoint: string, 
    retries?: number
  ) {
    const fullUrl = `${this.config.apiUrl}${endpoint}`;
    const maxRetries = retries ?? this.config.maxRetries;
    
    console.log(`Making API call to: ${fullUrl}`);
    console.log(`Max retries: ${maxRetries}`);
    console.log(`Using API key: ${this.config.apiKey.substring(0, 8)}...`);
    
    if (this.config.features.enableCache) {
      console.log('Response caching is enabled');
    }
    
    return { url: fullUrl, retries: maxRetries };
  },
  
  // Status command with typed return value
  showStatus: function(this: Base<MyExtendedConfig>) {
    return {
      environment: this.config.environment,
      features: this.config.features,
      database: this.config.database,
      regions: this.config.deploymentRegions,
      apiConfigured: !!this.config.apiUrl
    };
  }
};

// Use partial config approach with defineBaseConfig
const config = defineBaseConfig<MyExtendedConfig>({
  // Base config fields
  global: false,
  commands: extendedCommands,
  
  // Extended config fields - all fully typed!
  apiUrl: 'https://api.myapp.com',
  apiKey: 'sk-1234567890abcdef',
  environment: 'development',
  
  features: {
    enableCache: true,
    enableMetrics: false,
    enableLogging: true
  },
  
  database: {
    host: 'localhost',
    port: 5432,
    name: 'myapp_dev'
  },
  
  deploymentRegions: ['us-east-1', 'eu-west-1', 'ap-southeast-1'],
  maxRetries: 3
});

// Usage with full type safety and no unknown types
const base = new Base<MyExtendedConfig>(config);

// All these calls are type-safe and handlers have access to extended config
console.log('=== Deploy Command ===');
const deployResult = base.run('deploy', 'staging');
console.log('Deploy result:', deployResult);

console.log('\n=== Database Command ===');
const dbResult = base.run('connectDb');
console.log('DB result:', dbResult);

console.log('\n=== API Command ===');
const apiResult = base.run('makeApiCall', '/users', 5);
console.log('API result:', apiResult);

console.log('\n=== Status Command ===');
const statusResult = base.run('showStatus');
console.log('Status result:', statusResult);

console.log('Extended config system works without unknown types!');

export { config, base };
