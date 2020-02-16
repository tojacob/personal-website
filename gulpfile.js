'use strict';
const { src, dest, series, parallel, watch } = require('gulp');
const pug = require('gulp-pug');
const sass = require('gulp-sass');
sass.compiler = require('node-sass');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();
const postcss = require('gulp-postcss');
const del = require('del');
const cssnano = require('cssnano');
const autoprefixer = require('autoprefixer');

// ===============
// COMMON
// ===============

// Constants
const distFolder = './dist';
const srcFolder = './src';
const files = {
  styles: {
    main: `${srcFolder}/styles/app.scss`,
    src: `${srcFolder}/styles/**/*.*`,
    dist: `${distFolder}/assets/styles`
  },
  assets: {
    src: `${srcFolder}/assets/**/*.*`,
    dist: `${distFolder}/assets/`
  },
  views: {
    src: `${srcFolder}/views/pages/**/*.pug`,
    watchs: `${srcFolder}/views/**/*.pug`,
    dist: distFolder
  }
}

// Clean dist folder before compile files
function cleanDist() {
  return del(distFolder);
}

// Move content from 'src/assets' to 'dist/assets' folder
function assetsToDist() {
  return src(files.assets.src)
    .pipe(dest(files.assets.dist));
}

// Compile pug to html
function compileViews() {
  return src(files.views.src)
    .pipe(pug())
    .pipe(dest(distFolder));
}

function commonTasks() {
  return series(
    cleanDist,
    assetsToDist,
    compileViews
  );
}

// ===============
// DEVELOPMENT
// ===============

// Compile scss to css and add source map
function devStyles() {
  return src(files.styles.main)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(dest(files.styles.dist))
    .pipe(browserSync.stream());
}

// Start local server, live reload and call others dev tasks
function devServer(cb) {
  browserSync.init({
    server: distFolder,
    open: false
  });

  watch(files.styles.src, parallel(devStyles));
  watch(files.views.watchs, parallel(compileViews))
    .on('change', browserSync.reload);
  watch(files.assets.src, parallel(assetsToDist));

  return cb;
}

// Run development tasks
function devTasks() {
  return series(
    commonTasks(),
    devStyles,
    devServer
  );
}

// ===============
// PRODUCTION
// ===============

// Compile scss to css, add prefixes and minify.
function prodStyles() {
  return src(files.styles.main)
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([
      autoprefixer(),
      cssnano({ preset: 'default' })
    ]))
    .pipe(dest(files.styles.dist));
}

// Run production tasks
function prodTasks() {
  return series(commonTasks(), prodStyles);
}

// ====================
// Public tasks
// ====================
exports.devTasks = devTasks();
exports.prodTasks = prodTasks();
