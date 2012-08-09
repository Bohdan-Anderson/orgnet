(function () { 

    if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

	var container, stats, n_sub;

	var camera, meshCanvas, scene, renderer, particles, particles2, geometry, geometry2, material, material2, line, spline, i, x, h, color, colors = [], sprite, size;
	var mouseX = 0, mouseY = 0;

	var windowHalfX = window.innerWidth / 2;
	var windowHalfY = window.innerHeight / 2;

	var latMin, latMax, lonMin, lonMax = 0;

    var reverse = false;
    var first = true;

    var gpsLat = [];
    var gpsLon = [];
    
    var plane, plane2, plane3;
    
    var topLimit = 10;
    var botLimit = -10;
    
    var change, speed, speedFalloff = 0;
    
    var iter = 1;
    var thepoint = 0;
    
    var zp, xp = 0;
    
    var pointContainer = [];
    
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
    
    }
	function checkForLoad() {
	    if(dataLoaded) {
	      // wait for the loading message to hide :)
	      setTimeout(function() {
			setup();
	      }, 100);
	    }
	  }
	  
	function createPath() {
	    
	    for (var i = 0; i < gpsLat.length; i++) {

  		    var vertex = new THREE.Vector3();
            var heartPoint = Math.sin(i+1*i*i) * 10;

  			vertex.x = (gpsLat[i] - latMin) / (latMax - latMin) * 100;
  			vertex.y = (gpsLon[i] - lonMin) / (lonMax - lonMin) * 100;
  			vertex.z = heartPoint * 10;
			console.log(vertex.z);
  			
  			pointContainer.push(vertex);
  		}
	  }
	  
	 function setup() {
      


        createPath();
		createGeometry();

    }
    
    function createGeometry() {
        scene = new THREE.Scene();
  		scene.fog = new THREE.FogExp2( 0x000000, 0.0009 );

  		camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 3000 );
  		camera.position.z = 100;

        geometry = new THREE.Geometry();
        
        material = new THREE.ParticleBasicMaterial( { size: 0.5} );
		
		
        for (var i = -50; i<=50; i++) {
            geometry.vertices.push(new THREE.Vector3(i, 0, 0));
        }
        
        particles = new THREE.ParticleSystem( geometry, material );
        particles.position.z = -50;
        
        
        
		particles.sortParticles = true;
        
        var planeMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe: true, opacity: 0.1 } )
		
        plane = new THREE.Mesh( new THREE.PlaneGeometry( 100, 100, 50, 50 ),  planeMaterial );
        plane2 = new THREE.Mesh( new THREE.PlaneGeometry( 100, 100, 50, 50 ), planeMaterial );
        plane3 = new THREE.Mesh( new THREE.PlaneGeometry( 100, 100, 50, 50 ), planeMaterial );
		
		
		var rotation = 0.0;
        rotation = 90 * (Math.PI/180);
        plane2.rotation.x = rotation;
        plane3.rotation.z = rotation;
        
	particles2 = new THREE.ParticleSystem(geometry, material);
	particles2.vertices = particles.vertices;
	particles2.position.z = 0;
        
        scene.add( plane3 );
        scene.add( plane2 );
        scene.add( plane );
        console.log(particles);
        scene.add( particles );
	scene.add 
        
        
        
        finalize();
        
    }
    
    function finalize() {
        

  		scene.add( camera );
  		
        
        container = document.createElement( 'div' );
  		document.body.appendChild( container );
    	renderer = new THREE.WebGLRenderer( { clearAlpha: 1 } );
    	renderer.setSize( window.innerWidth, window.innerHeight );
    	container.appendChild( renderer.domElement );
        
        
        document.addEventListener( 'mousemove', onDocumentMouseMove, false );
		document.addEventListener( 'touchstart', onDocumentTouchStart, false );
		document.addEventListener( 'touchmove', onDocumentTouchMove, false );
		window.addEventListener( 'resize', onWindowResize, false );
        animate();
    
    }
    
  	
  	function onWindowResize( event ) {

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( window.innerWidth, window.innerHeight );

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
		
		particles.position.z += 1;
    	if (particles.position.z == 0) {
    	       	    //for (var i = 1; i< (particles.geometry.vertices.length + 1); i++) {
    	        //fallOff = zp - ((i-xp)*(i-xp))/20;
    	        
    	        //if (i == 1) console.log('falloff: ' + fallOff);
    	        //if (i == xp) console.log(i + ' == ' + xp + '; point: ' + fallOff + ' diff: ' + (fallOff / zp));
                
    	        //if (particles.geometry.vertices[i-1]) particles.geometry.vertices[i-1].y = fallOff;

	      //  }
	        // iter ++;

    	}
	if (particles.position.z >= 50) {
	    


	    zp = pointContainer[iter].z;
	    //zp = 50;
    	    xp = Math.floor(pointContainer[iter].x);
    	    yp = pointContainer[iter].y;

	    for (var i=0; i<particles.geometry.vertices.length;i++) {
		particles.geometry.vertices[i].y = 0;		

	    }
	    (zp < 0) ? change = -1 : change = 1;
	    for (var i = 1; i < (particles.geometry.vertices.length + 1); i++) {
		
	    	fallOff = zp * Math.exp(-1 * (((i-xp)*(i-xp))/100));
		//console.log(fallOff);
		//fallOff = fallOff/Math.sqrt(2*Math.PI*0.5);
                if (i == xp) console.log(fallOff);
                if (particles.geometry.vertices[i-1]) particles.geometry.vertices[i-1].y = fallOff;
	    }
	    //particles.geometry.vertices[xp].y = zp;
	    particles.position.z = -50;
	    console.log('zp ' + zp + '; xp ' + xp + '; yp ' + yp);
    	    
    	    //particles.position.y = yp;
    	    
    	    //particles.geometry.vertices[xp].y = zp;
	    iter++;
	
		    		    
	}
        

		renderer.render( scene, camera );

	}

  
  })();
  		
