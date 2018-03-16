module.exports = function(grunt) {
    // Project configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        pot: {
            options: {
                text_domain: "translations",
                dest: 'languages/',
                msgmerga: true
            },
            files: {

            }
        }
    });

    grunt.loadNpmTasks('grunt-pot');
}