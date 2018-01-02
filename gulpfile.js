var gulp          = require('gulp')
var sass          = require('gulp-sass')
var autoprefixer  = require('gulp-autoprefixer')
var spritesmith   = require('gulp.spritesmith-multi')
// 合并成一个文件
var concat        = require('gulp-concat')
    merge         = require('merge-stream')
var browserSync   = require('browser-sync').create()
var minify        = require("gulp-minify-css");//压缩css
var uglify        = require("gulp-uglify");//压缩js代码

// 引入组件
var path          = require('path'), // node自带组件
    fse           = require('fs-extra') // 通过npm下载

// 获取当前文件路径
var PWD           = process.env.PWD || process.cwd() // 兼容windows

// 初始化
gulp.task('init', function() {

    var dirs = ['dist','dist/html','dist/css','dist/img','dist/js','src','src/sass','src/js','src/img','src/pic','src/sprite','psd']
    
    dirs.forEach(function (item,index) {
        // 使用mkdirSync方法新建文件夹
        fse.mkdirSync(path.join(PWD + '/'+ item))
    })
    
    // 往index里写入的基本内容
    var template = '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no"/><title></title><meta name="apple-touch-fullscreen" content="yes" /><meta name="format-detection" content="telephone=no" /><meta name="apple-mobile-web-app-capable" content="yes" /><meta name="apple-mobile-web-app-status-bar-style" content="black" /></head><body></body></html>'

    fse.writeFileSync(path.join(PWD + '/dist/html/index.html'), template)
    fse.writeFileSync(path.join(PWD + '/src/sass/style.scss'), '@charset "utf-8";')
})

// 编译sass
gulp.task('sass', function () {
  return gulp
    // 在src/sass目录下匹配所有的.scss文件
    .src('src/sass/**/*.scss')
    
    // 基于一些配置项 运行sass()命令
    .pipe(sass({
        errLogToConsole: true,
        outputStyle: 'expanded'
    }).on('error', sass.logError))

    // 为css的某些不兼容属性自动添加前缀
    .pipe(autoprefixer({
        browsers: ['ios 5','android 2.3'],
        cascade: false
    }))

    // 压缩css
    .pipe(minify())

    // 输出css
    .pipe(gulp.dest('dist/css'))
});

//js压缩和合并
gulp.task("js", function () {
    return gulp
        .src(["src/js/jquery-3.0.0.min.js","src/js/**/*.js"])
        .pipe(concat("main.js"))//合并js
        .pipe(uglify(""))//压缩js方法
        .pipe(gulp.dest("dist/js"))
});

// 添加对雪碧图的支持
gulp.task('sprite', function () {
    var spriteData = gulp.src('src/sprite/**/*.png')
      .pipe(spritesmith({
          spritesmith: function (options, sprite) {
            options.cssName = sprite + '.scss';
            options.cssSpritesheetName = sprite;
          }
        }));

    var imgStream = spriteData.img
      .pipe(gulp.dest('dist/img'))

    var cssStream = spriteData.css
      .pipe(concat('sprite.scss'))
      .pipe(gulp.dest('src/sass'))

    // Return a merged stream to handle both `end` events
    return merge(imgStream, cssStream)
})

//=======================
//     服务器 + 监听
//=======================

gulp.task('default', function() {
    // 监听重载文件
    var files = [
      'dist/html/**/*.html',
      'dist/css/**/*.css',
      'src/js/**/*.js',
      'src/sprite/**/*.png'
    ]
    browserSync.init(files, {
        server: {
              baseDir: "./",
              directory: true
          },
        open: 'external',
        startPath: "dist/html/"
    })
    // 监听编译文件
    gulp.watch("dist/html/**/*.html").on('change', browserSync.reload)
    gulp.watch("src/sass/**/*.scss", ['sass'])
    gulp.watch("src/js/**/*.js", ['js'])
    gulp.watch("src/sprite/**/*.png", ['sprite'])
})

//=======================
//     清除不必要文件
//=======================
