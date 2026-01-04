import defu from '@dword-design/defu';

export default function () {
  return defu(this.config.typescriptConfig, {
    compilerOptions: {
      declaration: true,
      esModuleInterop: true,
      module: 'ESNext',
      moduleResolution: 'bundler',
      ...(this.config.hasTypescriptConfigRootAlias && {
        paths: { '@/*': ['./*'] },
      }),
      skipLibCheck: true,
      strict: true,
      target: 'ESNext',
    },
    exclude: ['test-results'],
  });
}
