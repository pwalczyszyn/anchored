'use strict';

var changed = require('gulp-changed');
var gulp = require('gulp');

gulp.task('manifest', function() {
  var debug = process.env.NODE_ENV !== 'production';
  var dest = debug ? 'build/Debug' : 'build/Release';

  // This one does nothing except moving the html file from src to www
  return gulp.src('./src/manifest.json')
    .pipe(changed(dest))
    .pipe(gulp.dest(dest));
});
