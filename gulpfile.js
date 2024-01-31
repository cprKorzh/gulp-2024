const { src, dest, watch, parallel, series } = require("gulp"); // Gulp's фичи
const scss = require("gulp-sass")(require("sass")); // Преобразования стилей
const concat = require("gulp-concat"); // Конкатенация файлов
const uglify = require("gulp-uglify-es").default; // Сжатие файлов
const browserSync = require("browser-sync").create(); // Синхронизация браузера
const autoprefixer = require("autoprefixer"); // Авто замена стилей для старых браузеров
const postcss = require("gulp-postcss"); // Дополнение к автопрефиксеру
const del = require('del'); // npm install del@3.0.0 --save-dev - Удаление предыдущего билда
const avif = require("gulp-avif"); // npm i gulp-avif --save-dev - Формат avif
/* const webp = require("gulp-webp").then(mod => mod.default); */ // npm i gulp-webp --save-dev
const svgSprite = require('gulp-svg-sprite'); //npm install --save-dev gulp-svg-sprite - Создание спрайтов
const imagemin = require("gulp-imagemin"); // npm i gulp-imagemin@7.1.0 --save-dev - Минимизация картинок
const newer = require("gulp-newer"); // npm i gulp-newer --save-dev - Проверка сущ. картинок
const fonter = require("gulp-fonter"); //npm i gulp-fonter --save-dev
const ttf2woff2 = require("gulp-ttf2woff2"); //npm i gulp-ttf2woff2 --save-dev
const setInclude = require("gulp-include"); //npm i gulp-include --save-dev

function styles() {
    return src('app/scss/style.scss')
        .pipe(postcss([ autoprefixer() ]))
        .pipe(concat('style.min.css'))
        .pipe(scss({outputStyle: 'compressed'}))
        .pipe(dest('app/css'))
        .pipe(browserSync.stream())
}

function scripts() {
    return src([
        //'node_modules/swiper/swiper-bundle.js',
        'app/js/main.js',
        //'app/js/*.js',
        //'!app/js/main.min.js'  // Исключение файлов
        ])
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(dest('app/js'))
        .pipe(browserSync.stream())
}

function watching() {
    browserRefrehs();
    watch(['app/**/*.html']).on('change', browserSync.reload);
    watch(['app/components/*', 'app/pages/*'], unionHyperText);
    watch(['app/scss/style.scss'], styles);
    watch(['app/js/main.js'], scripts);
    watch(['app/img/src'], images);
}

function browserRefrehs() {
    browserSync.init({
        server: {
            baseDir: "app/"
        }
    });
}

function cleanDist() {
    return del(['dist/**/*', '!dist']);
}

function images() {
    return src(['app/img/src/*.*', '!app/img/src/*.svg'])
        .pipe(newer('app/img/')) 
        .pipe(avif({ quality: 50 }))

        /* .pipe(src('app/img/src/*.*'))
        .pipe(webp()) */

        .pipe(src('app/img/src/*.*'))
        .pipe(newer('app/img/'))
        .pipe(imagemin())
        .pipe(dest('app/img/'))
}

function sprite () {
    return src('app/img/*.svg')
        .pipe(svgSprite({
            mode: {
                stack: {
                    sprite: '../sprite.svg',
                    example: true
                }
            }
        }))
        .pipe(dest('app/img/'))
}

function fonts() {
    return src('app/fonts/src/*.*')
        .pipe(fonter({
            formats: ['woff', 'ttf']
        }))
        .pipe(src('app/fonts/*.ttf'))
        .pipe(ttf2woff2())
        .pipe(dest('app/fonts/'))
}

function unionHyperText() {
    return src('app/pages/*.html')
        .pipe(setInclude({
            includePaths: 'app/components'
        }))
        .pipe(dest('app/'))
        .pipe(browserSync.stream())
}

function clearWorkSpace() {
    return del(['app/fonts/*.*', 'app/img/stack', 'app/img/*.*']);
}

function building() {
    return src([
        'app/css/style.min.css',
        'app/img/*.*',
        '!app/img/*.svg',
        'app/img/sprite.svg',
        'app/fonts/*.*',
        'app/js/main.min.js',
        'app/index.html'
    ], {base: 'app'})
        .pipe(dest('dist'))
}

//exports.images = images;
//exports.sprite = sprite;
//exports.fonts = fonts;
//exports.cleanDist = cleanDist;

exports.styles = styles;
exports.scripts = scripts;
exports.unionHyperText = unionHyperText;
exports.watching = watching;
exports.browserRefrehs = browserRefrehs;

exports.build = series (cleanDist, fonts, images, sprite, building, clearWorkSpace);
exports.default = parallel (styles, scripts, unionHyperText, watching);