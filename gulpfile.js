'use strict';
const gulp = require('gulp');
const pug = require('gulp-pug');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();
const postcss = require('gulp-postcss');
const tailwindcss = require('tailwindcss');
const del = require('del');
const cssnano = require('cssnano');
const autoprefixer = require('autoprefixer');
const purgecss = require('gulp-purgecss');
const purgeHtml = require('purgecss-from-html');

// ===============
// COMMON
// ===============

// Folders
const DIST = './docs',
  DIST_STYLES = `${DIST}/assets/styles`,
  DIST_ASSETS = `${DIST}/assets/`,
  TO_DELETE = [`${DIST}/*.html`, `${DIST}/articles`, `${DIST}/assets`],
  SRC_ASSETS = ['./src/assets/**/*.*'],
  SRC_VIEWS = ['./src/views/pages/**/*.pug'],
  SRC_STYLES = './src/styles/**/*.*',
  MAIN_STYLE = './src/styles/app.scss',
  TW_STYLE = './src/styles/tailwild/utilities.js';

// Clean dist folder before compile files
gulp.task('clean-dist', function() {
  return del(TO_DELETE);
});

// Move content from 'src/assets' to 'dist/assets' folder
gulp.task('assets-to-dist', function() {
  return gulp.src(SRC_ASSETS).pipe(gulp.dest(DIST_ASSETS));
});

// Compile pug to html
gulp.task('views', function() {
  return gulp
    .src(SRC_VIEWS)
    .pipe(pug())
    .pipe(gulp.dest(DIST));
});

// ===============
// DEVELOPMENT
// ===============

// Compile scss to css and add source map
gulp.task('dev-styles', function() {
  return gulp
    .src(MAIN_STYLE)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([tailwindcss(TW_STYLE)]))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(DIST_STYLES))
    .pipe(browserSync.stream());
});

// Start local server, live reload and call others dev tasks
gulp.task('dev-server', function() {
  browserSync.init({
    server: DIST
  });

  gulp.watch(SRC_STYLES, gulp.parallel('dev-styles'));
  gulp
    .watch(SRC_VIEWS, gulp.parallel('views'))
    .on('change', browserSync.reload);
});

// Run development tasks
gulp.task(
  'dev',
  gulp.series(
    'clean-dist',
    'assets-to-dist',
    'views',
    'dev-styles',
    'dev-server'
  )
);

// ===============
// PRODUCTION
// ===============

// Compile scss to css, add prefixes and minify.
gulp.task('prod-styles', function() {
  return gulp
    .src(MAIN_STYLE)
    .pipe(sass().on('error', sass.logError))
    .pipe(
      postcss([
        tailwindcss(TW_STYLE),
        autoprefixer(),
        cssnano({ preset: 'default' })
      ])
    )
    .pipe(gulp.dest(DIST_STYLES));
});

// Remove unused css
gulp.task('prod-purge-styles', function() {
  return gulp
    .src(`${DIST_STYLES}/*.css`)
    .pipe(
      purgecss({
        content: [`${DIST}/**/*.html`],
        extractors: [
          {
            extractor: purgeHtml,
            extensions: ['html']
          }
        ]
      })
    )
    .pipe(gulp.dest(DIST_STYLES));
});

// Run production tasks
gulp.task(
  'prod',
  gulp.series('clean-dist', 'assets-to-dist', 'views', 'prod-styles')
);
