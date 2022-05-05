/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import json from '@rollup/plugin-json';
import { vanillaExtractPlugin } from '@vanilla-extract/rollup-plugin';
import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';
import sourceMaps from 'rollup-plugin-sourcemaps';
import postcss from 'rollup-plugin-postcss';
import eslint from '@rbnlffl/rollup-plugin-eslint';
import url from 'postcss-url';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import autoprefixer from 'autoprefixer';
import path from 'path';

export default [
  {
    input: path.join(process.cwd(), 'src/index.ts'),
    external: (id) => {
      if (id === 'babel-plugin-transform-async-to-promises/helpers') {
        return false;
      }

      return !id.startsWith('.') && !path.isAbsolute(id);
    },
    treeshake: {
      propertyReadSideEffects: false,
    },
    plugins: [
      vanillaExtractPlugin(),
      // eslint({
      //   fix: false,
      //   throwOnError: true,
      //   throwOnWarning: true,
      //   extensions: ['.ts', '.tsx', '.test.ts', '.test.tsx'],
      //   filterInclude: 'src/**',
      //   filterExclude: ['**/*.scss', '**/*.css', '**/*.md', '**/*.csv', 'dist/**', '**/*.json'],
      //   useEslintrc: true,
      // }),
      // depsExternal(),
      resolve({
        mainFields: ['module', 'browser', 'main'],
        extensions: ['.mjs', '.cjs', '.js', '.ts', '.tsx', '.json', '.jsx'],
      }),
      commonjs({
        // use a regex to make sure to include eventual hoisted packages
        include: /\/regenerator-runtime\//,
      }),
      json(),
      postcss({
        extract: true,
        modules: false,
        autoModules: true,
        sourceMap: true,
        use: ['sass'],
        plugins: [
          autoprefixer(),
          url({
            url: 'inline',
          }),
        ],
      }),
      typescript({
        typescript: require('typescript'),
        tsconfig: './tsconfig.json',
        abortOnError: true,
        tsconfigDefaults: {
          compilerOptions: {
            sourceMap: true,
            declaration: true,
            target: 'esnext',
            jsx: 'react-jsx',
          },
          useTsconfigDeclarationDir: true,
        },
        tsconfigOverride: {
          compilerOptions: {
            sourceMap: true,
            target: 'esnext',
          },
        },
      }),
      terser({
        output: { comments: false },
        compress: {
          keep_infinity: true,
          pure_getters: true,
          passes: 10,
        },
        ecma: 5,
        toplevel: false,
      }),
      sourceMaps(),
    ],
    output: [
      {
        dir: 'dist',
        format: 'esm',
        preserveModules: true,
        preserveModulesRoot: 'src',

        // Change .css.js files to something else so that they don't get re-processed by consumer's setup
        entryFileNames({ name }) {
          return `${name.replace(/\.css$/, '.css.vanilla')}.js`;
        },

        // Apply preserveModulesRoot to asset names
        assetFileNames({ name }) {
          return name.replace(/^src\//, '');
        },

        exports: 'named',
        sourcemap: true,
        esModule: true,
        interop: 'auto',
        freeze: false,
        globals: { react: 'React' },
      },
    ],
  },
];
