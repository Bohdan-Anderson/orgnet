(function () { 

    if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

	var container, stats, n_sub;
	
	var camera, meshCanvas, scene, renderer, particles, geometry, geometry2, material, material2, line, spline, i, x, h, color, colors = [], sprite, size;
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
                heartPoint = 50 + Math.sin(i+1*i*i) * 5;
			    
    			vertex.x = (gpsLat[i] - latMin) / (latMax - latMin) * 100;
    			vertex.y = (gpsLon[i] - lonMin) / (lonMax - lonMin) * 100;
    			vertex.z = heartPoint;

    			geometry.vertices.push( vertex );

    			colors[ i ] = new THREE.Color( 0xffffff );
    			colors[ i ].setHSV( ( vertex.x + 1000 ) / 2000, 1, 1 );

    		}
    		
    		var position, index;
    		
    		var spline = new THREE.Spline( geometry.vertices );
            
            n_sub = 8;
            
            for ( x = 0; x < gpsLat.length * n_sub; x ++ ) {

                index = x / ( gpsLat.length * n_sub );
                position = spline.getPoint( index );

                geometry2.vertices[ x ] = new THREE.Vector3( position.x, position.y, position.z );


            }
    		
    		
    		geometry.colors = colors;
    		
    		
            // transparent line from real points
            
            var linematerialX = new THREE.LineBasicMaterial({
                   color: 0xff0000,
            });
            var linematerialY = new THREE.LineBasicMaterial({
                   color: 0x99ff00,
            });
            var linematerialZ = new THREE.LineBasicMaterial({
                   color: 0x0099ff,
            });
            
            var lineGeometry = new THREE.Geometry();
            lineGeometry.vertices.push(new THREE.Vector3(-10, 0, 0));
            lineGeometry.vertices.push(new THREE.Vector3(10, 0, 0));
            lineGeometry.vertices.push(new THREE.Vector3(10, 1, 0));
            lineGeometry.vertices.push(new THREE.Vector3(10, -1, 0));
            lineGeometry.vertices.push(new THREE.Vector3(10, 0, 0));
            lineGeometry.vertices.push(new THREE.Vector3(11, 0, 0));
            
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
    		
    		// var planes = [];
    		var planeMaterial = new THREE.MeshBasicMaterial( { color: 0x555555, wireframe: true, opacity: 0.1 } )
    		
            plane = new THREE.Mesh( new THREE.PlaneGeometry( 100, 100, 50, 50 ),  planeMaterial );
            plane2 = new THREE.Mesh( new THREE.PlaneGeometry( 100, 100, 50, 50 ), planeMaterial );
            plane3 = new THREE.Mesh( new THREE.PlaneGeometry( 100, 100, 50, 50 ), planeMaterial );
            
            var rotation = 0.0;
            rotation = 90 * (Math.PI/180);
            plane2.rotation.x = rotation;
            plane3.rotation.z = rotation;
            
            var adjustedPosition = new THREE.Vector3(50, 50, 50);
            
            var lineX = new THREE.Line(lineGeometry, linematerialX);
            var lineY = new THREE.Line(lineGeometry, linematerialY);
            var lineZ = new THREE.Line(lineGeometry, linematerialZ);
            
            lineY.rotation.z = rotation; //green
            lineZ.rotation.y = rotation; //blue
            
            
            plane.position = plane2.position = plane3.position = adjustedPosition;
            lineX.position = lineY.position = lineZ.position = new THREE.Vector3(0, 50, 0);
            
            
            scene.add(lineX);
            scene.add(lineY);
            scene.add(lineZ);
            
            scene.add( plane3 );
            scene.add( plane2 );
            // planes.push(plane, plane2, plane3);
            // 
            // for (var z; z<2; z++) {
            //                 scene.add( plane[z] );
            //          }
            scene.add( plane );
    		scene.add( particles );
    		scene.add( line );
    		//scene.add( spline );

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