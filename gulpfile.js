
var gulp         = require( 'gulp' );
var autoprefixer = require( 'gulp-autoprefixer' );
var bump         = require( 'gulp-bump' );
var cssnano      = require( 'gulp-cssnano' );
var jshint       = require( 'gulp-jshint' );
var notify       = require( 'gulp-notify' );
var rename       = require( 'gulp-rename' );
var sass         = require( 'gulp-sass' );
var uglify       = require( 'gulp-uglify' );
var watch        = require( 'gulp-watch' );

var paths = {
	dist: 'dist/',
	js  : 'src/star-rating.js',
	scss: 'src/star-rating.scss',
};

/* CSS Task
 -------------------------------------------------- */
gulp.task( 'css', function ()
{
	return gulp
		.src( paths.scss )
		.pipe( sass({ outputStyle: 'expanded' }).on( 'error', sass.logError ) )
		.pipe( autoprefixer() )
		.pipe( gulp.dest( paths.dist ) )
		.pipe( rename({ suffix: '.min' }) )
		.pipe( cssnano() )
		.pipe( gulp.dest( paths.dist ) )
		.pipe( notify({
			message: 'CSS Task complete!',
			onLast : true
		}) );
});

/* JS Task
 -------------------------------------------------- */
gulp.task( 'js', function ()
{
	return gulp
		.src( paths.js )
		.pipe( jshint() )
		.pipe( jshint.reporter( 'jshint-stylish' ) )
		.pipe( jshint.reporter( 'fail' ).on( 'error', function() { this.emit( 'end' ); }) )
		.pipe( gulp.dest( paths.dist ) )
		.pipe( uglify({ preserveComments: 'license' }) )
		.pipe( rename({ suffix: '.min' }) )
		.pipe( gulp.dest( paths.dist ) )
		.pipe( notify({
			message: 'JS Task complete!',
			onLast : true
		}) );
});

/* Version Bump Task
 -------------------------------------------------- */
gulp.task( 'bump', function ()
{
	return gulp
		.src([
			'bower.json',
			'package.json',
			'src/star-rating.js',
			'src/star-rating.scss',
		], { base: './' })
		.pipe( bump())
		.pipe( gulp.dest( './' ));
});

/* Watch Task
 -------------------------------------------------- */
gulp.task( 'watch', function ()
{
	gulp.watch( paths.js, ['js'] );
	gulp.watch( paths.scss, ['css'] );
});

/* Default Task
 -------------------------------------------------- */
gulp.task( 'default', function ()
{
	gulp.start( 'css', 'js' );
});
