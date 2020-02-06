var data = require("./us-states.json");
var shooting_data = require("./data.json");

// Parsing data 
var coordinates = [];
shooting_data.forEach(function (shooting) {
  coordinates.push([shooting.longitude, shooting.latitude]);
});

var width = 975;
var height = 610;

var projection = d3
  .geoAlbersUsa()
  .scale(1300)
  .translate([width / 2, height / 2]);

var path = d3.geoPath();

// initialize svg object
var map = d3
  .select("body")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .style("fill", "none")
  .style("stroke", "steelblue");

// add usa border
map
  .append("path")
  .attr("d", path(topojson.feature(data, data.objects.nation)))
  .style("stroke", "black");

// add state borders
map.append("path").attr("d", path(topojson.feature(data, data.objects.states)));

// Adding points

aa = [-122.490402, 37.786453];
	bb = [-122.389809, 37.72728];

map.selectAll("circle")
		.data(coordinates).enter()
		.append("circle")
		.attr("cx", function (d) { 
      return projection(d)[0]; 
    })
		.attr("cy", function (d) { 
      return projection(d)[1]; 
    })
		.attr("r", "8px")
    .attr("fill", "red")
    
