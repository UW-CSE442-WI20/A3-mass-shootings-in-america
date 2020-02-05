var data = require("./us-states.json");
var width = 975;
var height = 610;

var projection = d3
  .geoAlbersUsa()
  .scale(1300)
  .translate([487.5, 305]);

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
