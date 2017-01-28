/* eslint comma-dangle: 0 */
/* eslint-disable */

"use strict";

// General
const argv = require("yargs").argv;
const browserSync = require("browser-sync");
const del = require("del");
const fs = require("fs");
const gulp = require("gulp");
const gulpif = require("gulp-if");
const gutil = require("gulp-util");
const sourcemaps = require("gulp-sourcemaps");
const watch = require("gulp-watch");

// SASS
const autoprefixer = require("gulp-autoprefixer");
const filter = require("gulp-filter");
const sass = require("gulp-sass");

// PUG
const pug = require("gulp-pug");

// JS
const babelify = require("babelify"); // eslint-disable-line no-unused-vars
const browserify = require("browserify");
const buffer = require("vinyl-buffer");
const rename = require("gulp-rename");
const source = require("vinyl-source-stream");
const stripDebug = require("gulp-strip-debug");
const uglify = require("gulp-uglify");
const watchify = require("watchify");

/* eslint-enable */

/* eslint-disable no-unused-vars */

// Constants
const SOURCE_PATH = "./src";
const BUILD_PATH = "./build";
const STATIC_FILES = ["/browserconfig.xml", "/favicon.ico", "/manifest.json", "/img/**", "/js/jquery-3.1.1.min.js", "/js/bouncefix.min.js"]; // relative to /src/
const SCRIPTS_TO_WATCH = [`${SOURCE_PATH}/js/script.js`, `${SOURCE_PATH}/js/app.js`];
const KEEP_FILES = true;
const OPEN_TAB = argv.open || argv.o;

// Do not change this one!
const STATIC_FILES_TO_WATCH = [];

/* eslint-enable no-unused-vars */

/**
 * Simple way to check for development/production mode.
 */
function isProduction() {
  return argv.production;
}

/**
 * Logs the current build mode on the console.
 */
function logBuildMode() {
  if (isProduction()) {
    gutil.log(gutil.colors.green("Running production build..."));
  } else {
    gutil.log(gutil.colors.red("Running development build..."));
  }
}

/**
 * Handles errors
 */
function logError(err) {
  if (err.fileName) {
    gutil.log(`${gutil.colors.red(err.name)}: ${gutil.colors.yellow(err.fileName.replace(`${__dirname}/src/js/`, ""))}: Line ${gutil.colors.magenta(err.lineNumber)} & Column ${gutil.colors.magenta(err.columnNumber || err.column)}: ${gutil.colors.blue(err.description)}`);
  } else {
    // Browserify error..
    gutil.log(`${gutil.colors.red(err.name)}: ${gutil.colors.yellow(err.message)}`);
  }
}

/**
 * Copies folders from folders specified in STATIC_FOLDERS.
 */
function copyStatic() {
  STATIC_FILES.forEach((v) => {
    let path;
    let output;
    if (fs.existsSync(`${SOURCE_PATH}${v}`) && fs.lstatSync(`${SOURCE_PATH}${v}`).isDirectory()) {
      path = `${SOURCE_PATH}${v}`;
      output = `${BUILD_PATH}${v}`;

      path += "/*.*";
    } else {
      let file = v;
      if (v[0] !== "/") {
        file = `/${file}`;
      }

      path = `${SOURCE_PATH}${file}`;
      output = `${BUILD_PATH}${file}`;

      output = output.split("/");
      output.pop();
      output = output.join("/");
    }

    gulp.src(path)
      .pipe(gulp.dest(output));
  });
}

/**
 * Deletes all content inside the './build' folder.
 * If 'keepFiles' is true, no files will be deleted. This is a dirty workaround since we can't have
 * optional task dependencies :(
 * Note: keepFiles is set to true by gulp.watch (see serve()) and reseted here to avoid conflicts.
 */
function cleanBuild() {
  if (!KEEP_FILES) {
    del(["build/**/*.*"]);
    // del(["build/**/"]);
  }

  copyStatic();
}

/**
 * Converts time to appropriate unit.
 */
function showDuration(t) {
  if (t >= 1000) {
    return `${t / 1000} s`;
  }

  if (t <= 1) {
    return `${t * 1000} μs`;
  }

  return `${t} ms`;
}

/**
 * Transforms ES2015 code into ES5 code.
 * Creates sourcemaps if production.
 * Uglifies if not in production.
 */
