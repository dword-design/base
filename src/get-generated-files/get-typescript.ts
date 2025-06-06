import defu from '@dword-design/defu';

export default function () {
  return defu(this.config.typescriptConfig, {
    compilerOptions: {
      declaration: true,
      esModuleInterop: true,
      module: 'ESNext',
      moduleResolution: 'bundler',
      outDir: 'dist',
      paths: { '@/*': ['./*'] },
      skipLibCheck: true,
      target: 'ESNext',
    },
    exclude: ['**/*.spec.ts'],
    include: ['src'],
  });
}
