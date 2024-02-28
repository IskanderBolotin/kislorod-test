import gulp from "gulp";
import gulpPug from "gulp-pug";
import postcss from "gulp-postcss";
import dartSass from "sass";
import gulpSass from "gulp-sass";
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import combineMediaQuery from "postcss-combine-media-query";
import pugbem from "gulp-pugbem";
import browserSync from "browser-sync";
import svgSprite from "gulp-svg-sprite";
import webpack from "webpack-stream";
import TerserPlugin from "terser-webpack-plugin";
import sourcemaps from "gulp-sourcemaps";
import { deleteSync } from "del";
import rename from "gulp-rename";
import gulpIf from "gulp-if";
import * as nodePath from "path";


const sass = gulpSass(dartSass);

const rootFolder = nodePath.basename(nodePath.resolve());
const buildFolder = "./dist";
const srcFolder = "./src";

const isBuild = process.argv.includes("--build");

const path = {
  build: {
    css: `${buildFolder}/styles/`,
    html: `${buildFolder}/`,
    js: `${buildFolder}/scripts/`,
    assets: `${buildFolder}/assets/`,
    icons: `${buildFolder}/icons/`,
  },
  src: {
    css: `${srcFolder}/scss/main.scss`,
    html: `${srcFolder}/pages/*.pug`,
    js: `${srcFolder}/scripts/main.js`,
    assets: `${srcFolder}/assets/**/*.*`,
    icons: `${srcFolder}/icons/**/*.svg`,
  },
  watch: {
    css: `${srcFolder}/**/*.scss`,
    html: `${srcFolder}/**/*.pug`,
    js: `${srcFolder}/**/*.js`,
    assets: `${srcFolder}/assets/**/*.*`,
    icons: `${srcFolder}/icons/**/*.svg`,
  },
  clean: buildFolder,
  buildFolder,
  srcFolder,
  rootFolder,
};

const reset = (done) => {
  deleteSync(path.clean);
  done();
};

const spriteCreate = () => {
  return gulp
    .src(path.src.icons)
    .pipe(
      svgSprite({
        shape: {
          transform: [
            {
              svgo: {
                plugins: [
                  {
                    name: "preset-default",
                    params: {
                      overrides: {
                        removeViewBox: false,
                        convertColors: {
                          shorthex: false,
                        },
                        removeUselessStrokeAndFill: {
                          stroke: true,
                          fill: true,
                        },
                      },
                    },
                  },
                  {
                    name: "removeAttrs",
                    params: {
                      attrs: "(fill|stroke)",
                    },
                  },
                ],
              },
            },
          ],
        },
        mode: {
          stack: {
            sprite: "../sprite.svg",
          },
        },
      })
    )
    .pipe(gulp.dest(path.build.icons))
    .pipe(browserSync.stream());
};

const copyAssets = () => {
  return gulp.src(path.src.assets).pipe(gulp.dest(path.build.assets));
};

const cssBuild = () => {
  const pluginsList = isBuild ? [
    autoprefixer({
      grid: true,
      cascade: true,
    }),
    combineMediaQuery,
    cssnano,
  ] : [
    autoprefixer({
      grid: true,
      cascade: true,
    }),
  ];

  return gulp
    .src(path.src.css)
    .pipe(gulpIf(!isBuild, sourcemaps.init()))
    .pipe(sass().on("error", sass.logError))
    .pipe(
      postcss(pluginsList)
    )
    .pipe(
      gulpIf(
        isBuild,
        rename({
          extname: ".min.css",
        })
      )
    )
    .pipe(gulpIf(!isBuild, sourcemaps.write()))
    .pipe(gulp.dest(path.build.css))
    .pipe(browserSync.stream());
};

const htmlBuild = () => {
  return gulp
    .src(path.src.html)
    .pipe(
      gulpPug({
        pretty: true,
        plugins: [pugbem],
      })
    )
    .pipe(gulp.dest(path.build.html))
    .pipe(browserSync.stream());
};

const jsBuild = () => {
  return gulp
    .src(path.src.js)
    .pipe(
      webpack({
        mode: isBuild ? "production" : "development",
        output: {
          filename: "main.js",
        },
        devtool: isBuild ? false : "source-map",
        optimization: {
          minimizer: [
            new TerserPlugin({
              extractComments: false,
            }),
          ],
        },
        module: {
          rules: [
            {
              test: /\.(js)$/,
              exclude: /node_modules/,
              use: [
                {
                  loader: "babel-loader",
                  options: {
                    presets: [
                      [
                        "@babel/env",
                        {
                          corejs: "3.36",
                          useBuiltIns: "usage",
                          debug: false,
                          modules: false,
                        },
                      ],
                    ],
                  },
                },
              ],
            },
          ],
        },
      })
    )
    .pipe(gulp.dest(path.build.js))
    .pipe(browserSync.stream());
};

const liveServer = () => {
  browserSync.init({
    server: {
      baseDir: path.build.html,
    },
    port: 3000,
  });
};

const watcher = () => {
  gulp.watch(path.watch.assets, copyAssets);
  gulp.watch(path.watch.css, cssBuild);
  gulp.watch(path.watch.html, htmlBuild);
  gulp.watch(path.watch.js, jsBuild);
};

const mainTasks = gulp.parallel(copyAssets, cssBuild, htmlBuild, jsBuild);

const dev = gulp.series(reset, spriteCreate, mainTasks, gulp.parallel(watcher, liveServer));
const build = gulp.series(reset, spriteCreate, mainTasks);

gulp.task("sprite", spriteCreate);
gulp.task("default", dev);
gulp.task("build", build);