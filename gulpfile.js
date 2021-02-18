var { src, dest, parallel, series } = require('gulp');
var notify = require('gulp-notify');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var babelify = require('babelify');
var ngAnnotate = require('browserify-ngannotate');
var browserSync = require('browser-sync').create();
var rename = require('gulp-rename');
var templateCache = require('gulp-angular-templatecache');
var uglify = require('gulp-uglify');
var merge = require('merge-stream');
var glob = require('glob');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var NwBuilder = require('nw-builder');
var gutil = require('gulp-util');

// Where our files are located
var jsFiles = "src/app/**/*.js";
var viewFiles = "src/app/**/*.html";
var specFiles = "tests/specs/*.spec.js"
var specsArray = glob.sync(specFiles);


var interceptErrors = function (error) {
  var args = Array.prototype.slice.call(arguments);

  // Send error to notification center with gulp-notify
  notify.onError({
    title: 'Compile Error',
    message: '<%= error.message %>'
  }).apply(this, args);

  // Keep gulp from hanging on this task
  this.emit('end');
};

var autoprefixerOptions = {
  browsers: ['last 6 versions']
};

// Task for test files
function browserifyTests() {
  return browserify(specsArray)
    // .transform(babelify, {presets: ["es2015"]})
    .transform(babelify.configure({
      presets: [['es2015', {
        targets: {
          node: "current"
        }
      }]],
      plugins: [
        "syntax-dynamic-import",
        "transform-runtime",
        "transform-async-to-generator"
      ],
      ignore: /(bower_components)|(node_modules)/
    }))
    .transform(ngAnnotate)
    .bundle()
    .on('error', interceptErrors)
    //Pass desired output filename to vinyl-source-stream
    .pipe(source('tests.js'))
    // Start piping stream to tasks!
    .pipe(dest('build/tests/'));
};
exports.browserifyTests = browserifyTests;

// Just move files to build/
function html() {
  return src("src/start.html")
    .on('error', interceptErrors)
    .pipe(dest('build/'));
};
exports.html = html;

function tests() {
  return src("tests/start.html")
    .on('error', interceptErrors)
    .pipe(dest('build/tests'));
};
exports.tests = tests;

function js() {
  return src("src/vendors/**/*")
    .on('error', interceptErrors)
    .pipe(dest('build/vendors'));
};
exports.js = js;

function sassTask() {
  return src('src/sass/nano.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(dest('build/css'));
};
exports.sassTask = sassTask;

function css() {
  return src('src/css/**/*')
    .on('error', interceptErrors)
    .pipe(dest('build/css'))
};
exports.css = css;

function images() {
  return src("src/images/**/*")
    .on('error', interceptErrors)
    .pipe(dest('build/images'));
};
exports.images = images;

function packageTask() {
  return src("src/package.json")
    .on('error', interceptErrors)
    .pipe(dest('build/'));
};
exports.packageTask = packageTask;

// Cache template
function views() {
  return src(viewFiles)
    .pipe(templateCache({
      standalone: true
    }))
    .on('error', interceptErrors)
    .pipe(rename("app.templates.js"))
    .pipe(dest('src/app/config/'));
};
exports.views = views;

// Build App
function appTask() {
  var nw = new NwBuilder({
    version: '0.25.4',
    files: 'build/**',
    buildDir: 'dist',
    buildType: 'versioned',
    winIco: 'build/images/logomark.ico',
    macIcns: 'build/images/NanoWallet.icns',
    platforms: ['win64', 'osx64', 'linux64']
  });
  // Log stuff you want
  nw.on('log', function (msg) {
    gutil.log('nw-builder', msg);
  });
  // Build returns a promise, return it so the task isn't called in parallel
  return nw.build().catch(function (err) {
    gutil.log('nw-builder', err);
  });
};
exports.appTask = appTask;

// Task for app files
function browserifyTask() {
  return browserify({
    extensions: ['.jsx', '.js'],
    debug: true,
    cache: {},
    packageCache: {},
    fullPaths: true,
    entries: 'src/app/app.js',
  })
    // .transform(ngAnnotate)
    .transform(babelify.configure({
      presets: [['es2015', {
        targets: {
          node: "current"
        }
      }]],
      plugins: [
        "syntax-dynamic-import",
        "transform-runtime",
        "transform-async-to-generator"
      ],
      ignore: /(bower_components)|(node_modules)/
    }))
    .transform(ngAnnotate)
    .bundle()
    .on("error", interceptErrors)
    .pipe(source('main.js'))
    .pipe(dest('build/'));
};
exports.browserifyTask = browserifyTask;

// Run Tasks
exports.default = series(html, js, sassTask, css, images, packageTask, browserifyTask, tests);

// Build packaged apps for production
exports.buildApp = series(html, js, sassTask, css, images, packageTask, appTask);
