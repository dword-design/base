import defu from '@dword-design/defu';

export default function () {
  const result = defu(this.config.typescriptConfig, {
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
      strict: true,
      target: 'ESNext',
    },
    exclude: ['test-results'],
  });

  if (!result.compilerOptions.strict) {
    delete result.compilerOptions.strict;
  }

  return result;
}
