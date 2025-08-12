import { Base, defineBaseConfig, type BaseConfig } from './src/index';

interface TestConfig extends BaseConfig {
  apiUrl: string;
  environment: 'dev' | 'prod';
}

const testCommands = {
  simple: function(this: Base<TestConfig>) {
    console.log(`Environment: ${this.config.environment}`);
    return { success: true };
  },
  
  withParams: function(this: Base<TestConfig>, message: string, count: number) {
    console.log(`Message: ${message}, Count: ${count}`);
    return { message, count };
  },
  
  objectCommand: {
    description: 'Test object command',
    handler: function(this: Base<TestConfig>, value: boolean) {
      console.log(`Value: ${value}`);
      return { value };
    }
  }
};

const config = defineBaseConfig<TestConfig>({
  global: false,
  commands: testCommands,
  apiUrl: 'https://test-api.com',
  environment: 'dev'
});

const base = new Base<TestConfig>(config);

// Test the typing - when you hover over `command` in your IDE, 
// it should now show the proper type instead of `unknown`
function testTyping() {
  const command = base.config.commands['simple'];
  // ^ When you hover over this, it should show:
  // CommandDefinition<readonly unknown[], TestConfig>
  
  console.log('Command type is properly inferred:', typeof command);
  
  // You can also see that intellisense works for command names
  const anotherCommand = base.config.commands['withParams'];
  console.log('Another command type:', typeof anotherCommand);
  
  // And for object commands
  const objectCmd = base.config.commands['objectCommand'];
  console.log('Object command type:', typeof objectCmd);
}

testTyping();

console.log('IDE typing test completed!');
