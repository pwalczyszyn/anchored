'use strict';

var gulp = require('gulp');

var gulpif = require('gulp-if');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var cssimport = require('gulp-cssimport');

gulp.task('styles', function() {
  var debug = process.env.NODE_ENV !== 'production';
  var dest = debug ? 'build/Debug/css' : 'build/Release/css';

	return gulp.src('src/scss/*.scss')
		.pipe(gulpif(debug, sourcemaps.init()))
		.pipe(sass({
			includePaths: [
				'bower_components/modularized-normalize-scss'
			]
		}))
		.pipe(cssimport({
			extensions: ['css']
		}))
		.pipe(autoprefixer())
		.pipe(gulpif(debug, sourcemaps.write()))
		.pipe(gulp.dest(dest));
});
