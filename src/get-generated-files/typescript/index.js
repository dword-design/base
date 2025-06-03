export default {
  compilerOptions: {
    paths: { '@': ['.'], '@/*': ['./*'] },
    target: 'ESNext',
    moduleResolution: 'bundler',
  },
  exclude: ['**/*.test.ts', '**/*.spec.ts'],
};
