import "regenerator-runtime/runtime";

var filters = {
  fatalities: {
    img: "https://img.icons8.com/ios-glyphs/30/000000/self-destruct-button.png",
    col: 1
  },
  weapon: { img: "https://img.icons8.com/metro/26/000000/gun.png", col: 2 },
  age: { img: "https://img.icons8.com/metro/26/000000/age.png", col: 3 },
  gender: {
    img: "https://img.icons8.com/metro/26/000000/gender--v1.png",
    col: 4
  }
};
var topology = require("./us-states.json");
var map, tooltip, info, legend;
var width = 975,
  height = 610,
  focus = d3.select(null);
var defaultView = viewToString(0, 0, width, height);

var currentFilter;
var projection = d3
  .geoAlbersUsa()
  .scale(1300)
  .translate([487.5, 305]);

var path = d3.geoPath();
var data = require("./data.csv");
var smallest_year = 9999;
var largest_year = 0;

var allData = [];
var curData = [];
var year_to_data = {};
var coord_to_data = {};

async function parseData() {
  await d3.csv(data, async function(row) {
    allData.push(row);
    if (year_to_data[row.year] === undefined) {
      year_to_data[row.year] = [row];
    } else {
      year_to_data[row.year].push(row);
    }
    smallest_year = Math.min(smallest_year, parseInt(row.year));
    largest_year = Math.max(largest_year, parseInt(row.year));
  });
}

async function renderMap() {
  // Initialize svg object
  map = d3
    .select("#map")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", defaultView)
    .attr("preserveAspectRatio", "xMidYMid slice")
    .attr("id", "map")
    .on("click", handleClick);

  tooltip = d3
    .select("#map")
    .append("div")
    .attr("class", "tooltip");

  info = d3
    .select("#map")
    .append("div")
    .attr("class", "info")
    .attr("height", "0px");

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

  for (let i = 0; i < curData.length; i++) {
    let row = curData[i];
    let coord = [row.longitude, row.latitude];
    let x = projection(coord)[0],
      y = projection(coord)[1];

    // Adding circles
    var p = map
      .append("circle")
      .attr("cx", x)
      .attr("cy", y)
      .attr("r", Math.sqrt(row.fatalities) * 2)
      .attr("fill", "red")
      .attr("opacity", 1)
      .attr("id", "point")
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
        tooltip.html("").style("opacity", 0);
      })
      .on("click", handleClick);
    coord_to_data[(Math.round(x), Math.round(y))] = row;
  }
}

function handleClick() {
  if (focus.node() === this || this["id"] !== "point") {
    focus = d3.select(null);
    // reset to default view
    info
      .html("")
      .style("padding", 0)
      .transition()
      .duration(300)
      .style("height", 0 + "px");
    zoom(defaultView);
  } else {
    focus = d3.select(this);
    event.stopPropagation();
    let x = Math.round(focus._groups[0][0]["cx"].baseVal.value),
      y = Math.round(focus._groups[0][0]["cy"].baseVal.value),
      size = 500;

    handleWindow(x, y, coord_to_data[(x, y)]);
    let view = viewToString(x - size / 2, y - size / 2, size, size);
    zoom(view);
  }

  function zoom(view) {
    map
      .transition()
      .duration(750)
      .attr("viewBox", view);
  }

  function handleWindow(x, y, pointData) {
    var scale = 1.3;
    x =
      x < width / 2
        ? Math.max(x - x * scale, 50)
        : Math.min(x + x * scale, 700);
    y =
      y < height / 2 ? Math.max(y - y * scale, 150) : Math.min(y * scale, 250);

    var externalLink = pointData.sources.split(";")[0];
    var embedd =
      "<iframe sandbox=allow-scripts width=400 height=500 src=" +
      externalLink +
      "</iframe>";

    info
      .html(embedd)
      .style("left", x + "px")
      .style("top", y + "px")
      .style("height", 0 + "px")
      .style("opacity", 0)
      .style("padding", "5px 5px 5px 5px")
      .transition()
      .duration(1000)
      .style("opacity", 0.9)
      .style("width", 400 + "px")
      .style("height", 500 + "px");
  }
}

function viewToString(x1, y1, x2, y2) {
  return x1 + " " + y1 + " " + x2 + " " + y2;
}

async function initSlider() {
  var slider_label = document.getElementById("slider_year");
  var slider = document.getElementById("slider");
  var all_years = document.getElementById("all_years_button");

  all_years.addEventListener("click", function() {
    slider_label.innerText = "All years";
    curData = allData;
    document.getElementById("map").innerHTML = "";
    renderMap();
  });
  slider_label.innerText = "All years";
  slider.setAttribute("max", largest_year);
  slider.setAttribute("min", smallest_year);
  slider.addEventListener("change", function() {
    document.getElementById("slider_year").innerText = document.getElementById(
      "slider"
    ).value;
    let temp = year_to_data[document.getElementById("slider").value];
    if (temp === undefined) {
      curData = [];
    }
    curData = temp;
    document.getElementById("map").innerHTML = "";
    renderMap();
  });
}

async function initFilter() {
  d3.select("filter").attr("opacity", 0.2);
  d3.select("filter")
    .text("Filters")
    .attr("class", "desc");
  legend = d3.select("filter").append("div");
  let menu = d3
    .select("filter")
    .append("div")
    .attr("class", "menu");

  Object.keys(filters).forEach(function(key) {
    menu
      .append("img")
      .attr("src", filters[key].img)
      .attr("id", key)
      .on("click", updateFilter);
  });

  menu
    .append("svg")
    .attr("id", "selector")
    .attr("class", "selector")
    .style("grid-column", 4);
}

function updateFilter() {
  console.log("here");
  currentFilter = d3.select(this);

  var move = filters[currentFilter.node()["id"]].col;
  d3.select("selector")
    .transition()
    .duration(400)
    .style("grid-column", move);
}

async function init() {
  await parseData();
  curData = allData;
  await initFilter();
  await renderMap();
  await initSlider();
}

init();
