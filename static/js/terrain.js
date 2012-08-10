(function () { 

    if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

	var container, stats, n_sub;

	var camera, meshCanvas, scene, renderer, particles2, geometry, geometry2, material, material2, line, spline, i, x, h, color, colors = [], sprite, size;
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
    var iterLine = 0;
    
    var thepoint = 0;
    
    var zp, xp = 0;
    
    var particles = []; 
    var geometries = [];
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
        
        
        
        
        material = new THREE.ParticleBasicMaterial( { size: 0.5} );
		
		
		

        
        
        
        
        for (var p = 0; p < 10; p++) {
            var geo = new THREE.Geometry();
            geometries.push(geo);
            for (var i = -50; i<=50; i++) {
                geometries[p].vertices.push(new THREE.Vector3(i, 0, 0));
            }
            
            var part = new THREE.ParticleSystem( geometries[p], material );
            part.position.z = -50 + (p * 10);
            scene.add(part);
            particles.push(part);
        }

        
        
        particles.reverse();
		particles.sortParticles = true;
        
        var planeMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe: true, opacity: 0.01 } )
		
        plane = new THREE.Mesh( new THREE.PlaneGeometry( 100, 100, 50, 50 ),  planeMaterial );
        plane2 = new THREE.Mesh( new THREE.PlaneGeometry( 100, 100, 50, 50 ), planeMaterial );
        plane3 = new THREE.Mesh( new THREE.PlaneGeometry( 100, 100, 50, 50 ), planeMaterial );
		
		
		var rotation = 0.0;
        rotation = 90 * (Math.PI/180);
        plane2.rotation.x = rotation;
        plane3.rotation.z = rotation;
        
	for (var i =0; i < 10; i++) {
	    var particles2 = new THREE.ParticleSystem(geometry, material);
            particles2.vertices = particles.vertices;
	    particles2.position.z = 0;
	}
        
        scene.add( plane3 );
        scene.add( plane2 );
        scene.add( plane );
        
        
        
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
		
		for (var pr=0; pr<10; pr++) {
		    particles[pr].position.z += 1;
		}
    console.log(iterLine);
	if (particles[iterLine].position.z > 49) {
	          particles[iterLine].geometry.verticesNeedUpdate = true; 
	           yp = pointContainer[iter].z;
	           //zp = 50;
	               xp = Math.floor(pointContainer[iter].x);
	               zp = pointContainer[iter].y;
	   
	           //for (var i=0; i<particles.geometry.vertices.length;i++) {
	           //particles.geometry.vertices[i].y = 0;
	               
	   
	           //}
	           
	           for (var i = 1; i < (particles[iterLine].geometry.vertices.length + 1); i++) {
	           
	                   fallOff = zp * Math.exp(-1 * (((i-xp)*(i-xp))/100));
	                   if (i == xp) console.log(fallOff);
	                   particles[iterLine].geometry.vertices[i-1].y = fallOff;
	                   console.log(particles[iterLine].geometry.vertices);
	           }
	           particles[iterLine].position.z = -50;
	           
               console.log(particles[iterLine].geometry.vertices[50].y);
	           iter++;
	           
	           iterLine++;
	           if (iter > pointContainer.length - 1) iter = 0; 
	           if (iterLine > 9) iterLine = 0;
	           
	                           
	       }
        
           
		renderer.render( scene, camera );

	}

  
  })();
  		
