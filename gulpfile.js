var args           = require('yargs').argv;
var autoprefixer   = require('gulp-autoprefixer');
var browserSync    = require('browser-sync').create();
var bump           = require('gulp-bump');
var cssnano        = require('gulp-cssnano');
var gulp           = require('gulp');
var jshint         = require('gulp-jshint');
var moduleImporter = require('sass-module-importer');
var pump           = require('pump');
var rename         = require('gulp-rename');
var sass           = require('gulp-sass');
var uglify         = require('gulp-uglify');
var yaml           = require('yamljs');

var config = yaml.load('config.yml');

gulp.task('bump', function() {
    var type = 'patch';
    ['prerelease','patch','minor','major'].some(function(arg) {
        if(!args[arg])return;
        type = arg;
        return true;
    });
    return pump([
        gulp.src(config.bump, {base: '.'}),
        bump({type: type, keys: ['version']}),
        gulp.dest('.'),
    ]);
});

gulp.task('js', function() {
    return pump([
        gulp.src(config.watch.js),
        uglify({
            output: {comments: 'some'},
        }),
        rename({suffix: '.min'}),
        gulp.dest(config.dest),
        browserSync.stream(),
    ]);
});

gulp.task('jshint', function() {
    return pump([
        gulp.src(config.watch.js),
        jshint(),
        jshint.reporter('jshint-stylish'),
        jshint.reporter('fail'),
    ]);
});

gulp.task('scss', function() {
    return pump([
        gulp.src(config.watch.scss, {base: '.'}),
        sass({
            importer: moduleImporter(),
            outputStyle: 'expanded',
        }).on('error', sass.logError),
        autoprefixer(),
        cssnano({
            minifyFontValues: false,
            zindex: false,
        }),
        rename(function(path) {
            path.dirname = path.dirname.replace('src','dist');
            path.dirname = path.dirname.replace('scss','css');
        }),
        gulp.dest('.'),
        browserSync.stream(),
    ]);
});

gulp.task('watch', function() {
    browserSync.init({
        server: {baseDir: '.'},
    });
    gulp.watch(config.watch.js, gulp.parallel('jshint','js'));
    gulp.watch(config.watch.scss, gulp.series('scss'));
    gulp.watch(config.watch.html).on('change', browserSync.reload);
});

gulp.task('default', gulp.parallel('scss','jshint','js'));
