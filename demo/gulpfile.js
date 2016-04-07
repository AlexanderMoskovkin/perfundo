/**
 * Configuration
 */
var config = {
  host: 'devbox.dev',
  subdirectory: '/perfundo/demo',
  styles: {
    destination: 'dist',
    watchDirectories: ['scss/**/*']
  },
  scripts: {
    destination: 'dist',
    destinationFileName: 'index.js',
    browserifyEntries: ['js/index.js'],
    watchDirectories: ['js/**/*']
  },
  sassOptions: {
    precision: 7
  }
};

/**
 * Plugins
 */
var browserSync  = require('browser-sync').create();
var browserify   = require('browserify');
var del          = require('del');
var eyeglass     = require('eyeglass');
var fs           = require('fs');
var gulp         = require('gulp');
var autoprefixer = require('gulp-autoprefixer');
var cssnano      = require('gulp-cssnano');
var minifyCss    = require('gulp-minify-css');
var rename       = require('gulp-rename');
var sass         = require('gulp-sass');
var sourcemaps   = require('gulp-sourcemaps');
var uglify       = require('gulp-uglify');
var buffer       = require('vinyl-buffer');
var source       = require('vinyl-source-stream');

/**
 * Styles
 */
// Build css from scss source files.
gulp.task('styles:build', ['clean:styles'], function () {
  // Use the watch directories config variable to define the src directories.
  var srcDirectories = [];
  config.styles.watchDirectories.forEach(function (value) {
    srcDirectories.push(value + '.scss');
  });
  return gulp.src(srcDirectories)
    .pipe(sourcemaps.init())
    .pipe(sass(eyeglass(config.sassOptions)).on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(config.styles.destination))
    .pipe(browserSync.stream());
});

// Minify and optimize the css code generated by the build process.
gulp.task('styles:minify', ['styles:build'], function () {
  return gulp.src(config.styles.destination + '/*.css')
    .pipe(minifyCss())
    .pipe(cssnano())
    .pipe(rename(function (path) {
      path.basename += '.min';
    }))
    .pipe(gulp.dest(config.styles.destination))
    .pipe(browserSync.stream());
});

/**
 * Scripts
 */
// Bundle js resources with browserify and create a minified output file.
gulp.task('scripts:build', ['clean:scripts'], function () {
  // Set up the browserify instance.
  var b = browserify({
    entries: config.scripts.browserifyEntries,
    debug: true
  });

  return b.bundle()
    .pipe(source(config.scripts.destinationFileName))
    .pipe(buffer())
    .pipe(gulp.dest(config.scripts.destination))
    .pipe(uglify())
    .pipe(rename(function (path) {
      path.basename += '.min';
    }))
    .pipe(gulp.dest(config.scripts.destination))
    .pipe(browserSync.stream());
});

/**
 * Clean
 *
 * Remove compiled files before regenerating them.
 */
gulp.task('clean:styles', function () {
  return del([
    config.styles.destination + '/**/*.css'
  ]);
});

gulp.task('clean:scripts', function () {
  return del([
    config.scripts.destination + '/**/*.js'
  ]);
});

/**
 * Watch
 *
 * Watch files for changes.
 */
gulp.task('watch', function () {
  browserSync.init({
    proxy: config.host + config.subdirectory
  });
  gulp.watch(config.styles.watchDirectories, ['styles:minify']);
  gulp.watch(config.scripts.watchDirectories, ['scripts:build']);
});

/**
 * Default task
 */
// Run this task with `gulp`.
gulp.task('default', function () {
  gulp.start('watch');
});