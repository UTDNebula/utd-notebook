import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier/flat';
import { defineConfig, globalIgnores } from 'eslint/config';

const parentSourcePath = String.raw`(?:\.\./)+(?:src/)?`;

const baseRestrictedImportPatterns = [
  {
    group: ['@src/nebula-library', '@src/nebula-library/*'],
    message:
      "Please use the shorter path alias '@nebula-library/*' instead of '@src/nebula-library/*'.",
  },
  {
    group: [
      '@src/components',
      '@src/components/*',
      '@src/constants',
      '@src/constants/*',
      '@src/data',
      '@src/data/*',
      '@src/icons',
      '@src/icons/*',
      '@src/scripts',
      '@src/scripts/*',
      '@src/styles',
      '@src/styles/*',
      '@src/trpc',
      '@src/trpc/*',
      '@src/utils',
      '@src/utils/*',
    ],
    message: 'Import from the owning lib or systems directory instead.',
  },
];

const appLayerRestriction = {
  regex: `^(?:@src/app(?:/|$)|${parentSourcePath}app(?:/|$))`,
  message: 'Next.js route entrypoints must not be imported outside src/app.',
};

const systemsLayerRestriction = {
  regex: `^(?:@src/systems(?:/|$)|${parentSourcePath}systems(?:/|$))`,
  message: 'Library and server code must not depend on feature systems.',
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'styleguide/build/**',
    'styleguide.config.js',
    'src/nebula-library/**',
  ]),
  // Allow HTML <img> elements in Next.JS generated image metadata files
  {
    files: ['src/**/{opengraph,twitter}-image.{js,jsx,ts,tsx}'],
    rules: {
      '@next/next/no-img-element': 'off',
    },
  },
  // Enforce shorter path alias '@nebula-library/*' instead of '@src/nebula-library/*'
  {
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: baseRestrictedImportPatterns,
        },
      ],
    },
  },
  {
    files: ['src/{lib,server,systems}/**/*.{js,jsx,mjs,ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [...baseRestrictedImportPatterns, appLayerRestriction],
        },
      ],
    },
  },
  {
    files: ['src/{lib,server}/**/*.{js,jsx,mjs,ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            ...baseRestrictedImportPatterns,
            appLayerRestriction,
            systemsLayerRestriction,
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
