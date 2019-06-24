const enablePartials = true;

const autoprefixer = require('gulp-autoprefixer');
const browsersync = require('browser-sync').create();
const csscomb = require('gulp-csscomb');
const cache = require('gulp-cache');
const cssnano = require('gulp-cssnano');
const del = require('del');
const fileinclude = require('gulp-file-include');
const gulp = require('gulp');
const gulpif = require('gulp-if');
const npmdist = require('gulp-npm-dist');
const postcss = require('gulp-postcss');
const runsequence = require('run-sequence');
const replace = require('gulp-replace');
const sass = require('gulp-sass');
const uglify = require('gulp-uglify');
const useref = require('gulp-useref-plus');
const wait = require('gulp-wait');

const paths = {
  base:   {
    base:   {
      dir:    './'
    },
    node:   {
      dir:    'node_modules'
    }
  },
  dist:   {
    base:   {
      dir:    'public'
    },
    libs:   {
      dir:    'public/assets/libs'
    }
  },
  src:    {
    base:   {
      dir:    'sources',
      files:  'sources/**/*'
    },
    css:    {
      dir:    'sources/assets/css',
      files:  'sources/assets/css/**/*'
    },
    html:   {
      dir:    'sources',
      files:  'sources/*.html',
    },
    js:     {
      dir:    'sources/assets/js',
      files:  'sources/assets/js/**/*'
    },
    partials:   {
      dir:    'sources/partials',
      files:  'sources/partials/**/*'
    },
    scss:   {
      dir:    'sources/assets/scss',
      files:  'sources/assets/scss/**/*',
      main:   'sources/assets/scss/theme.scss'
    },
    tmp:    {
      dir:    'sources/.tmp',
      files:  'sources/.tmp/**/*'
    }
  }
}

gulp.task('sass', function() {
  gulp.src(paths.src.scss.main)
    .pipe(wait(500))
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([require('postcss-flexbugs-fixes')]))
    .pipe(autoprefixer({
      browsers: ['> 1%']
    }))
    .pipe(csscomb())
    .pipe(gulp.dest(paths.src.css.dir))
    .pipe(browsersync.reload({
      stream: true
    }));
});

gulp.task('fileinclude', function() {

  if ( enablePartials ) {
    gulp.src(paths.src.html.files)
      .pipe(fileinclude({
        prefix: '@@',
        basepath: '@file',
        indent: true
      }))
      .pipe(gulp.dest(paths.src.tmp.dir))
      .pipe(browsersync.reload({
        stream: true
      }));
  } else {
    browsersync.reload();
  }
});

gulp.task('browsersync', function() {
  browsersync.init({
    server: {
      baseDir: [paths.src.tmp.dir, paths.src.base.dir, paths.base.base.dir]
    },
  })
});

gulp.task('watch', ['browsersync', 'sass', 'fileinclude'], function() {
  gulp.watch(paths.src.js.files, browsersync.reload);
  gulp.watch(paths.src.scss.files, ['sass']);
  gulp.watch(paths.src.html.files, ['fileinclude']);
  gulp.watch(paths.src.partials.files, ['fileinclude']);
});

gulp.task('clean:tmp', function() {
  del.sync(paths.src.tmp.dir);
});

gulp.task('clean:dist', function() {
  del.sync(paths.dist.base.dir);
});

gulp.task('copy:all', function() {
  gulp.src([
    paths.src.base.files,
    '!' + paths.src.partials.dir, '!' + paths.src.partials.files,
    '!' + paths.src.scss.dir, '!' + paths.src.scss.files,
    '!' + paths.src.tmp.dir, '!' + paths.src.tmp.files,
    '!' + paths.src.html.files,
    ])
    .pipe(gulp.dest(paths.dist.base.dir))
});

gulp.task('copy:libs', function() {
  gulp.src(npmdist(), { base: paths.base.node.dir })
    .pipe(gulp.dest(paths.dist.libs.dir));
});

gulp.task('useref', function() {
  gulp.src(paths.src.html.files)
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file',
      indent: true
    }))
    .pipe(replace('<link rel="stylesheet" href="node_modules/', '<link rel="stylesheet" href="assets/libs/'))
    .pipe(replace('<link href="node_modules/', '<link href="assets/libs/'))
    .pipe(replace('<script src="node_modules/', '<script src="assets/libs/'))
    .pipe(useref())
    .pipe(gulpif('*.js', uglify()))
    .pipe(gulpif('*.css', cssnano()))
    .pipe(gulp.dest(paths.dist.base.dir))
});

gulp.task('build', function(callback) {
  runsequence(['clean:tmp', 'clean:dist', 'copy:all', 'copy:libs'],
    ['sass', 'useref'],
    callback);
});

gulp.task('default', function (callback) {
  runsequence(['sass','browsersync', 'watch'],
    callback)
});
