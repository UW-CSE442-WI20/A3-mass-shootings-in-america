var topology = require("./us-states.json");
var width = 975;
var height = 610;

var path = d3.geoPath();

// initialize svg object
var map = d3
  .select("body")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("id", "map");

// add usa border
map
  .append("path")
  .attr("class", "map")
  .attr("d", path(topojson.feature(topology, topology.objects.nation)));

// add state borders
map
  .append("path")
  .attr("class", "map")
  .attr("d", path(topojson.feature(topology, topology.objects.states)));

var tooltip = d3
  .select("map")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

var projection = d3
  .geoAlbersUsa()
  .scale(1300)
  .translate([487.5, 305]);

// add data points
var coordinates = [];
var data = require("./data.csv");
d3.csv(data, function(row) {
  let coord = [row.longitude, row.latitude];
  let x = projection(coord)[0],
    y = projection(coord)[1];
  map
    .append("circle")
    .attr("cx", x)
    .attr("cy", y)
    .attr("r", Math.sqrt(row.total_victims))
    .attr("fill", "red")
    .attr("opacity", 1)
    .on("mouseover", function() {
      d3.select(this).attr("opacity", 0.8);
      tooltip
        .text(row.case)
        .attr("opacity", 0.6)
        .attr("x", d3.event.pageX)
        .attr("y", d3.event.pageY)
        .transition()
        .duration(200);
    })
    .on("mouseout", function() {
      d3.select(this).attr("opacity", 1);
      tooltip
        .transition()
        .duration(500)
        .attr("opacity", 0);
    });
  coordinates.push([x, y]);
});
