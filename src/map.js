var topology = require("./us-states.json");
var width = 975;
var height = 610;

var projection = d3
  .geoAlbersUsa()
  .scale(1300)
  .translate([487.5, 305]);

var path = d3.geoPath();

// Initialize svg object
var map = d3
  .select("body")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("id", "map")
  .attr("class", "tooltip");

// Adding usa border
map
  .append("path")
  .attr("class", "map")
  .attr("d", path(topojson.feature(topology, topology.objects.nation)));

// Adding state borders
map
  .append("path")
  .attr("class", "map")
  .attr("d", path(topojson.feature(topology, topology.objects.states)));

var infoWindowOpen;
var tooltip = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .on("mouseon", (infoWindowOpen = true));

// Adding points
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
    .attr("r", Math.sqrt(row.fatalities) * 2)
    .attr("fill", "red")
    .attr("opacity", 1)
    .on("mouseover", function() {
      d3.select(this).attr("opacity", 0.6);
      tooltip
        .html(row.case)
        .style("left", d3.event.pageX + 5 + "px")
        .style("top", d3.event.pageY - 20 + "px")
        .style("opacity", 1);
    })
    .on("mouseout", function() {
      d3.select(this).attr("opacity", 1);
      if (!infoWindowOpen) {
        tooltip.html("").style("opacity", 0);
      }
    })
    .on("click", function() {
      d3.select(this).attr("opacity", 0.6);
      tooltip.transition().ease();
      tooltip.html(
        "<b>" +
          row.case +
          "</b><br>(" +
          row.location +
          ")" +
          "<br><br>Fatalities: " +
          row.fatalities +
          "<br>Injuries: " +
          row.injured +
          "<br><br><a href=" +
          row.sources +
          ">More info</a>"
      );
    });
});
