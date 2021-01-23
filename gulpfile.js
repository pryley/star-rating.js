var args = require('yargs').argv;
var bump = require('gulp-bump');
var gulp = require('gulp');
var pump = require('pump');

gulp.task('bump', function(cb) {
  var type = 'patch';
  ['prerelease','patch','minor','major'].some(function(arg) {
    if(!args[arg])return;
    type = arg;
    return true;
  });
  pump([
    gulp.src(['index.html', 'package.json', 'src/index.js', 'src/index.css'], {base: '.'}),
    bump({type: type, keys: ['version','ver=']}),
    gulp.dest('.'),
  ], cb);
});
