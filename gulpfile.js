'use strict';
const gulp = require('gulp');
const pug = require('gulp-pug');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();
const postcss = require('gulp-postcss');
const cssnano = require('cssnano');
const autoprefixer = require('autoprefixer');
const purgecss = require('gulp-purgecss');
const purgeHtml = require('purgecss-from-html');

// ===============
// COMMON
// ===============

// Compile pug to html
gulp.task('views', function buildHTML() {
  return gulp
    .src('./src/views/**/*.pug')
    .pipe(pug())
    .pipe(gulp.dest('./public/'));
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
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./public/styles'))
    .pipe(browserSync.stream());
});

// Start local server, live reload and call others dev tasks
gulp.task('dev-server', ['views', 'dev-styles'], function() {
  browserSync.init({
    server: './public'
  });

  gulp.watch('./src/styles/**/*.scss', ['dev-styles']);
  gulp
    .watch('./src/views/**/*.pug', ['views'])
    .on('change', browserSync.reload);
});

// Run development tasks
gulp.task('default', ['dev-server']);

// ===============
// PRODUCTION
// ===============

// Compile scss to css, add prefixes and minify.
gulp.task('prod-styles', function() {
  return gulp
    .src('./src/styles/app.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([autoprefixer(), cssnano({ preset: 'default' })]))
    .pipe(gulp.dest('./public/styles'));
});

// Remove unused css
gulp.task('prod-purge-styles', ['prod-styles'], function() {
  return gulp
    .src('./public/styles/*.css')
    .pipe(
      purgecss({
        content: ['./public/**/*.html'],
        extractors: [
          {
            extractor: purgeHtml,
            extensions: ['html']
          }
        ]
      })
    )
    .pipe(gulp.dest('./public/styles'));
});

// Run production tasks
gulp.task('prod', ['views', 'prod-purge-styles']);
