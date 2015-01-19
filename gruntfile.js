module.exports = function(grunt) {
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-compass');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-spritesmith');
	grunt.initConfig({
		uglify:{
			my_target:{
				files:{
					'scripts/js/script.js':['scripts/components/js/*.js']
				}
			}
		},
		compass:{
			dev:{
				options:{
					config: 'config.rb'
				}
			}
		},
		sprite:{
	      all: {
	        src: 'assets/sprites/*.png',
	        dest: 'assets/sprites/sprite/spritesheet.png',
	        destCss: 'scripts/components/sass/mixins/_sprites.scss',
	        imgPath: '../../assets/sprites/sprite/spritesheet.png'
	      }
	    },
	    copy: {
			main: {
			    files: [
				    {
				    	expand: true, 
				    	src: [
					    	'index.html',
					    	'scripts/js/**',
					    	'scripts/css/**',
					    	'assets/images/*',
					    	'assets/sprites/sprite/*',
					    	'assets/misc/*'
					    ], 
					    dest: 'release/'
					}
			    ],
		  	},
		},
		watch:{
			options:{
				livereload:true
			},
			scripts: {
				files:['scripts/components/js/*.js'],
				tasks: ['uglify']
			},
			sass:{
				files:['scripts/components/sass/*.scss','scripts/components/sass/partials/*.scss','scripts/components/sass/mixins/*.scss'],
				tasks: ['compass:dev']
			},
			html:{
				files:['*.html']
			}
		}
	}) 
	grunt.registerTask('default','watch');
}