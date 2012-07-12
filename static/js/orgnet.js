(function () { 

    if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

	var container, stats, n_sub;
	
	var camera, scene, renderer, particles, geometry, geometry2, material, material2, line, spline, i, x, h, color, colors = [], sprite, size;
	var mouseX = 0, mouseY = 0;

	var windowHalfX = window.innerWidth / 2;
	var windowHalfY = window.innerHeight / 2;

	var latMin, latMax, lonMin, lonMax = 0;

    var gpsLat = [];
    var gpsLon = [];

	init();
	

	function init() {
        
        $.getJSON('/jsonGPS/', function(data) {
            $.each(data, function(key, val) {
                gpsLat.push(parseFloat(val.lat));
                gpsLon.push(parseFloat(val.lon));
            });
            latMax = Math.max.apply(Math, gpsLat);
            latMin = Math.min.apply(Math, gpsLat);

            lonMax = Math.max.apply(Math, gpsLon);
            lonMin = Math.min.apply(Math, gpsLon);

            console.log(lonMax + ' ' + lonMin);

            dataLoaded = true;
            checkForLoad();
        });

    	function checkForLoad() {
    	    if(dataLoaded) {
    	      // wait for the loading message to hide :)
    	      setTimeout(function() {
    			finalize();
    	      }, 100);
    	    }
    	  }
    
        
        function finalize() {
            
	    	container = document.createElement( 'div' );
    		document.body.appendChild( container );

    		scene = new THREE.Scene();
    		scene.fog = new THREE.FogExp2( 0x000000, 0.0009 );

    		camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 3000 );
    		camera.position.z = 100;
    		scene.add( camera );

    		geometry = new THREE.Geometry();
    		geometry2 = new THREE.Geometry();
    		
    		
           
            
    		for (var i = 0; i < gpsLat.length; i++) {
                
    		    var vertex = new THREE.Vector3();
                heartPoint =  60 + Math.sin(i+1*i*i);
			    
    			vertex.x = (gpsLat[i] - latMin) / (latMax - latMin) * 100;
    			vertex.y = (gpsLon[i] - lonMin) / (lonMax - lonMin) * 100;
    			vertex.z = heartPoint;

    			geometry.vertices.push( vertex );

    			colors[ i ] = new THREE.Color( 0xffffff );
    			colors[ i ].setHSV( ( vertex.x + 1000 ) / 2000, 1, 1 );

    		}
    		
    		var position, index;
    		
    		var spline = new THREE.Spline( geometry.vertices );
            
            n_sub = 6;
            
            for ( x = 0; x < gpsLat.length * n_sub; x ++ ) {

                index = x / ( gpsLat.length * n_sub );
                position = spline.getPoint( index );

                geometry2.vertices[ x ] = new THREE.Vector3( position.x, position.y, position.z );


            }
    		
    		
    		geometry.colors = colors;
    		
    		
            // transparent line from real points
            
            
            
            material2 = new THREE.LineBasicMaterial( { color: 0xffffff, opacity: 0.5, linewidth: 1 } );
            
            line = new THREE.Line(geometry2, material2);
            
            line.scale.x = line.scale.y = line.scale.z =  1;
        	line.position.x = 0;
        	line.position.y = 0;
        	line.position.z = 0;
            
            
    		material = new THREE.ParticleBasicMaterial( { size: 0.5, vertexColors: true } );
    		material.color.setHSV( 1.0, 0.2, 0.8 );

    		particles = new THREE.ParticleSystem( geometry, material );
    		particles.sortParticles = true;

    		scene.add( particles );
    		scene.add( line );
    		scene.add(spline);

    		//

    		renderer = new THREE.WebGLRenderer( { clearAlpha: 1 } );
    		renderer.setSize( window.innerWidth, window.innerHeight );
    		container.appendChild( renderer.domElement );

    		//

            // stats = new Stats();
            // stats.domElement.style.position = 'absolute';
            // stats.domElement.style.top = '0px';
            // container.appendChild( stats.domElement );

    		//

    		document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    		document.addEventListener( 'touchstart', onDocumentTouchStart, false );
    		document.addEventListener( 'touchmove', onDocumentTouchMove, false );
    		window.addEventListener( 'resize', onWindowResize, false );
    		
    		animate();
	    }

	}

	function onDocumentMouseMove( event ) {

		mouseX = event.clientX - windowHalfX;
		mouseY = event.clientY - windowHalfY;

	}

	function onDocumentTouchStart( event ) {

		if ( event.touches.length == 1 ) {

			event.preventDefault();

			mouseX = event.touches[ 0 ].pageX - windowHalfX;
			mouseY = event.touches[ 0 ].pageY - windowHalfY;

		}
	}

	function onDocumentTouchMove( event ) {

		if ( event.touches.length == 1 ) {

			event.preventDefault();

			mouseX = event.touches[ 0 ].pageX - windowHalfX;
			mouseY = event.touches[ 0 ].pageY - windowHalfY;

		}

	}

	function onWindowResize( event ) {

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( window.innerWidth, window.innerHeight );

	}

	//

	function animate() {

		requestAnimationFrame( animate );

		render();
		//stats.update();

	}

	function render() {

		var time = Date.now() * 0.00005;

		camera.position.x += ( mouseX - camera.position.x ) * 0.05;
		camera.position.y += ( - mouseY - camera.position.y ) * 0.05;

		camera.lookAt( scene.position );

		h = ( 360 * ( 1.0 + time ) % 360 ) / 360;
		material.color.setHSV( h, 0.8, 1.0 );

		renderer.render( scene, camera );

	}

})();