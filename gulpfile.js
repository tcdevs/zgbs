/*!
 * Copyright (c) 2015, z3bbster Gulp Build System
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright notice,
 *       this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright notice,
 *       this list of conditions and the following disclaimer in the documentation
 *       and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER
 * OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
Date.prototype.getWeek = function() {
  var onejan = new Date(this.getFullYear(),0,1);
  return Math.ceil((((this - onejan) / 86400000) + onejan.getDay()+1)/7);
}

////////////////////////////
// LOAD REQUIRED PACKAGES //
////////////////////////////
var gulp = require('gulp'),
		del = require('del'),
		//rev = require('gulp-rev'),
		browserSync = require('browser-sync'),
		plugins = require('gulp-load-plugins')(), // package.json
		D = new Date(),
		d = D.getDay()+'-'+(D.getMonth() + 1)+'-'+D.getFullYear(),
		w = new Date().getWeek();

// All Gulp tasks from gulp folder
require('require-dir')('./gulp'); 

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
  zip: ['app/**/*', '!app/less/**', '!app/bower_components/**', 'gulpfile.js'],
  zip1: ['gulpfile.js','package.json', 'bower.json', 
  				'app/scripts/*', 'app/styles/*','app/assets/**/*','app/views/*',
  				'!app/less/', '!app/bower_components/', '!node_modules/','!dist/','!tmp/','!zips/','!dist/'],
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
	console.log('CLEAN:DIST TASK! Removed dist folder');
	del(['dist/**/*'], cb);
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
		.on('error', function(err) { util.log(err.message); })
		.pipe( gulp.dest(paths.dist + 'js') )
		.pipe(size());
});

gulp.task('ngmin', function () {
    return gulp.src('app/scripts/app.js')
        .pipe(plugins.ngAnnotate({dynamic: true, remove: false, single_quotes: true}))
        .on('error', function(err) { util.log(err.message); })
        .pipe(gulp.dest('app/scripts/'))
        .pipe(size());
});

/////////////////////////
// OPTIMIZE GULP TASKS //
/////////////////////////
// {benchmark: true, debug: true}
// {empty: true, cdata: true, comments: false, conditionals: true, spare: false, quotes: true }
// {mangle: false, preserveComments: 'some', compression: {warnings: true},  }

// The main 'usemin' gulp task
gulp.task('usemin',['clean:dist'], function () {
	gulp.src('./app/index.html')
    .pipe( plugins.usemin({
      	css: [ plugins.minifyCss(), 'concat'],
     	html: [ plugins.minifyHtml()]
      	js: [ plugins.uglify()]
    }))
    .on('error', function(err) { util.log(err.message); })
    .pipe(gulp.dest('dist/'));
});

gulp.task('compress', function() {
  gulp.src('app/scripts/*.js')
    .pipe(plugins.uglify())
    .pipe(plugins.stripDebug())
    .pipe(plugins.concat('all.js'))
    .pipe(gulp.dest('dist/js/'))
});

gulp.task('imagemin', function () {
	var svgoSettings = 
  gulp.src(paths.assets)
  	// Pass in options to the task
    .pipe( plugins.imagemin({
    	optimizationLevel: 5, 	//PNG level 0/7
    	progressive: true, 			//JPG
    	interlaced: false, 			//GIF
    	svgoPlugins: [					//SVG
    		{ removeViewBox: false }, 
    		{ removeEmptyAttrs: false },
    		{ removeDoctype: false }, 
    		{ removeComments: false },
    		{ removeEmptyContainers: false },
    	], 	
    	use: []
    }))
    .pipe(size())
    .on('error', function(err) { gutil.log(err.message); })
    .pipe(gulp.dest('dist/assets/'));
});

gulp.task('cdnizer', function() {
gulp.src("./app/index.html")
        .pipe(plugins.cdnizer([
        	{
            file: 'bower_components/angular/*.js',
            package: 'angular',
            test: 'window.angular',
            cdn: '//ajax.googleapis.com/ajax/libs/angularjs/${ version }/${ filenameMin }'
          },
          {
            file: 'bower_components/angular-*/*.js',
            package: 'angular',
            test: 'window.angular',
            cdn: '//ajax.googleapis.com/ajax/libs/angularjs/${ version }/${ filenameMin }'
          },
          {
            file: 'bower_components/jquery/dist/jquery.min.js',
            package: 'jquery',
            test: 'window.jquery',
            // use alternate providers easily
            cdn: '//ajax.googleapis.com/ajax/libs/jquery/${ version }/jquery.min.js'
          },
        ]))
        .pipe(gulp.dest("./dist"));
});

//////////////////////////////
// PREPROCCESSOR GULP TASKS //
//////////////////////////////

gulp.task('less', function() {
  gulp.src([paths.less])
		.pipe( plugins.less())
		.pipe( plugins.license('BSD2', {tiny: false, organization: 'Technische Centrale'}))
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
	// git init n root 
 	plugins.git.init(function (err) {
  	if (err) throw err;
  });
});

gulp.task('git:add', function(){
	// git add . all file except .gitignore
	gulp.src('./*')
    	.pipe(plugins.git.add());
});

gulp.task('git:commit', function(){
	// First commit
 	gulp.src('./')
  	.pipe(plugins.git.commit('initial commit'));
});

gulp.task('git:remote', function(){
	plugins.git.addRemote('origin', 'https://github.com/tcdevs/zgbs', function (err) {
  	if (err) throw err;
  });
});

gulp.task('git:push', function(){
	plugins.git.push('origin', 'master', function (err) {
    if (err) throw err;
	});
});

gulp.task('git:status', function(){
	plugins.git.status({args: '--porcelain'}, function (err, stdout) {
		if (err) throw err;
	});
});

///////////////////////
// DEPLOY GULP TASKS //
///////////////////////
gulp.task('deploy:ftp', function () {
	gulp.src('build/*')
    .pipe(ftp({
      host: 'website.com',
      user: 'johndoe',
      pass: '1234'
    }));
});

gulp.task('zip:src', function () {
	// { cwd: 'app/', base: true }
  gulp.src('app/**/*')
		.pipe(plugins.zip('src-archive[' + d + '-W' + w + '].zip'))
		.pipe(gulp.dest('zips/src'));
});

gulp.task('zip:dist', function () {
	// { cwd: 'app/', base: true }
  gulp.src('dist/**/*')
		.pipe(plugins.zip('dist-archive[' + d + '-W' + w + '].zip'))
		.pipe(gulp.dest('zips/dist'));
});

////////////////////////////
// BROWSERSYNC GULP TASKS //
////////////////////////////
gulp.task('server:dev', function() {
	// start DEVELOPMENT server
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

gulp.task('server:build', function() {
	// start PRODUCTION server
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
gulp.task('default', ['server:dev', 'watch', 'hai']);

// THE BUILD TASK
gulp.task('build', ['usemin'], function () {
  gulp.start('images');
  gulp.start('template');
});

// THE TEST TASK
gulp.task('test', []);

//THE DEPLOY TASK
gulp.task('deploy', []);
