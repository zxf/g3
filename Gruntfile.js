module.exports = function(grunt) {
  var relations = function(basepath){
    var path = require("path");
    var fs = require('fs');    
    var modulef = path.join(basepath, 'modules.json');
    var modules = grunt.file.readJSON(modulef);
    var caches = [];

    for(var i in modules){
      var module = modules[i];
      if(typeof module == "string"){
        var module_path = path.join.apply(this, [basepath].concat(module.split(".")));
        if(fs.existsSync(module_path + '.js')){
          module_file = module_path + '.js';
          if(caches.indexOf(module_file) == -1){
            caches.push(module_file);
          }
        } else if(fs.existsSync(module_path)){
          var modulefs = relations(module_path);
          for(var f in modulefs){
            if(caches.indexOf(modulefs[f]) == -1){
              caches.push(modulefs[f]);
            }
          }
        }
      }
    }
    return caches;
  };
  "use strict";

  // Project configuration.
  grunt.initConfig({

    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*!\n' +
              '* g3 v<%= pkg.version %>\n' +
              '* Copyright <%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
              '*/\n',

    // Task configuration.
    clean: {
      build: ['build'],
    },

    concat: {
      js: {
        options: {
          banner: '<%= banner %>',
          stripBanners: false
        },
        src: relations('src'),
        dest: 'build/<%= pkg.name %>.js'
      }
    },

    uglify: {
      options: {
        banner: '<%= banner %>',
        report: 'min'
      },
      crossflowui: {
        src: ['<%= concat.js.dest %>'],
        dest: 'build/<%= pkg.name %>.min.js'
      }
    }

  });


  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');



  // JS distribution task.
  grunt.registerTask('build-js', ['concat', 'uglify']);


  // Full distribution task.
  grunt.registerTask('build', ['clean', 'build-js']);

  // Default task.
  grunt.registerTask('default', ['build']);


};
