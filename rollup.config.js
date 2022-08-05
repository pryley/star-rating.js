import babel from '@rollup/plugin-babel';
import filesize from 'rollup-plugin-filesize';
import postcss from 'rollup-plugin-postcss'
import resolve from '@rollup/plugin-node-resolve';
import { terser } from "rollup-plugin-terser";

const production = process.env.NODE_ENV === 'production';

export default [
  {
    input: 'src/index.js',
    output: [
      {
        file: 'dist/star-rating.cjs.js',
        format: 'cjs',
        exports: 'auto',
      },
      {
        file: 'dist/star-rating.esm.js',
        format: 'es',
      },
      {
        name: 'StarRating',
        file: 'dist/star-rating.js',
        format: 'iife',
      },
      {
        name: 'StarRating',
        file: 'dist/star-rating.min.js',
        format: 'iife',
        plugins: [terser()],
      },
    ],
    plugins: [
      resolve(),
      filesize(),
      babel({
        babelHelpers: 'bundled',
        presets: [
          ['@babel/preset-env', {
            include: ['@babel/plugin-proposal-optional-chaining'],
          }],
        ],
      }),
    ]
  },
  {
    input: 'src/index.css',
    output: {
      file: 'dist/star-rating.css',
    },
    plugins: [
      filesize(),
      postcss({
        extract: true,
      }),
    ]
  },
  {
    input: 'src/index.css',
    output: {
      file: 'dist/star-rating.min.css',
    },
    plugins: [
      filesize(),
      postcss({
        extract: true,
        minimize: true,
      }),
    ]
  },
  {
    input: 'demo/styles.css',
    output: {
      file: 'demo/styles.min.css',
    },
    plugins: [
      filesize(),
      postcss({
        extract: true,
        minimize: true,
      }),
    ]
  },
]
