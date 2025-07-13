import defu from '@dword-design/defu';

export default function () {
  return defu(this.config.typescriptConfig, {
    compilerOptions: {
      declaration: true,
      esModuleInterop: true,
      module: 'ESNext',
      moduleResolution: 'bundler',
      outDir: 'dist',
      ...(this.config.hasTypescriptConfigRootAlias && {
        paths: { '@/*': ['./*'] },
      }),
      skipLibCheck: true,
      target: 'ESNext',
    },
    exclude: ['test-results'],
  });
}
