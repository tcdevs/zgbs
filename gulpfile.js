/**
 * Z3bbster Gulp Build System
 */

////////////////////////////
// LOAD REQUIRED PACKAGES //
////////////////////////////
var gulp = require('gulp'),
	del = require('del'),
	browserSync = require('browser-sync'),
    plugins = require('gulp-load-plugins')(); // package.json 

////////////////////////
// PLUGINS REFERENCES //
////////////////////////
var util = plugins.util,
	templateCache = plugins.angularTemplatecache,
	size = plugins.filesize;

///////////////////////////
// DEFAULT PROJECT PATHS //
///////////////////////////
var paths = {
  index: 'app/index.html',
  templates: 'app/views/*.html',
  scripts: 'app/scripts/**/*',
  less: 'app/less/main.less',
  styles: 'app/css/**/*',
  assets: 'app/assets/**/*',
  fonts: 'app/assets/fonts/**/*',
  images: 'app/assets/img/**/*',
  jsons: ['./bower.json', './package.json'], // Update bower, npm at once
  dist: 'dist/'
};

////////////////
// INIT PHASE //
////////////////
util.log( '=============================================================');
util.log( 
	util.colors.red('z3bbster'), 
	util.colors.white('Gulp'), 
	util.colors.blue('Buildsystem') ,
	util.colors.yellow(' 20/01/2015 - V.0.0.1'));
util.log( '=============================================================');

//////////////////////
// BOWER GULP TASKS //
//////////////////////

gulp.task('bower', function() { 
	// This will default 'install' all Bower packages from bower.json
	return plugins.bower(); 
});

// This will 'update' all local Bower packages in 
gulp.task('bower:update', function() { 
	return plugins.bower({ cmd: 'update'}); 
});

///////////////////////////////////////
// CLEANING & HOUSKEEPING GULP TASKS //
///////////////////////////////////////

// Clean the 'dist' folder
gulp.task('clean:dist', function (cb) {
	del(['dist'], cb);
});

// Clean the 'tmp' folder
gulp.task('clean:tmp', function (cb) {
	del(['tmp'], cb);
});


////////////////////////
// VERSION BUMP TASKS //
////////////////////////

gulp.task('bump', function(){
	gulp.src(paths.jsons)
  		.pipe( plugins.bump())
  		.on('error', function(err) { gutil.log(err.message); })
  		.pipe(gulp.dest('./'))
  		.pipe(size());
});

gulp.task('bump:minor', function(){
	gulp.src(paths.jsons)
  		.pipe( plugins.bump({type:'minor'}))
  		.on('error', function(err) { gutil.log(err.message); })
  		.pipe(gulp.dest('./'))
  		.pipe(size());
});

gulp.task('bump:major', function(){
	gulp.src(paths.jsons)
  		.pipe( plugins.bump({type:'major'}))
  		.on('error', function(err) { gutil.log(err.message); })
  		.pipe(gulp.dest('./'))
  		.pipe(size());
});

gulp.task('bump:init', function(){
	gulp.src(paths.jsons)
  		.pipe( plugins.bump({version: '0.0.0'}))
		.on('error', function(err) { util.log(err.message); })
		.pipe(gulp.dest('./'))
		.pipe(size());
});


/////////////////////////////
// ANGULARJS RELATED TASKS //
/////////////////////////////

gulp.task('ng-templates', function() {
	// Concatenates and registers AngularJS templates in the $templateCache.
	gulp.src( paths.templates )
		.pipe( plugins.confirm({
	     	// Static text.
	      	question: 'You want to generate $templateCache. Continue?',
	      	continue: function(answer) {
	        	return answer.toLowerCase() === 'y';
	      	}
	    }))
		.pipe( templateCache() )
        .pipe( gulp.dest(paths.dist + 'js') )
        .pipe(size());
});

/////////////////////////
// OPTIMIZE GULP TASKS //
/////////////////////////

// The main 'usemin' gulp task
gulp.task('usemin',['clean:dist'], function () {
  return gulp.src('app/index.html')
      .pipe( plugins.usemin({
        css: [ plugins.minifyCss({benchmark: true, debug: true}), 'concat', plugins.rev()],
        html: [ plugins.minifyHtml({empty: true, cdata: true, comments: false, conditionals: true, spare: false, quotes: true })],
        js: [ plugins.uglify({mangle: false, preserveComments: 'some', compression: {warnings: true},  }), plugins.rev()]
      }))
      .on('error', function(err) { util.log(err.message); })
      .pipe(gulp.dest('./dist/'));
});

