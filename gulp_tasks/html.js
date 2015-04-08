'use strict';

var gulp = require('gulp');
var gulpif = require('gulp-if');
// var embedlr = require('gulp-embedlr');
var changed = require('gulp-changed');

gulp.task('html', function() {
	var debug = process.env.NODE_ENV !== 'production';
	var dest = debug ? 'build/Debug' : 'build/Release';

	// This one does nothing except moving the html file from src to www
	return gulp.src('./src/index.html')
		.pipe(changed(dest))
		.pipe(gulp.dest(dest));
});
