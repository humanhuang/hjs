var gulp = require('gulp');

var uglify = require('gulp-uglify');
var concat = require('gulp-concat');

var rename = require('gulp-rename');
var header = require('gulp-header');
var footer = require('gulp-footer');

var DEST = '.';

var comment = require('fs').readFileSync('./src/_comment.js').toString();

gulp.task('default', function () {

    var files = [
        'header.js',
        'module.js',
        'moduleStatic.js',
        'hjs.js',
        'define.js',
        'util.js',
        'footer.js'
    ].map(function (path) {
            return 'src/' + path;
        });

    gulp
        .src(files)
        .pipe(concat('hjs.js'))
        .pipe(header(comment + '\n'))
        .pipe(gulp.dest(DEST))
        .pipe(uglify())
        .pipe(rename({ extname: '.min.js' }))
        .pipe(header(comment + '\n'))
        .pipe(footer('\n\n'))
        .pipe(gulp.dest(DEST));

});

gulp.task('watch', function () {
    var watcher = gulp.watch('src/*.js', ['default']);

    //watcher.on('change', function (event) {
    //    gulp.run('default');
    //});
});