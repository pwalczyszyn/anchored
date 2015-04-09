'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var browserify = require('browserify');
var watchify = require('watchify');
var reactify = require('reactify');
var babelify = require('babelify');
var envify = require('envify');

var handleErrors = require('./errors');
var source = require('vinyl-source-stream');

var debug = process.env.NODE_ENV !== 'production';
var dest = debug ? 'build/Debug/js' : 'build/Release/js';

var scripts = global.scripts = function(watch) {
	var bundler, rebundle;
	bundler = browserify('./src/js/main.js', {
		debug: debug,
		cache: {}, // required for watchify
		packageCache: {}, // required for watchify
		fullPaths: watch // required to be true only for watchify
	});
	if (watch) {
		bundler = watchify(bundler);
	}

	// bundler.transform(reactify, {es6: true});
	// bundler.transform(reactify);
	bundler.transform(babelify);
	bundler.transform(envify);

	rebundle = function() {

		gutil.log(gutil.colors.magenta('Regenerated app.js'));

		return bundler.bundle()
			.on('error', handleErrors)
			.pipe(source('app.js'))
			.pipe(gulp.dest(dest));
	};

	bundler.on('update', rebundle);
	return rebundle();
};


gulp.task('background-js', function() {
	var debug = process.env.NODE_ENV !== 'production';
	var dest = debug ? 'build/Debug' : 'build/Release';

	// This one does nothing except moving the html file from src to www
	return gulp.src('./src/js/background.js')
		.pipe(gulp.dest(dest));
});

gulp.task('scripts', ['background-js'], function() {
	return scripts(false);
});
