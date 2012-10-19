var window, console;


  // Check for the various File API support.
if (window.File && window.FileReader && window.FileList && window.Blob) {
    // Great success! All the File APIs are supported.
    console.log('success');
  } else {
    console.log('The File APIs are not fully supported in this browser.');
  }

// DOCUMENT READY EVENT
$(document).ready(function() {
	  init();
});

function makeData(data) {
  
  var dataContainer = [];
  var lastKey = '';
  var iter = 0;
  var dataObject = { 'key' : '', values : []};
  var finish = false;
  var last = data.length -1;
  
	  
};

function count(obj) {
  var i = 0;
  for (var x in obj)
    if (obj.hasOwnProperty(x))
      i++;
  return i;
}

function merge(obj1, obj2) {
    for( var p in obj2 )
        if( obj1.hasOwnProperty(p) )
            obj1[p] = typeof obj2[p] === 'object' ? merge(obj1[p], obj2[p]) : obj2[p];

    return obj1;
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






var dataContainer = {};
var dataObject = {};
var box = [];
	var total = 0;








function init() {
  //setup variables

  var $_GET = {};

  document.location.search.replace(/\??(?:([^=]+)=([^&]*)&?)/g, function () {
      function decode(s) {
          return decodeURIComponent(s.split("+").join(" "));
      }

      $_GET[decode(arguments[1])] = decode(arguments[2]);
  });
   
  var datafile = $_GET["walk"];
  console.log(datafile);
  $.getJSON('/parse/'+datafile+'/', function(data) {
	total = count(data);
	for (var i =0; i<total; i+=10) {
		var obj = data[i];
		$.each(obj, function(key, value) { 
	  		if (!dataContainer.hasOwnProperty(key) && key != 'time') dataContainer[key] = [];
			if (key != 'time') dataContainer[key].push({'y':value, 'x':obj['time']});
		});
	};

		
	$.each(dataContainer, function(key,value) {
		 dataObject = {'key':key, 'values':value};
    	 box.push(dataObject);
	 });

	  
    dataLoaded = true;
    checkForLoad();
  });

}

function checkForLoad() {
  if (dataLoaded) {
    // wait for the loading message to hide :)
    setTimeout(function() {
      plotData();
    }, 100);
  }
}

function plotData() {
	
	for (var i =0; i<box.length; i++) {
		var data = [];
		data.push(box[i]);
		var colors = [['red'], ['blue'], ['cyan'], ['orange'], ['green']];
		(function (c, ddd) { 
 	nv.addGraph(function() {
		 var div = d3.select('#graphs').append('div').attr('class', 'chart');
		 div.append("h5").text(ddd[0].key);
		 var svg = div.append('svg');
  	     var chart = nv.models.lineChart()
		 .showLegend(false)
		 .x(function(d) { return d.x/1000})
		 .y(function(d) { return d.y})
		 .color(colors[c]);
		 

		 // declare scales
		 xs = chart.xScale();
		 ys = chart.yScale();
		 svg.datum(ddd).transition().duration(500).call(chart);
	 		
	     nv.utils.windowResize(chart.update);

	     return chart;
		});
		})(i, data);
	};


	
	
	

};