export default {
  "compilerOptions": {
    "outDir": "dist",
    "esModuleInterop": true,
    "moduleResolution": "bundler",
    "paths": {
      "@": [
        "."
      ],
      "@/*": [
        "./*"
      ]
    },
    "target": "ESNext",
    "module": "ESNext"
  },
  "include": ["**/src/*.ts"],
  "exclude": [
    "**/*.test.ts",
    "**/*.spec.ts"
  ]
};
