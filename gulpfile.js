var gulp = require('gulp'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    pug  = require('gulp-pug'),
    argv = require('yargs').argv,
    rename = require('gulp-rename'),

    babelify = require('babelify'),
    browserify = require("browserify"),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    gutil = require('gulp-util'),

    uglify = require('gulp-uglify'),
    watch = require('gulp-watch'),
    sourcemaps = require('gulp-sourcemaps'),
    browserSync = require('browser-sync').create();


var dist = !!!(argv.dist || argv.d);

var sO = {
  notify: !false,
  snippetOptions: {
    rule: {
      match: /<\/body>/i,
      fn: function (snippet, match) {
        return snippet + match;
      }
    }
  },
};

var server = argv.proxy || argv.p || false;
var browserSyncClientUrl = argv.nodes || server || './';
    browserSyncClientUrl = browserSyncClientUrl.toString().replace(/\/node_modules/, "").replace(/\/$/, "").replace(/^http(s)?\:\/\//, "")+"/node_modules/";
    browserSyncClientUrl = "//"+browserSyncClientUrl;

if( server ){
  if( typeof(server) == "boolean" ){
    server = "localhost";
    browserSyncClientUrl = "//localhost/node_modules/";
  }

  sO.proxy = {
    "target": server
  };
} else {
  sO.server = './';
  browserSyncClientUrl = './node_modules/';
}

sO.snippetOptions.rule.fn = function(snippet, match){
  return "<link rel='stylesheet' href='" + browserSyncClientUrl + "browser-sync-client-transition/browser-sync-client.min.css' /><script async src='" + browserSyncClientUrl + "browser-sync-client-transition/browser-sync-client.min.js'></script>";
};


gulp.task('browserSync', function() {
  browserSync.init(sO);
});

gulp.task('sass', function () {
  return gulp.src('./sass/**/*.sass')
    .pipe(sourcemaps.init())
    .pipe(
      sass({
        "outputStyle": (dist) ? "compressed" : "expanded"
      })
      .on('error', sass.logError)
    )
    .pipe(
      autoprefixer({
        browsers: ['last 4 versions'],
        cascade: false
      })
    )
    .pipe(
      rename({
        suffix: '.min'
      })
    )
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./css'))
    .pipe(
      browserSync.stream({match: '**/*.css'})
    );
});

gulp.task('pug', function () {
  return gulp.src('./*.pug')
    .pipe(
      pug({
        "pretty": (dist) ? false : true
      })
    )
    .pipe(gulp.dest('./'))
    .pipe(
      browserSync.reload({stream: true})
    );
});

gulp.task('js-old', function() {
  gulp.src(['./js/**/*.js', '!./js/**/*.min.js'])
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(
      uglify()
    )
    .pipe(
      rename({
        suffix: '.min'
      })
    )
    .pipe(sourcemaps.write('./'))
    .pipe(
      gulp.dest('./dist/js/')
    )
    .pipe(
      browserSync.reload({stream: true})
    );
});

gulp.task('js', function () {
  browserify({entries: './js/main.js', debug: true})
      .transform("babelify", { presets: ["es2015"] })
      .bundle()
      .pipe(source('main.min.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init())
      .pipe(uglify())
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./dist/js'))
      .pipe(
        browserSync.reload({stream: true})
      );

  browserify({entries: './js/add_cite.js', debug: true})
      .transform("babelify", { presets: ["es2015"] })
      .bundle()
      .pipe(source('add_cite.min.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init())
      .pipe(uglify())
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./dist/js'))
      .pipe(
        browserSync.reload({stream: true})
      );

  browserify({entries: './js/add_teacher.js', debug: true})
      .transform("babelify", { presets: ["es2015"] })
      .bundle()
      .pipe(source('add_teacher.min.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init())
      .pipe(uglify())
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./dist/js'))
      .pipe(
        browserSync.reload({stream: true})
      );
});


gulp.task('watch', ['browserSync', 'sass'], function () {
  watch('./sass/**/*.sass', function(){gulp.start('sass');});
  watch('./*.pug', function(){gulp.start('pug');});
  watch(['./js/**/*.js', '!./js/**/*.min.js'], function(){gulp.start('js');});
  watch(['./*.html', './*.php'], function(){browserSync.reload();});
});

gulp.task('default', ['browserSync', 'sass', 'pug', 'js', 'watch']);
