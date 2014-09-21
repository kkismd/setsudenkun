module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        typescript:{
            base:{
                src: ['typescripts/*.ts'],
                dest: 'public/javascripts',
                options: {
                    module: 'commonjs',
                    target: 'es5',
                    basePath: 'typescripts',
                    sourceMap: true,
                    declaration: true
                }
            }
        }
    });
    grunt.registerTask('compile', [
        'typescript:base'
    ]);
    grunt.registerTask('default', ['compile']);
};