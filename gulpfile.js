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

const webpackStream = require("webpack-stream");
const webpack = require("webpack");
const webpackConfig = require("./webpack.config");


// 監視　※gulp4の書き方です。
gulp.task( "watch", () => {
    gulp.watch( "src/sass/**/*.scss", gulp.series( "sass" ) ); // sassディレクトリ以下の.scssファイルの更新を監視
    gulp.watch( "src/njk/**/*.njk", gulp.series( "njk" ) ); // njkディレクトリ以下の.njkファイルの更新を監視
    gulp.watch( "src/js/main.js", gulp.series('bundle')); // webpack用のデータ
    gulp.watch( "src/js/**/*.js", gulp.series( "js" ) ); // js出力
    gulp.watch( "src/lib/**/*", gulp.series("lib")); // ライブラリなどを直接出力
    gulp.watch( "src/img/**/*.{jpg,jpeg,png,gif,svg}", gulp.series('img')); // 画像ファイルを自動調整
    gulp.parallel('serve');
});

//server
gulp.task('serve', () => {
  connect.server({
    root: './public',
    livereload: true,
	  host:'0.0.0.0'
  });
});


// Sass
gulp.task( "sass", () => {
    return gulp.src( 'src/sass/*.scss' )
        .pipe(sass().on( 'error', sass.logError ) )
        .pipe(autoprefixer())
        .pipe(cleanCSS())
        .pipe(rename({extname: '.min.css'}))
        .pipe(gulp.dest( './public/css' ))
        .pipe(connect.reload());
});

// njk
gulp.task( "njk",  () => {
    return gulp.src(["./src/njk/**/*.njk", '!' + "src/njk/**/_*.njk"])    
        .pipe(nunjucksRender({
          path: ['src/njk/']
        }))
        .pipe(htmlmin({collapseWhitespace : true, removeComments : true}))
        .pipe(rename({extname: '.html' }))
        .pipe( gulp.dest( "./public/" ) )
        .pipe(connect.reload());
});

gulp.task('js', () => {
  return gulp.src(['./src/js/*.js', '!./js/*.min.js', '!./js/main.js'])
        .pipe(uglify())
        .pipe(rename({extname: '.min.js'}))
        .pipe(gulp.dest('./public/js/'));
});


gulp.task('lib', () => {
  return gulp.src(['./src/lib/**/*'])
        .pipe(gulp.dest('./public/lib/'))
        .pipe(connect.reload());
});



gulp.task('bundle', () => {
  return webpackStream(webpackConfig, webpack)
    .pipe(gulp.dest("public/js"))
    .pipe(connect.reload());
});

gulp.task('img', function () {
  return gulp.src('./src/img/**/*.{jpg,jpeg,png,gif,svg}')
        .pipe(imagemin(
          [
            pngquant({ quality: [.7, .85], speed: 1 }),
            mozjpeg({ quality: 80 }),
            imagemin.svgo(),
            imagemin.gifsicle()
          ]
        ))
        .pipe(gulp.dest('./public/img/'))
        .pipe(connect.reload());
});

gulp.task('default', gulp.series(gulp.parallel('serve', 'watch'),function(){
}));

gulp.task('build', gulp.series(gulp.parallel('njk', 'sass', 'js', 'img', 'lib', 'bundle')));