var gulp = require("gulp");
var sass = require("gulp-sass");
var autoprefixer = require("gulp-autoprefixer");
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var htmlmin = require('gulp-htmlmin');
var cleanCSS = require("gulp-clean-css");
var connect = require('gulp-connect');
var nunjucksRender = require('gulp-nunjucks-render');
var imagemin = require('gulp-imagemin');
var mozjpeg = require('imagemin-mozjpeg');
var pngquant = require('imagemin-pngquant');


// 監視　※gulp4の書き方です。
gulp.task( "watch", () => {
    gulp.watch( "src/sass/**/*.scss", gulp.series( "sass" ) ); // sassディレクトリ以下の.scssファイルの更新を監視
    gulp.watch( "src/njk/**/*.njk", gulp.series( "njk" ) ); // njkディレクトリ以下の.njkファイルの更新を監視
    gulp.watch( "src/js/**/*.js", gulp.series( "js" ) );
    gulp.watch( "src/img/**/*.{jpg,jpeg,png,gif,svg}", gulp.series('img'));
    gulp.parallel('serve');
});

//server
gulp.task('serve', () => {
  connect.server({
    root: './public',
    livereload: true
  });
});


// Sass
gulp.task( "sass", () => {
    return gulp.src( 'src/sass/*.scss' )
        .pipe(sass().on( 'error', sass.logError ) )
        .pipe(autoprefixer())
        .pipe(cleanCSS())
        .pipe(rename({extname: '.min.css'}))
        .pipe(gulp.dest( './public/css' ));
});

// njk
gulp.task( "njk",  () => {
    return gulp.src(["./src/njk/**/*.njk", '!' + "src/njk/**/_*.njk"])    
        .pipe(nunjucksRender({
          path: ['src/njk/']
        }))
        .pipe(htmlmin({collapseWhitespace : true, removeComments : true}))
        .pipe(rename({extname: '.html' }))
        .pipe( gulp.dest( "./public/" ) );
});

gulp.task('js', () => {
    gulp.src(['./src/js/*.js', '!./js/*.min.js'])
        .pipe(uglify())
        .pipe(rename({extname: '.min.js'}))
        .pipe(gulp.dest('./public/js/'));
});

gulp.task('img', function () {
  gulp.src('./src/img/**/*.{jpg,jpeg,png,gif,svg}')
  .pipe(imagemin(
    [
      pngquant({ quality: '65-80', speed: 1 }),
      mozjpeg({ quality: 80 }),
      imagemin.svgo(),
      imagemin.gifsicle()
    ]
  ))
  .pipe(gulp.dest('./public/img/'));
});



gulp.task('default', gulp.series(gulp.parallel('serve', 'watch'),function(){
}));
