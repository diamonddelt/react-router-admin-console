"use strict";

var gulp = require('gulp'), // task runner of choice for this project
  connect = require('gulp-connect'), // needed to run local js dev server
  open = require('gulp-open'), // useful for opening urls in the browser
  browserify = require('browserify'), // bundles js for the browser
  reactify = require('reactify'), // transforms react jsx to js
  source = require('vinyl-source-stream'), // use text streams with gulp
  concat = require('gulp-concat'), // concatenates files
  lint = require('gulp-eslint'); // lints js/jsx files

// define configurations for the gulpfile tasks to use
var config = {
  port: 9005,
  devBaseUrl: 'http://localhost',
  paths: {
    // specifies a glob for all html files under /src
    html: './src/*.html',
    // specifies a glob for the bootstrap css files in node_modules
    css: [
      'node_modules/bootstrap/dist/css/bootstrap.min.css',
      'node_modules/bootstrap/dist/css/bootstrap-theme.min.css',
      'node_modules/toastr/toastr.css'
    ],
    // specifies a glob for all js files in any subdir under /src
    js: './src/**/*.js',
    // specifies a glob for all content under images subdir
    images: './src/images/*',
    // specifies a glob for the favicon
    favicon: './src/favicon.ico',
    // specifies the javascript entry point
    main: './src/main.js',
    // specifies a glob for the /dist dir
    dist: './dist'
  }
};

// start a local dev server
gulp.task('connect', function() {
  connect.server({
    // specify the distribution dir as the files to load in browser
    root: ['dist'],
    port: config.port,
    base: config.devBaseUrl,
    livereload: true
  });
});

// create a task that depends on the local dev server task
// opens the index file in the browser
gulp.task('open', ['connect'], function() {
  // specifies the gulp source file to open
  gulp.src('dist/index.html')
    // builds the URL to open by the task with the baseURL and the port
    .pipe(open({ uri: config.devBaseUrl + ":" + config.port + '/'}));
});

// gulp task that moves html source files to the dist directory and reloads it
// using the gulp-connect module's reload() method
gulp.task('html', function() {
  gulp.src(config.paths.html)
    .pipe(gulp.dest(config.paths.dist))
    .pipe(connect.reload());
});

// gulp task that moves the css source files to /dist
gulp.task('css', function() {
  gulp.src(config.paths.css)
    // use the gulp-concat module to bundle all css into a single file
    .pipe(concat('bundle.css'))
    .pipe(gulp.dest(config.paths.dist + '/css'))
    .pipe(connect.reload());
})

// gulp task that does the following:
// - uses reactify plugin to transform jsx files into js
// - bundles all of the js files into one file called bundle.js
// - spit out errors to the console if there are problems bundling
// - pipe the bundle.js file that is created to dist/scripts
// - reload the browser using connect
gulp.task('js', function() {
  // bad - this should be made a config variable if it works
  // so it acts as a proper entry point
  browserify(config.paths.main)
    .transform(reactify)
    .bundle()
    .on('error', console.error.bind(console))
    .pipe(source('bundle.js'))
    .pipe(gulp.dest(config.paths.dist + '/scripts'))
    .pipe(connect.reload());
});

// gulp task that moves all images to /dist
gulp.task('images', function() {
  gulp.src(config.paths.images)
    .pipe(gulp.dest(config.paths.dist + '/images'))
    .pipe(connect.reload());
});

// gulp task that moves the favicon to /dist
gulp.task('favicon', function() {
  gulp.src(config.paths.favicon)
    .pipe(gulp.dest(config.paths.dist))
    .pipe(connect.reload());
});

// gulp task that lints the js files according to a lintfile
gulp.task('lint', function() {
  // return here so we can see the output of the linting
  return gulp.src(config.paths.js)
    .pipe(lint({ config: 'eslint.config.json' }))
    .pipe(lint.format());
})

// gulp task that watches all html and js files
// and moves them into dist/ if there is a change
gulp.task('watch', function() {
  gulp.watch(config.paths.html, ['html']);
  gulp.watch(config.paths.js, ['js', 'lint']);
});

// create a gulp default task to for development
gulp.task('default', ['html', 'js', 'images', 'css', 'lint', 'favicon', 'open', 'watch']);
