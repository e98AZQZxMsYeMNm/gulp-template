var gulp = require("gulp");
var sass = require("gulp-sass");
var autoprefixer = require("gulp-autoprefixer");
var ejs = require("gulp-ejs");
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var htmlmin = require('gulp-htmlmin');
var cleanCSS = require("gulp-clean-css");
var connect = require('gulp-connect');


// 監視　※gulp4の書き方です。
gulp.task( "watch", () => {
    gulp.watch( "src/sass/**/*.scss", gulp.series( "sass" ) ); // sassディレクトリ以下の.scssファイルの更新を監視
    gulp.watch( "src/ejs/**/*.ejs", gulp.series( "ejs" ) ); // ejsディレクトリ以下の.ejsファイルの更新を監視
    gulp.watch( "src/js/**/*.js", gulp.series( "js" ) );
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
        .pipe( sass().on( 'error', sass.logError ) )
        .pipe( autoprefixer())
        .pipe(cleanCSS())
        .pipe(rename({extname: '.min.css'}))
        .pipe( gulp.dest( './public/css' ));
});

// EJS
gulp.task( "ejs",  () => {
    return gulp.src(["./src/ejs/**/*.ejs", '!' + "src/ejs/**/_*.ejs"])    
        .pipe(ejs())
        .pipe(htmlmin({
            // 余白を除去する
            collapseWhitespace : true,
            // HTMLコメントを除去する
            removeComments : true
        }))
        .pipe(rename({ extname: '.html' }))
        .pipe( gulp.dest( "./public/" ) );
});

gulp.task('js', () => {
    gulp.src(['./src/js/*.js', '!./js/*.min.js'])
        .pipe(uglify())
        .pipe(rename({extname: '.min.js'}))
        .pipe(gulp.dest('./public/js/'));
});

gulp.task('default', gulp.series(gulp.parallel('serve', 'watch'),function(){
    
}));
