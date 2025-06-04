export default {
    compilerOptions: {
        baseUrl: '.',
        esModuleInterop: true,
        module: 'ESNext',
        moduleResolution: 'bundler',
        outDir: 'dist',
        paths: { '@': ['.'], '@/*': ['*'] },
        target: 'ESNext',
    },
    exclude: ['**/*.test.ts', '**/*.spec.ts'],
};