function buildScript(toWatch, path) {
  const filename = path.split("/").pop();
  let bundler = browserify(path, {
    basedir: __dirname,
    debug: true,
    cache: {},
    packageCache: {},
    fullPaths: toWatch,
    plugin: [watchify],
  });

  if (toWatch) {
    bundler = watchify(bundler);
  }

  bundler.transform("babelify", { presets: ["es2015", "react"] });

  const rebundle = function() {
    const timer = Date.now();

    const stream = bundler.bundle().on("end", () => {
      gutil.log(`Started '${gutil.colors.cyan("scripts")}' ('${gutil.colors.cyan(filename)}')...`);
    });

    return stream
      .on("error", logError)
      .pipe(source(filename))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(gulpif(isProduction(), stripDebug()))
      .pipe(gulpif(isProduction(), uglify()))
      .pipe(gulpif(!isProduction(), sourcemaps.write("./")))
      .pipe(gulp.dest(`${BUILD_PATH}/js`))
      .on("end", () => {
        const taskName = `'${gutil.colors.cyan("scripts")}' ('${gutil.colors.cyan(filename)}')`;
        const taskTime = gutil.colors.magenta(showDuration(Date.now() - timer));
        gutil.log(`Finished ${taskName} after ${taskTime}`);
      })
      .pipe(browserSync.stream());
  };

  bundler.on("update", rebundle);
  return rebundle();
}

/**
 * Generates SASS.
 */
function buildSass() {
  const options = {
    sourcemap: true,
    style: "expanded",
  };

  if (isProduction()) {
    options.style = "compressed";
  }

  return gulp.src(`${SOURCE_PATH}/sass/**/*.sass`)
    .pipe(sourcemaps.init())
    .pipe(sass(options))
    .pipe(autoprefixer("last 1 version", "> 1%", "ie 8", "ie 7"))
    .pipe(gulpif(!isProduction(), sourcemaps.write("./")))
    .pipe(gulp.dest(`${BUILD_PATH}/css`))
    .pipe(filter(["**/*.css"]))
    .pipe(browserSync.stream());
}

/**
 * Generates pug.
 */
function buildPug() {
  return gulp.src(`${SOURCE_PATH}/*.pug`)
    .pipe(
      pug({
        "pretty": isProduction(),
      })
    )
    .pipe(gulp.dest(BUILD_PATH))
    .pipe(
      browserSync.stream()
    );
}

/**
 * Adds paths to array conatining files that will be watched.
 */
function watchStatic() {
  STATIC_FILES.forEach((v) => {
    let path;
    if (fs.existsSync(`${SOURCE_PATH}${v}`) && fs.lstatSync(`${SOURCE_PATH}${v}`).isDirectory()) {
      path = `${SOURCE_PATH}${v}`;
      path += "/*.*";
    } else {
      let file = v;
      if (v[0] !== "/") {
        file = `/${file}`;
      }

      path = `${SOURCE_PATH}${file}`;
    }

    STATIC_FILES_TO_WATCH.push(path);
  });
}

/**
 * Starts the Browsersync server.
 * Watches for file changes in the 'src' folder.
 */
function serve() {
  const options = {
    snippetOptions: {
      rule: {
        match: /<\/body>/i,
        fn: () => { return "<link rel='stylesheet' href='./browser-sync-client-transition/browser-sync-client.min.css' /><script async src='./browser-sync-client-transition/browser-sync-client.min.js'></script>"; },
      },
    },
    serveStatic: [
      {
        route: "/browser-sync-client-transition",
        dir: "./node_modules/browser-sync-client-transition"
      },
      {
        route: "/build",
        dir: "./build"
      }
    ],
    open: OPEN_TAB,
  };

  options.snippetOptions.rule.fn = function() {
    return "<link rel='stylesheet' href='./browser-sync-client-transition/browser-sync-client.min.css' /><script async src='./browser-sync-client-transition/browser-sync-client.min.js'></script>";
  };

  let server = argv.proxy || false;
  if (server) {
    if (typeof server === "boolean") {
      server = "localhost";
    }

    options.proxy = { "target": server };
  } else {
    options.server = BUILD_PATH;
  }

  browserSync(options);
}

gulp.task("cleanBuild", cleanBuild);
gulp.task("copyStatic", copyStatic);
gulp.task("sass", buildSass);
gulp.task("pug", buildPug);

gulp.task("watchScripts", () => {
  SCRIPTS_TO_WATCH.forEach((v) => {
    buildScript(true, v);
  });
});

gulp.task("watchStatic", () => {
  watchStatic();
});

gulp.task("watch", ["copyStatic", "sass", "pug", "watchStatic", "watchScripts"], () => {
  watch(`${SOURCE_PATH}/sass/**/*.sass`, () => {
    gulp.start("sass");
  });

  watch(`${SOURCE_PATH}/*.pug`, () => {
    gulp.start("pug");
  });

  watch(STATIC_FILES_TO_WATCH, () => {
    copyStatic();
    browserSync.reload();
  });
});

gulp.task("serve", ["cleanBuild", "watch"], serve);

gulp.task("default", ["serve"], logBuildMode);
