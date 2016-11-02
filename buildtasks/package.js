//******************************************************************************
//* package.js
//* 
//* Defines a custom gulp task for creaing pnp.js, pnp.min.js, 
//* and pnp.min.js.map in the dist folder
//******************************************************************************

"use strict";

//******************************************************************************
//* DEPENDENCIES
//******************************************************************************

var gulp = require("gulp"),
    tsc = require("gulp-typescript"),
    browserify = require("browserify"),
    uglify = require("gulp-uglify"),
    src = require("vinyl-source-stream"),
    buffer = require("vinyl-buffer"),
    header = require('gulp-header'),
    srcmaps = require("gulp-sourcemaps"),
    merge = require("merge2");

function packageDefinitions() {

    console.log(global.TSDist.RootFolder + "/" + global.TSDist.DefinitionFileName);

    var src = global.TSWorkspace.Files.slice(0);

    // create a project specific to our typings build and specify the outFile. This will result
    // in a single pnp.d.ts file being creating and piped to the typings folder
    var typingsProject = tsc.createProject('tsconfig.json', { "declaration": true, "outFile": "pnp.js", "removeComments": false, "module": "system" });

    return gulp.src(src)
        .pipe(typingsProject())
        .dts.pipe(gulp.dest(global.TSDist.RootFolder));
}

function packageLib() {

    var src = global.TSWorkspace.Files.slice(0);

    // setup our es5 project to create the lib folder
    var packageProject = tsc.createProject({
        "declaration": true,
        "removeComments": false,
        "module": "commonjs",
        "target": "es5"
    });

    return gulp.src(src)
        .pipe(packageProject())
        .pipe(gulp.dest(global.TSDist.SrcFolder));
}

function packageBundle() {

    console.log(global.TSDist.RootFolder + "/" + global.TSDist.BundleFileName);
    console.log(global.TSDist.RootFolder + "/" + global.TSDist.BundleFileName + ".map");

    return browserify('./build/src/pnp.js', {
        debug: true,
        standalone: '$pnp',
    }).ignore('*.d.ts').bundle()
        .pipe(src(global.TSDist.BundleFileName))
        .pipe(buffer())
        .pipe(srcmaps.init({ loadMaps: true }))
        .pipe(header(banner, { pkg: global.pkg }))
        .pipe(srcmaps.write('./'))
        .pipe(gulp.dest(global.TSDist.RootFolder));
}

function packageBundleUglify() {

    console.log(global.TSDist.RootFolder + "/" + global.TSDist.MinifyFileName);
    console.log(global.TSDist.RootFolder + "/" + global.TSDist.MinifyFileName + ".map");

    return browserify('./build/src/pnp.js', {
        debug: true,
        standalone: '$pnp',
    }).ignore('*.d.ts').bundle()
        .pipe(src(global.TSDist.MinifyFileName))
        .pipe(buffer())
        .pipe(srcmaps.init({ loadMaps: true }))
        .pipe(uglify())
        .pipe(header(banner, { pkg: global.pkg }))
        .pipe(srcmaps.write('./'))
        .pipe(gulp.dest(global.TSDist.RootFolder));
}

function packageProvisioningBundle() {

    console.log(global.TSDist.RootFolder + "/pnp-provisioning.js");

    return browserify('./build/src/sharepoint/provisioning/provisioning.js', {
        debug: false,
        standalone: '$pnp.Provisioning',
    }).ignore('*.d.ts').bundle()
        .pipe(src("pnp-provisioning.js"))
        .pipe(buffer())
        .pipe(header(banner, { pkg: global.pkg }))
        .pipe(gulp.dest(global.TSDist.RootFolder));
}

function packageProvisioningBundleUglify() {

    console.log(global.TSDist.RootFolder + "/pnp-provisioning.min.js");
    console.log(global.TSDist.RootFolder + "/pnp-provisioning.min.js.map");

    return browserify('./build/src/sharepoint/provisioning/provisioning.js', {
        debug: false,
        standalone: '$pnp.Provisioning',
    }).ignore('*.d.ts').bundle()
        .pipe(src("pnp-provisioning.min.js"))
        .pipe(buffer())
        .pipe(srcmaps.init({ loadMaps: true }))
        .pipe(uglify())
        .pipe(header(banner, { pkg: global.pkg }))
        .pipe(srcmaps.write('./'))
        .pipe(gulp.dest(global.TSDist.RootFolder));
}

//******************************************************************************
//* PACKAGE
//******************************************************************************
gulp.task("package", ["build"], function () {

    return merge([
        // build and package the definition files
        packageDefinitions(),
        // build and package the lib folder
        packageLib(),
        // bundle the core
        packageBundle(),
        packageBundleUglify(),
        // bundle provisioning
        packageProvisioningBundle(),
        packageProvisioningBundleUglify(),
    ]);
});

gulp.task("package-serve", ["build-serve"], function () {

    return merge([
        // build and package the definition files
        packageDefinitions(),
        // build and package the lib folder
        packageLib(),
        // bundle the core
        packageBundle(),
        // bundle provisioning
        packageProvisioningBundle()
    ]);
});