gulp.task('imagemin', function () {
    gulp.src(paths.assets)
    // Pass in options to the task
    .pipe( plugins.imagemin({
    	optimizationLevel: 5, 					//PNG level 0/7
    	progressive: true, 						//JPG
    	interlaced: false, 						//GIF
    	svgoPlugins: [							//SVG
    		{ removeViewBox: false }, 
    		{ removeEmptyAttrs: false }
    	], 	
    	use: []
    }))
    .pipe(size())
    .on('error', function(err) { gutil.log(err.message); })
    .pipe(gulp.dest('dist/assets/'));
});

//////////////////////////////
// PREPROCCESSOR GULP TASKS //
//////////////////////////////

gulp.task('less', function() {
    gulp.src([paths.less])
        .pipe( plugins.less())
        .pipe( plugins.license('WTFPL', {tiny: false, organization: 'Technische Centrale'}))
        .on('error', function(err) { gutil.log(err.message); })
        .pipe(gulp.dest('app/styles'))
        .pipe(size());
});

gulp.task('jshint', function () {
    gulp.src([paths.scripts])
    	.pipe(plugins.jshint({enforceall: false}))
        .pipe(plugins.jshint.reporter("default"))
        .on('error', function(err) { gutil.log(err.message); });
});


////////////////////
// GIT GULP TASKS //
////////////////////

gulp.task('git:init', function(){
 	plugins.git.init(function (err) {
    	if (err) throw err;
  	});
});

gulp.task('git:add', function(){
	// git add .
	gulp.src('./')
    	.pipe(plugins.git.add());
});

gulp.task('git:commit', function(){
 	gulp.src('./')
    	.pipe(plugins.git.commit('initial commit'));
});

gulp.task('git:remote', function(){
	plugins.git.addRemote('origin', 'https://github.com/tcdevs/zgbs', function (err) {
    	if (err) throw err;
  	});
});

///////////////////////
// DEPLOY GULP TASKS //
///////////////////////

gulp.task('deploy:ftp', function () {
	return gulp.src('build/*')
        .pipe(ftp({
            host: 'website.com',
            user: 'johndoe',
            pass: '1234'
        }));
});

////////////////////////////
// BROWSERSYNC GULP TASKS //
////////////////////////////

// start DEVELOPMENT server
gulp.task('server:dev', function() {
    browserSync({
    	host: "localhost",
    	port: 8080,
    	logLevel: "debug", // debug/info/silent
    	logConnections: false,
    	logFileChanges: false,
    	browser: ["google chrome"],
    	logPrefix: "server:dev",
        server: {
            baseDir: "app"
        }
    });
});

// start PRODUCTION server
gulp.task('server:build', function() {
    browserSync({
    	host: "localhost",
    	port: 8080,
    	logLevel: "info", // debug/info/silent
    	logConnections: false,
    	logFileChanges: false,
    	browser: ["google chrome", "firefox", "internet explorer", "opera"],
    	logPrefix: "server:dist",
        server: {
            baseDir: "./dist"
        }
    });
});


///////////////////////////////////////////
// GLOBAL WATCH TASK FOR ALL FILE CHANGE //
///////////////////////////////////////////
gulp.task('watch', function() {
	browserSync.notify("Compiling, please wait!");
  	// Watch all JS files
  	gulp.watch(paths.scripts, [ 'jshint', browserSync.reload]);
  	// Watch all assets images, SVGs, etc
  	gulp.watch(paths.images, [ browserSync.reload]);
  	// Watch all html files incl. templates and views
  	gulp.watch(paths.index, browserSync.reload );
  	// Watch less file
  	gulp.watch(paths.less, [ 'less', browserSync.reload ]);
});

/////////////////////////////
// ALL THE MAIN GULP TASKS //
/////////////////////////////

// THE DEFAULT TASK
gulp.task('default', ['server:dev', 'watch']);
// gulp.task('default', function () {
// 	console.log('Grunt DEFAULT tasks!');
// });
// THE BUILD TASK
gulp.task('build', [  'usemin'], function () {
  gulp.start('images');
  gulp.start('template');
});
// THE TEST TASK
gulp.task('test', []);
//THE DEPLOY TASK
gulp.task('deploy', []);
