'use strict';

var gulp = require('gulp');

gulp.task('watch', function() {
  var debug = process.env.NODE_ENV !== 'production';
  var dest = debug ? 'build/Debug' : 'build/Release';

	gulp.watch('src/img/**', ['images']);
	gulp.watch('src/scss/**/*.scss', ['styles']);
	gulp.watch('src/index.html', ['html']);

	// Watch .js files
	global.scripts(true);
});
