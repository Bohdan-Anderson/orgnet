  if (!Detector.webgl) Detector.addGetWebGLMessage();

  var container, stats, n_sub;

  var camera, meshCanvas, scene, renderer, particles2, geometry, geometry2, material, material2, line, spline, i, x, h, color, colors = [],
      sprite, size;
  var mouseX = 0,
      mouseY = 0;

  var windowHalfX = window.innerWidth / 2;
  var windowHalfY = window.innerHeight / 2;

  var latMin, latMax, lonMin, lonMax = 0;

  var gpsLat = [];
  var gpsLon = [];
  var heartSet = [];
 

  var plane, plane2, plane3;

  var startZ = 0;

  var change, speedFalloff = 0;

  var iter = 1;
  var iterLine = 0;

  var thepoint = 0;

  var zp, xp = 0;
  
  var iterate;

  var particles = [];
  var geometries = [];
  var pointContainer = [];
  var lines = [];
  var speed = 0;
  // CONFIGURABLE VARIABLES
  
  var totalLines = 307;
  var spacing = 1;
  
  var dotStartX = -50;
  var dots = 100;
  var dataLength = 0;
  
  var userOpts	= {
  	xdata	: 'off',
  	ydata	: 'off',
  	zdata	: 'off',
	speed   : 1
  };
  var changing = false;
  
  var dataContainer = {'gpslat' : [], 'gpslon' : [], 'heart' : [], 'off' : []};
  
  var dataOptions = {'gpslat' : 'gpslat', 'gpslon' : 'gpslon', 'heart' : 'heart', 'off' : 'off'};
  
  init();

  function buildGui(options, callback)
  {
  	// collect all available easing in TWEEN library

  	// the callback notified on UI change
  	var change	= function(){
  		//callback(options);
		
		callback(options);
  	}
	var speedUpdate = function() {
		startZ = -(totalLines * userOpts.speed)/1.5;
		plane.position.z = startZ + (userOpts.speed*totalLines)/2;
		camera.position.z = startZ + (totalLines*userOpts.speed) + 50;
		plane.scale.z = userOpts.speed;
		console.log(plane);
		
	}
	
  	// create and initialize the UI
  	var gui = new dat.GUI();
  	gui.add(options, 'xdata').options(dataOptions).name('X [midpoint]')	.onChange(change);
  	gui.add(options, 'ydata').options(dataOptions).name('Y [apex]')	.onChange(change);
  	gui.add(options, 'zdata').options(dataOptions).name('Z [rotate]')	.onChange(change);
	gui.add(options, 'speed', 0, 20).step(0.5).name('Speed').onFinishChange(speedUpdate);
  }
  
  function init() {
    //setup variables

    
    $.getJSON('/jsonGPS/', function(data) {
		var h = 0;
      $.each(data, function(key, val) {
		dataContainer['off'].push(0);  
		dataContainer['heart'].push(50 * Math.sin(h++/20));
        gpsLat.push(parseFloat(val.lat));
        gpsLon.push(parseFloat(val.lon));
		dataLength++;
      });
	  
	  
	  dataContainer['gpslat'] = scaleData(gpsLat);
	  dataContainer['gpslon'] = scaleData(gpsLon);
	  
      dataLoaded = true;
      checkForLoad();
    });

  }
  
  function scaleData(data) {
	  
	  var dataMax = Math.max.apply(Math, data);
	  var dataMin = Math.min.apply(Math, data);
	  
	  var scaledSet = [];
	  
	  for (var d=0; d < data.length; d++) {
		  scaledSet.push( ((data[d] - dataMin) / (dataMax-dataMin) * 100) -50 );
	  }
	  
	  return scaledSet;
  
  }

  function checkForLoad() {
    if (dataLoaded) {
      // wait for the loading message to hide :)
      setTimeout(function() {
        setup();
      }, 100);
    }
  }
	
  function createPath() {
	changing = true;
	pointContainer = [];
    for (var i = 0; i < dataLength; i++) {
      var vertex = new THREE.Vector3();
      vertex.x = dataContainer[userOpts['xdata']][i];
      vertex.y = dataContainer[userOpts['ydata']][i];
      vertex.z = dataContainer[userOpts['zdata']][i];
      pointContainer.push(vertex);
  	}
	
	changing = false;
  }
  

  function setup() {

    createPath();
	buildGui(userOpts, createPath);
    createGeometry();

  }
  
  function createGeometry() {

	startZ = -(totalLines * userOpts.speed)/2;
    
	scene = new THREE.Scene();
    //scene.fog = new THREE.FogExp2( 0x000000, 0.0009 );
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 3000);
    camera.position.z = startZ + (totalLines*userOpts.speed) + 25;
	camera.position.y = 2;



    material = new THREE.ParticleBasicMaterial({
      color: 0x000000,
      size: 0.5,
	  opacity: 0.7,
    });

    material2 = new THREE.LineBasicMaterial({
      color: 0x333333,
      opacity: 0.8,
      linewidth: 2
    });
	
    for (var p = 0; p < totalLines; p++) {
      var geo = new THREE.Geometry();
      geometries.push(geo);
      for (var d = 0; d < dots; d++) {
        geometries[p].vertices.push(new THREE.Vector3(dotStartX + d, 0, 0));
      }

      var part = new THREE.ParticleSystem( geometries[p], material );
      //var part = new THREE.Line(geometries[p], material);
      part.position.z = startZ + (p * userOpts.speed);
      scene.add(part);
      particles.push(part);
    }



    particles.reverse();
    particles.sortParticles = true;
	
    var planeMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      opacity: 0.4
    })
	
	var planeareax = dots + 25;
	var planeareay = totalLines*userOpts.speed + 25;
	
    plane = new THREE.Mesh(new THREE.PlaneGeometry(planeareax, planeareay, 100, 100 ), planeMaterial);
    //plane2 = new THREE.Mesh(new THREE.PlaneGeometry(100, 100, 50, 50), planeMaterial);
    //plane3 = new THREE.Mesh(new THREE.PlaneGeometry(100, 100, 50, 50), planeMaterial);


    //var rotation = 0.0;

	plane.position.z = startZ + (userOpts.speed*totalLines)/2
    //rotation = 90 * (Math.PI / 180);
    //plane2.rotation.x = rotation;
    //plane3.rotation.z = rotation;

    //scene.add( plane3 );
    //scene.add( plane2 );
    scene.add(plane);


    //setupTween();
    finalize();

  }

  function finalize() {

	speed = userOpts.speed;
	
	
    scene.add(camera);


    container = document.createElement('div');
    document.body.appendChild(container);
    
    // SET CANVAS TRANSPARENCY
    var xalpha = document.createElement("canvas");
    var xcalpha = xalpha.getContext("2d");
    xalpha.width = 50;
    xalpha.height = 50;

    xcalpha.fillStyle = "rgb(0,0,0)";
    xcalpha.fillRect(10, 10, 30, 30);

    var xmalpha = new THREE.MeshBasicMaterial({
      map: new THREE.Texture(xalpha),
      blending: THREE.NormalBlending
    });
    renderer = new THREE.WebGLRenderer({
      clearAlpha: 0
    });
    
    
    // TWEEN
    var output = document.createElement( 'div' );
            output.style.cssText = 'position: absolute; left: 50px; top: 300px; font-size: 100px';
            document.body.appendChild( output );


    
    // STATS
		//stats = new Stats();
		//stats.domElement.style.position = 'absolute';
		//stats.domElement.style.top = '0px';
		//	container.appendChild( stats.domElement );
    
    
    // RENDERER
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    
    // EVENT LISTENER BINDINGS
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('touchstart', onDocumentTouchStart, false);
    document.addEventListener('touchmove', onDocumentTouchMove, false);
    window.addEventListener('resize', onWindowResize, false);
    
    animate();

  }
  

  function onWindowResize(event) {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

  }

  function onDocumentMouseMove(event) {

    mouseX = event.clientX - windowHalfX;
    mouseY = event.clientY - windowHalfY;

  }

  function onDocumentTouchStart(event) {

    if (event.touches.length == 1) {

      event.preventDefault();

      mouseX = event.touches[0].pageX - windowHalfX;
      mouseY = event.touches[0].pageY - windowHalfY;

    }
  }

  function onDocumentTouchMove(event) {

    if (event.touches.length == 1) {

      event.preventDefault();

      mouseX = event.touches[0].pageX - windowHalfX;
      mouseY = event.touches[0].pageY - windowHalfY;

    }

  }

  function animate() {

    requestAnimationFrame(animate);

    render();

    //stats.update();
    
    //TWEEN.update();
  }

  function render() {

    camera.position.x += (mouseX - camera.position.x) * 0.1;
    camera.position.y += (-mouseY - camera.position.y) * 0.1;
	//camera.position.y += 0.01;
	//camera.position.z -= 0.02;
    
    camera.lookAt(scene.position);
    for (var pr = 0; pr < totalLines; pr++) {
      particles[pr].position.z += speed;
    }
	particles[iterLine].geometry.verticesNeedUpdate = true;
	
	var limit = startZ + (speed * totalLines) -1;
	
    if (particles[iterLine].position.z > limit) {
	  
	  if (!changing) {
	  yp = pointContainer[iter].y;
	  xp = pointContainer[iter].x;
	  xp += 50;
	  zp = pointContainer[iter].z;
  	  }
	  else {
		  yp = xp = zp = 0;
	  }
  
	  
      for (var i = 1; i < (particles[iterLine].geometry.vertices.length + 1); i++) {
        fallOff = yp * Math.exp(-1 * (((i - xp) * (i - xp)) / 256));
        particles[iterLine].geometry.vertices[i - 1].y = fallOff;
      }
	  particles[iterLine].rotation.z = zp/100;
      
      particles[iterLine].position.z = startZ;

      iter++;

      iterLine++;
      
      if (iter > pointContainer.length - 1) iter = 0;
      if (iterLine > totalLines -1) iterLine = 0;

      

    }

    
    renderer.render(scene, camera);

  }


