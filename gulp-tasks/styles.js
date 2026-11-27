"use strict";

import browserSync from "browser-sync";
import cssNano from "gulp-cssnano";
import gulp from 'gulp';
import gulpReplace from "gulp-replace";
import autoprefixer from 'autoprefixer';
import postcss from 'gulp-postcss';
import postcssPresetEnv from 'postcss-preset-env';
import sortMediaQueries from 'postcss-sort-media-queries';
import { paths } from "./config.js";

import * as _Sass from 'sass';
import gulpSass from 'gulp-sass';

const sass = gulpSass(_Sass);

export const stylesDev = () => (
    gulp.src(paths.styles.src)
        .pipe(sass({
            loadPaths: ['src/styles'],
            silenceDeprecations: ['mixed-decls']
        }).on('error', sass.logError))
        .pipe(postcss([
            autoprefixer(), // ← РАСКОММЕНТИРОВАЛ
            // postcssPresetEnv(), // если нужен - раскомментировать
            sortMediaQueries({
                sort: 'mobile-first'
            })
        ]))
        .pipe(gulp.dest(paths.styles.dist))
        .pipe(browserSync.reload({
            stream: true
        }))
);

export const stylesProd = () => (
    gulp.src(paths.styles.src)
        .pipe(sass({
            loadPaths: ['src/styles']
        }).on('error', sass.logError))
        .pipe(postcss([
            autoprefixer(), // ← ВЫЗЫВАЕМ ФУНКЦИЮ
            postcssPresetEnv(), // ← ВЫЗЫВАЕМ ФУНКЦИЮ
            sortMediaQueries({
                sort: 'mobile-first'
            })
        ]))
        .pipe(gulpReplace("/*!", "/*"))
        .pipe(cssNano())
        .pipe(gulp.dest(paths.styles.dist))
);
