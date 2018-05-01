var args           = require('yargs').argv;
var autoprefixer   = require('gulp-autoprefixer');
var browserSync    = require('browser-sync').create();
var bump           = require('gulp-bump');
var cssnano        = require('gulp-cssnano');
var gulp           = require('gulp');
var gulpif         = require('gulp-if');
var jshint         = require('gulp-jshint');
var moduleImporter = require('sass-module-importer');
var notify         = require('gulp-notify');
var pump           = require('pump');
var rename         = require('gulp-rename');
var sass           = require('gulp-sass');
var uglify         = require('gulp-uglify');
var watch          = require('gulp-watch');

var paths = {
	bump: {
		'version': [
			'bower.json',
			'package.json',
			'src/star-rating.js',
			'src/star-rating.scss',
		],
	},
	dist: 'dist/',
	js: 'src/star-rating.js',
	scss: [
		'demo/scss/**/*.scss',
		'src/star-rating.scss',
	],
};

/* CSS Task
 -------------------------------------------------- */
gulp.task('css', function() {
	pump([
		gulp.src(paths.scss, { base: '.' }),
		sass({
			importer: moduleImporter(),
			outputStyle: 'expanded'
		}).on('error', sass.logError),
		autoprefixer(),
		gulpif(args.production, cssnano()),
		rename(function(path) {
			path.dirname = path.dirname.replace('src', 'dist');
			path.dirname = path.dirname.replace('scss', 'css');
		}),
		gulp.dest('.'),
		browserSync.stream(),
		notify({
			message: 'CSS Task complete!',
			onLast: true,
		}),
	]);
});

/* JSHint Task
 -------------------------------------------------- */
gulp.task('jshint', function() {
	pump([
		gulp.src(paths.js),
		jshint(),
		jshint.reporter('jshint-stylish'),
		jshint.reporter('fail'),
		notify({
			message: 'JSHint Task complete!',
			onLast: true,
		}),
	]);
});

/* JS Task
 -------------------------------------------------- */
gulp.task('js', function() {
	pump([
		gulp.src(paths.js),
		gulpif(args.production, uglify({
			output: { comments: 'some' },
		})),
		rename({ suffix: '.min' }),
		gulp.dest(paths.dist),
		browserSync.stream(),
		notify({
			message: 'JS Task complete!',
			onLast: true,
		}),
	]);
});

/* Version Task
 -------------------------------------------------- */
gulp.task('bump', function() {
	['patch', 'minor', 'major'].some(function(arg) {
		if(!args[arg])return;
		for(var key in paths.bump) {
			if(!paths.bump.hasOwnProperty(key))continue;
			gulp.src(paths.bump[key], { base: '.' })
				.pipe(bump({ type: arg, key: key }))
				.pipe(gulp.dest('.'));
		}
		return true;
	});
});

/* Watch Task
 -------------------------------------------------- */
gulp.task('watch', function() {
	browserSync.init({
		server: { baseDir: '.' }
	});
	gulp.watch(paths.js, ['js']);
	gulp.watch(paths.scss, ['css']);
	gulp.watch('*.html').on('change', browserSync.reload);
});

/* Default Task
 -------------------------------------------------- */
gulp.task('default', function() {
	gulp.start('css', 'js');
});
