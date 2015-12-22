/*global module, require */

module.exports = function (grunt) {
    "use strict";

    require("load-grunt-tasks")(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),

        jscs: {
            src: [
                "**/*.js",
                "!**/node_modules/**/*.js"
            ],
            options: {
                config: ".jscs.json"
            }
        },

        zip: {
            extension: {
                src: [
                    "nls/**",
                    "LICENSE",
                    "*.js",
                    "*.json",
                    "!*.md",
                    "!.jscs.json",
                    "!gruntfile.js"
                ],
                dest: "<%= pkg.name %>-<%= pkg.version %>.zip",
                compression: "DEFLATE"
            }
        }
    });

    grunt.registerTask("package", ["jscs", "zip"]);
    grunt.registerTask("default", ["package"]);
};
