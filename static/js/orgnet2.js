(function () { 
    var container, stats;

    var camera, scene, renderer;

    var text, plane;

    var latMin, latMax, lonMin, lonMax = 0;

    var gpsLat = [];
    var gpsLon = [];

    var targetRotation = 0;
    var targetRotationOnMouseDown = 0;

    var mouseX = 0;
    var mouseXOnMouseDown = 0;

    var windowHalfX = window.innerWidth / 2;
    var windowHalfY = window.innerHeight / 2;

    init();
    animate();

    function init() {

    	container = document.createElement( 'div' );
    	document.body.appendChild( container );

    	var info = document.createElement( 'div' );
    	info.style.position = 'absolute';
    	info.style.top = '10px';
    	info.style.width = '100%';
    	info.style.textAlign = 'center';
    	info.innerHTML = 'ORGNET : GPS DATA TEST (drag to spin)';
    	container.appendChild( info );

    	scene = new THREE.Scene();

    	camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 1000 );
    	camera.position.set( 0, 150, 500 );
    	scene.add( camera );

    	var light = new THREE.DirectionalLight( 0xffffff );
    	light.position.set( 0, 0, 1 );
    	scene.add( light );

    	parent = new THREE.Object3D();
    	parent.position.y = 50;
    	scene.add( parent );

    	function addGeometry( geometry, points, spacedPoints, color, x, y, z, rx, ry, rz, s ) {

    		// // 3d shape
    		// 
    		// 				var mesh = THREE.SceneUtils.createMultiMaterialObject( geometry, [ new THREE.MeshLambertMaterial( { color: color } ), new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: true, transparent: true } ) ] );
    		// 				mesh.position.set( x, y, z - 75 );
    		// 				mesh.rotation.set( rx, ry, rz );
    		// 				mesh.scale.set( s, s, s );
    		// 				parent.add( mesh );
    		// 
    		// 				// solid line
    		// 
    		// 				var line = new THREE.Line( points, new THREE.LineBasicMaterial( { color: color, linewidth: 2 } ) );
    		// 				line.position.set( x, y, z + 25 );
    		// 				line.rotation.set( rx, ry, rz );
    		// 				line.scale.set( s, s, s );
    		// 				parent.add( line );
	
    		// transparent line from real points
            // 
            // var line = new THREE.Line( points, new THREE.LineBasicMaterial( { color: color, opacity: 0.5 } ) );
            // line.position.set( x, y, z  );
            // line.rotation.set( rx, ry, rz );
            // line.scale.set( s, s, s );
            // parent.add( line );

    		// vertices from real points

    		var pgeo = THREE.GeometryUtils.clone( points );
    		var particles = new THREE.ParticleSystem( pgeo, new THREE.ParticleBasicMaterial( { color: color, size: 2, opacity: 1 } ) );
    		particles.position.set( x, y, z  );
    		particles.rotation.set( rx, ry, rz );
    		particles.scale.set( s, s, s );
    		parent.add( particles );
    		// 
    		// // transparent line from equidistance sampled points
    		// 
    		// var line = new THREE.Line( spacedPoints, new THREE.LineBasicMaterial( { color: color, opacity: 0.2 } ) );
    		// line.position.set( x, y, z + 100 );
    		// line.rotation.set( rx, ry, rz );
    		// line.scale.set( s, s, s );
    		// parent.add( line );
    		// 
    		// // equidistance sampled points
    		// 
    		// var pgeo = THREE.GeometryUtils.clone( spacedPoints );
    		// var particles2 = new THREE.ParticleSystem( pgeo, new THREE.ParticleBasicMaterial( { color: color, size: 2, opacity: 0.5 } ) );
    		// particles2.position.set( x, y, z + 100 );
    		// particles2.rotation.set( rx, ry, rz );
    		// particles2.scale.set( s, s, s );
    		// parent.add( particles2 );

    	}

    //	var extrudeSettings = {	amount: 20,  bevelEnabled: true, bevelSegments: 2, steps: 2 }; // bevelSegments: 2, steps: 2 , bevelSegments: 5, bevelSize: 8, bevelThickness:5,

	
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

    	// addGeometry( triangle3d, trianglePoints, triangleSpacedPoints, 			0xffee00, -180,    0, 0,     0, 0, 0, 1 );
    	// 				addGeometry( roundedRect3d, roundedRectPoints, roundedRectSpacedPoints,	0x005500, -150,  150, 0,     0, 0, 0, 1 );
    	// 				addGeometry( square3d, squarePoints, squareSpacedPoints,				0x0055ff,  150,  100, 0,     0, 0, 0, 1 );
    	// 				addGeometry( heart3d, heartPoints, heartSpacedPoints,					0xff1100,    0,  100, 0, 	 Math.PI, 0, 0, 1 );
    	// 				addGeometry( circle3d, circlePoints, circleSpacedPoints,				0x00ff11,  120,  250, 0,     0, 0, 0, 1 );
    	// 				addGeometry( fish3d, fishPoints, fishSpacedPoints,						0x222222,  -60,  200, 0,     0, 0, 0, 1 );
    	// 				addGeometry( splineShape3d, splinePoints, splineSpacedPoints,			0x888888,  -50,  -100, -50,  0, 0, 0, 0.2 );
    	// 				addGeometry( arc3d, arcPoints, arcSpacedPoints,							0xbb4422,  150,    0, 0,     0, 0, 0, 1 );
    	// 				addGeometry( smiley3d, smileyPoints, smileySpacedPoints,				0xee00ff,  -270,    250, 0,  Math.PI, 0, 0, 1 );
	

    	//
	
    	function finalize() {
		
    		var gpsPoints = [];
		
    		for (var i = 0; i < gpsLat.length; i++) {
				heartPoint = Math.sin(i+1*i*i);
				heartPoint = heartPoint * 100;
				console.log(heartPoint);
				gpsPoints.push(new THREE.Vector3( (gpsLat[i] - latMin) / (latMax - latMin) * 100, (gpsLon[i] - lonMin) / (lonMax - lonMin) * 100));
    		}				

    		var gpsShape = new THREE.Shape( gpsPoints );

    		var gps3D = new THREE.ExtrudeGeometry( gpsShape, { amount: 20	} );
    		var gpsPoint = gpsShape.createPointsGeometry();
    		var gpsSpacedPoints = gpsShape.createSpacedPointsGeometry( 100 );
		
    		addGeometry( gps3D, gpsPoint, gpsSpacedPoints,	0xffaa00, 0, 0, 0,     0, 0, 0, 4);
    	}
	
    	renderer = new THREE.WebGLRenderer( { antialias: true } );
    	renderer.setSize( window.innerWidth, window.innerHeight );

    	container.appendChild( renderer.domElement );

    	//stats = new Stats();
    	//stats.domElement.style.position = 'absolute';
    	//stats.domElement.style.top = '0px';
    	//container.appendChild( stats.domElement );

    	document.addEventListener( 'mousedown', onDocumentMouseDown, false );
    	document.addEventListener( 'touchstart', onDocumentTouchStart, false );
    	document.addEventListener( 'touchmove', onDocumentTouchMove, false );

    }

    //

    function onDocumentMouseDown( event ) {

    	event.preventDefault();

    	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    	document.addEventListener( 'mouseup', onDocumentMouseUp, false );
    	document.addEventListener( 'mouseout', onDocumentMouseOut, false );

    	mouseXOnMouseDown = event.clientX - windowHalfX;
    	targetRotationOnMouseDown = targetRotation;

    }

    function onDocumentMouseMove( event ) {

    	mouseX = event.clientX - windowHalfX;

    	targetRotation = targetRotationOnMouseDown + ( mouseX - mouseXOnMouseDown ) * 0.02;

    }

    function onDocumentMouseUp( event ) {

    	document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
    	document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
    	document.removeEventListener( 'mouseout', onDocumentMouseOut, false );

    }

    function onDocumentMouseOut( event ) {

    	document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
    	document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
    	document.removeEventListener( 'mouseout', onDocumentMouseOut, false );

    }

    function onDocumentTouchStart( event ) {

    	if ( event.touches.length == 1 ) {

    		event.preventDefault();

    		mouseXOnMouseDown = event.touches[ 0 ].pageX - windowHalfX;
    		targetRotationOnMouseDown = targetRotation;

    	}

    }

    function onDocumentTouchMove( event ) {

    	if ( event.touches.length == 1 ) {

    		event.preventDefault();

    		mouseX = event.touches[ 0 ].pageX - windowHalfX;
    		targetRotation = targetRotationOnMouseDown + ( mouseX - mouseXOnMouseDown ) * 0.05;

    	}

    }

    //

    function animate() {

    	requestAnimationFrame( animate );

    	render();
    	//stats.update();

    }

    function render() {

    	parent.rotation.y += ( targetRotation - parent.rotation.y ) * 0.05;
    	renderer.render( scene, camera );

    }
})();