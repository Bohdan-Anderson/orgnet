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

  var plane, plane2, plane3;

  var startZ = 0;

  var change, speed, speedFalloff = 0;

  var iter = 1;
  var iterLine = 0;

  var thepoint = 0;

  var zp, xp = 0;
  
  var iterate;

  var particles = [];
  var geometries = [];
  var pointContainer = [];
  var lines = [];
  
  // CONFIGURABLE VARIABLES
  var speed = 1;
  var totalLines = 150;
  var spacing = 1;
  
  var dotStartX = -50;
  var dots = 100;
  
  var userOpts	= {
  	range		: 800,
  	duration	: 2500,
  	delay		: 200,
  	easing		: 'Elastic.EaseInOut'
  };
  
  
  
  init();


  function init() {
    //setup variables

    
    $.getJSON('/jsonGPS/', function(data) {
      $.each(data, function(key, val) {
        gpsLat.push(parseFloat(val.lat));
        gpsLon.push(parseFloat(val.lon));
      });
      latMax = Math.max.apply(Math, gpsLat);
      latMin = Math.min.apply(Math, gpsLat);

      lonMax = Math.max.apply(Math, gpsLon);
      lonMin = Math.min.apply(Math, gpsLon);


      dataLoaded = true;
      checkForLoad();
    });

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

    for (var i = 0; i < gpsLat.length; i++) {

      var vertex = new THREE.Vector3();
      var heartPoint = 30 * Math.sin(i/20);

      vertex.x = (gpsLat[i] - latMin) / (latMax - latMin) * 100;
      vertex.y = (gpsLon[i] - lonMin) / (lonMax - lonMin) * 100;
      vertex.z = heartPoint;

      pointContainer.push(vertex);
    }
  }

  function setup() {

    createPath();
    createGeometry();

  }
  startZ = -(totalLines * spacing)/2;
  function createGeometry() {
    scene = new THREE.Scene();
    //scene.fog = new THREE.FogExp2( 0x000000, 0.0009 );
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 3000);
    camera.position.z = startZ + (totalLines*spacing);
	camera.position.y = 100;



    material = new THREE.ParticleBasicMaterial({
      color: 0x000000,
      size: 0.5,
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
      part.position.z = startZ + (p * spacing);
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
	var planeareay = totalLines*spacing + 25;
	
    plane = new THREE.Mesh(new THREE.PlaneGeometry(planeareax, planeareay, 100, 100 ), planeMaterial);
    //plane2 = new THREE.Mesh(new THREE.PlaneGeometry(100, 100, 50, 50), planeMaterial);
    //plane3 = new THREE.Mesh(new THREE.PlaneGeometry(100, 100, 50, 50), planeMaterial);


    //var rotation = 0.0;
    plane.position.y -= 0.102;
	plane.position.z = startZ + (spacing*totalLines)/2
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
  var iterate = function() {
    if (iter > pointContainer.length -1) iter = 0; 
    return { x: Math.floor(pointContainer[iter].x), y: pointContainer[iter++].z };  
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


  
  function setupTween()
  {
  	// 
  	var update	= function(){
      particles[0].geometry.verticesNeedUpdate = true;
      //particles[iterLine].position.y = yp;
      console.log(particles[0].geometry.vertices[50].y)
      console.log('update');
      for (var i = 1; i < (particles[0].geometry.vertices.length + 1); i++) {
        fallOff = current.y * Math.exp(-1 * (((i - current.x) * (i - current.x)) / 256));
        particles[0].geometry.vertices[i - 1].y = fallOff;
      }
      
      
  	}
 

  	var current	= { x: 0, y:0 };
    

    
  	// remove previous tweens if needed
  	//TWEEN.removeAll();
	
  	// convert the string from dat-gui into tween.js functions 
  	//var easing	= TWEEN.Easing[userOpts.easing.split('.')[0]][userOpts.easing.split('.')[1]];
  	// build the tween to go ahead
  	var tweenHead	= new TWEEN.Tween(current)
  		.to({ x: 50, y: -50 }, userOpts.duration)
  		.onUpdate(update)
      .onComplete();
  	// build the tween to go backward
  	var tweenBack	= new TWEEN.Tween(current)
  		.to({x: 0, y:0}, userOpts.duration)
  		.onUpdate(update)
      .onComplete();
    
  	// after tweenHead do tweenBack
  	tweenHead.chain(tweenBack);
  	// after tweenBack do tweenHead, so it is cycling
  	tweenBack.chain(tweenHead);

  	// start the first
  	tweenHead.start();
  }
  function animate() {

    requestAnimationFrame(animate);

    render();

    //stats.update();
    
    //TWEEN.update();
  }

  function render() {
    camera.position.x += (mouseX - camera.position.x) * 0.01;
    camera.position.y += (-mouseY - camera.position.y) * 0.01;
	//camera.position.y += 0.01;
	//camera.position.z -= 0.02;
    
    camera.lookAt(scene.position);
    for (var pr = 0; pr < totalLines; pr++) {
      particles[pr].position.z += speed;
    }

    
    if (particles[iterLine].position.z > startZ + (spacing * totalLines) -1) {
      particles[iterLine].geometry.verticesNeedUpdate = true;
      yp = pointContainer[iter].y;
      //zp = 50;
      xp = pointContainer[iter].x;
      zp = pointContainer[iter].z;
      
	  //speed = 1 * (100/Math.abs(xp));
      particles[iterLine].rotation.z += 2;
      
      for (var i = 1; i < (particles[iterLine].geometry.vertices.length + 1); i++) {
        fallOff = zp * Math.exp(-1 * (((i - xp) * (i - xp)) / 256));
        particles[iterLine].geometry.vertices[i - 1].y = fallOff;
      }
      particles[iterLine].position.z = startZ;

      iter++;

      iterLine++;
      
      if (iter > pointContainer.length - 1) iter = 0;
      if (iterLine > totalLines -1) iterLine = 0;

      

    }

    
    renderer.render(scene, camera);

  }


