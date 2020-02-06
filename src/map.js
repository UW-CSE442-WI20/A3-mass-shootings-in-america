import "regenerator-runtime/runtime";
var topology = require("./us-states.json");
var width = 975;
var height = 610;

var projection = d3
  .geoAlbersUsa()
  .scale(1300)
  .translate([487.5, 305]);

var path = d3.geoPath();
var coordinates = [];
var data = require("./data.csv");
var smallest_year = 9999;
var largest_year = 0;

var allData = [];
var curData = [];
var year_to_data = {};

async function parseData(){
  await d3.csv(data, async function(row) {
    allData.push(row);
    if(year_to_data[row.year] === undefined){
      year_to_data[row.year] = [row];
    }else{
      year_to_data[row.year].push(row);
    }
    smallest_year = Math.min(smallest_year, parseInt(row.year));
    largest_year = Math.max(largest_year, parseInt(row.year));
  })
}

async function renderMap(){
  // Initialize svg object
  var map = d3
  .select("#map")
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

  for(let i = 0; i < curData.length; i++){
    let row = curData[i];
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
  };
}

async function initSlider(){
  var slider_label = document.getElementById("slider_year");
  var slider = document.getElementById("slider");
  var all_years = document.getElementById("all_years_button");

  all_years.addEventListener("click", function(){
    slider_label.innerText = "All years";
    curData = allData;
    document.getElementById("map").innerHTML = "";
    renderMap();
  })
  slider_label.innerText = "All years";
  slider.setAttribute("max", largest_year);
  slider.setAttribute("min", smallest_year);
  slider.addEventListener("change", function(){
    document.getElementById("slider_year").innerText = document.getElementById("slider").value;
    let temp = year_to_data[document.getElementById("slider").value];
    if(temp === undefined){
      curData = [];
    }
    curData = temp;
    document.getElementById("map").innerHTML = "";
    renderMap();
  });

}

async function init(){
  await parseData();
  curData = allData;
  await renderMap();
  await initSlider();
}

init();
// Manage slider

