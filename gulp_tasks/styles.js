'use strict';

var gulp = require('gulp');

var gulpif = require('gulp-if');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var cssimport = require('gulp-cssimport');

gulp.task('fonts', function() {
  var debug = process.env.NODE_ENV !== 'production';
  var dest = debug ? 'build/Debug/css/fonts' : 'build/Release/css/fonts';

  // This one does nothing except moving the html file from src to www
  return gulp.src([
      './src/fonts/icomoon/*.{eot,svg,ttf,woff}'
    ])
    .pipe(gulp.dest(dest));
});

gulp.task('styles', ['fonts'], function() {
  var debug = process.env.NODE_ENV !== 'production';
  var dest = debug ? 'build/Debug/css' : 'build/Release/css';

  return gulp.src('src/scss/*.scss')
    .pipe(gulpif(debug, sourcemaps.init()))
    .pipe(sass())
    .pipe(cssimport({
      extensions: ['css']
    }))
    .pipe(autoprefixer())
    .pipe(gulpif(debug, sourcemaps.write()))
    .pipe(gulp.dest(dest));
});
