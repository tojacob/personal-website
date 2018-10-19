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

// Clean dist folder before compile files
gulp.task('clean-dist', function() {
  return del([
    './tojacob.github.io/*.html',
    './tojacob.github.io/articles',
    './tojacob.github.io/assets'
  ]);
});

// Move content from 'src/assets' to 'tojacob.github.io/assets' folder
gulp.task('assets-to-dist', function() {
  return gulp
    .src(['./src/assets/**/*.*'])
    .pipe(gulp.dest('./tojacob.github.io/assets'));
});

// Compile pug to html
gulp.task('views', function() {
  return gulp
    .src(['./src/views/pages/**/*.pug'])
    .pipe(pug())
    .pipe(gulp.dest('./tojacob.github.io/'));
});

// ===============
// DEVELOPMENT
// ===============

// Compile scss to css and add source map
gulp.task('dev-styles', function() {
  return gulp
    .src('./src/styles/app.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([tailwindcss('./src/styles/tailwild/utilities.js')]))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./tojacob.github.io/assets/styles'))
    .pipe(browserSync.stream());
});

// Start local server, live reload and call others dev tasks
gulp.task('dev-server', function() {
  browserSync.init({
    server: './tojacob.github.io'
  });

  gulp.watch('./src/styles/**/*.*', gulp.parallel('dev-styles'));
  gulp
    .watch('./src/views/**/*.pug', gulp.parallel('views'))
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
    .src('./src/styles/app.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(
      postcss([
        tailwindcss('./src/styles/tailwild/utilities.js'),
        autoprefixer(),
        cssnano({ preset: 'default' })
      ])
    )
    .pipe(gulp.dest('./tojacob.github.io/assets/styles'));
});

// Remove unused css
gulp.task('prod-purge-styles', function() {
  return gulp
    .src('./tojacob.github.io/styles/*.css')
    .pipe(
      purgecss({
        content: ['./tojacob.github.io/**/*.html'],
        extractors: [
          {
            extractor: purgeHtml,
            extensions: ['html']
          }
        ]
      })
    )
    .pipe(gulp.dest('./tojacob.github.io/assets/styles'));
});

// Run production tasks
gulp.task(
  'prod',
  gulp.series('clean-dist', 'assets-to-dist', 'views', 'prod-styles')
);
