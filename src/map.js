const regeneratorRuntime = require("regenerator-runtime");
var topology = require("./us-states.json");
var map, tooltip, hist_tooltip, info, focus, zoom, view, prevYear;
var width = 975,
  height = 610,
  focus = d3.select(null);

var projection = d3
    .geoAlbersUsa()
    .scale(1300)
    .translate([487.5, 305]),
  path = d3.geoPath();

var data = require("./data.csv");
var smallest_year = 9999;
var largest_year = 0;

var allData = [];
var curData = [];
var year_to_data = {};
var filters = {
  race: [],
  location_state: [],
  gender: [],
  weapon_type: [],
  mental: [],
  age: [],
  legal: [],
  location: [],
  type: []
};

var selected_filters = {
  race: [],
  location_state: [],
  gender: [],
  weapon_type: [],
  mental: [],
  age: [],
  legal: [],
  location: [],
  type: []
};

var div = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

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
    if (!filters.race.includes(row.race.trim())) {
      filters.race.push(row.race.trim());
    }
    let state = row.location.split(", ")[1];
    if (!filters.location_state.includes(state)) {
      filters.location_state.push(state);
    }

    if (!filters.gender.includes(row.gender)) {
      filters.gender.push(row.gender);
    }
    let weapons = row.weapon_type.split(";");
    weapons.forEach(weapon => {
      weapon = weapon.trim();
      if (!filters.weapon_type.includes(weapon)) {
        filters.weapon_type.push(weapon);
      }
    });

    if (!filters.mental.includes(row.prior_signs_mental_health_issues)) {
      filters.mental.push(row.prior_signs_mental_health_issues);
    }
    let rounded_age = Math.floor(parseInt(row.age_of_shooter) / 10) * 10;

    rounded_age =
      row.age_of_shooter == "Unclear"
        ? "Unknown"
        : rounded_age + "-" + Number(rounded_age + 9);
    if (!filters.age.includes(rounded_age)) {
      filters.age.push(rounded_age);
    }
    if (!filters.legal.includes(row.weapons_obtained_legally)) {
      filters.legal.push(row.weapons_obtained_legally);
    }
    if (!filters.type.includes(row.type)) {
      filters.type.push(row.type);
    }
    if (!filters.location.includes(row.location_type)) {
      filters.location.push(row.location_type);
    }
  });
  Object.values(filters).forEach(v => (v = v.sort()));
}

function filterData(data) {
  if (data === undefined) {
    return [];
  }
  let filteredData = data;

  filteredData =
    selected_filters.race.length > 0
      ? filteredData.filter(row => selected_filters.race.includes(row.race))
      : filteredData;
  filteredData =
    selected_filters.location_state.length > 0
      ? filteredData.filter(row =>
          selected_filters.location_state.includes(row.location.split(", ")[1])
        )
      : filteredData;
  filteredData =
    selected_filters.gender.length > 0
      ? filteredData.filter(row => selected_filters.gender.includes(row.gender))
      : filteredData;
  filteredData =
    selected_filters.weapon_type.length > 0
      ? filteredData.filter(
          row =>
            selected_filters.weapon_type.filter(val =>
              row.weapon_type
                .split(";")
                .map(s => s.trim())
                .includes(val)
            ).length > 0
        )
      : filteredData;
  filteredData =
    selected_filters.mental.length > 0
      ? filteredData.filter(row =>
          selected_filters.mental.includes(row.prior_signs_mental_health_issues)
        )
      : filteredData;
  filteredData =
    selected_filters.age.length > 0
      ? filteredData.filter(row =>
          selected_filters.age.includes("" + row.age_of_shooter.substring(0, 1))
        )
      : filteredData;
  filteredData =
    selected_filters.legal.length > 0
      ? filteredData.filter(row =>
          selected_filters.legal.includes(row.weapons_obtained_legally)
        )
      : filteredData;
  filteredData =
    selected_filters.location.length > 0
      ? filteredData.filter(row =>
          selected_filters.location.includes(row.location_type)
        )
      : filteredData;
  filteredData =
    selected_filters.type.length > 0
      ? filteredData.filter(row => selected_filters.type.includes(row.type))
      : filteredData;

  return filteredData;
}

async function renderMap() {
  // Initialize svg object
  document.getElementById("map").innerHTML = "";
  let data = filterData(curData);
  map = d3
    .select("#map")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("id", "map")
    .append("g");

  tooltip = d3
    .select("#map")
    .append("div")
    .attr("class", "tooltip");
  zoom = d3
    .zoom()
    .scaleExtent([1, 8])
    .on("zoom", zoomed);

  view = map
    .append("rect")
    .attr("width", width)
    .attr("height", height)
    .style("fill", "none")
    .style("pointer-events", "all");
  map.call(zoom);

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

  // adding lines to ambiguous States
  map
    .selectAll("path")
    .selectAll("path")
    .data(topojson.feature(topology, topology.objects.states).features)
    .enter()
    .append("line")
    .attr("x1", "0")
    .attr("x2", "100")
    .attr("y1", "0")
    .attr("y2", "100")
    .attr("style", "stroke:rgb(255,0,0);stroke-width:2");
  // Adding states names to display at the center
  map
    .append("text")
    .attr("x", "100")
    .attr("y", "520")
    .attr("text-anchor", "middle")
    .attr("font-size", "10px")
    .attr("style", "font-family: Arial, Helvetica, sans-serif")
    .text("Alaska");

  map
    .append("text")
    .attr("x", "675.0748626338498")
    .attr("y", "437")
    .attr("text-anchor", "middle")
    .attr("font-size", "10px")
    .attr("style", "font-family: Arial, Helvetica, sans-serif")
    .text("Alabama");

  map
    .selectAll("path")
    .data(topojson.feature(topology, topology.objects.states).features)
    .enter()
    .append("text")
    .attr("x", function(d) {
      // maually fixing display
      switch (d.properties.name) {
        case "Michigan":
          return path.centroid(d)[0] + 20;
        case "Florida":
          return path.centroid(d)[0] + 25;
        case "New Hampshire":
          return path.centroid(d)[0] + 51;
        case "Connecticut":
          return path.centroid(d)[0] + 45;
        case "Rhode Island":
          return path.centroid(d)[0] + 35;
        case "District of Columbia":
          return path.centroid(d)[0] + 85;
        case "Massachusetts":
          return path.centroid(d)[0] + 48;
        case "Delaware":
          return path.centroid(d)[0] + 50;
        case "New Jersey":
          return path.centroid(d)[0] + 50;
        default:
          return path.centroid(d)[0];
      }
    })
    .attr("y", function(d) {
      switch (d.properties.name) {
        case "Michigan":
          return path.centroid(d)[1] + 25;
        case "Florida":
          return path.centroid(d)[1] + 25;
        case "New Hampshire":
          return path.centroid(d)[1] + 15;
        case "Connecticut":
          return path.centroid(d)[1] + 30;
        case "Rhode Island":
          return path.centroid(d)[1] + 20;
        case "District of Columbia":
          return path.centroid(d)[1] + 40;
        case "Massachusetts":
          return path.centroid(d)[1];
        case "Delaware":
          return path.centroid(d)[1] + 15;
        case "New Jersey":
          return path.centroid(d)[1] + 15;
        default:
          return path.centroid(d)[1];
      }
    })
    .attr("text-anchor", "middle")
    .attr("font-size", "9px")
    .attr("style", "font-family: Arial, Helvetica, sans-serif")
    .attr("fill", function(d) {
      if (
        d.properties.name == "Hawaii" ||
        d.properties.name == "New Hampshire" ||
        d.properties.name == "Rhode Island" ||
        d.properties.name == "Connecticut" ||
        d.properties.name == "District of Columbia" ||
        d.properties.name == "New Jersey" ||
        d.properties.name == "Massachusetts" ||
        d.properties.name == "Delaware"
      ) {
        return "white";
      }
    })
    .attr("stroke", function(d) {
      if (
        d.properties.name == "Hawaii" ||
        d.properties.name == "New Hampshire" ||
        d.properties.name == "Rhode Island" ||
        d.properties.name == "Connecticut" ||
        d.properties.name == "District of Columbia" ||
        d.properties.name == "New Jersey" ||
        d.properties.name == "Massachusetts" ||
        d.properties.name == "Delaware"
      ) {
        return "black";
      }
    })
    .attr("stroke-width", function(d) {
      if (
        d.properties.name == "New Hampshire" ||
        d.properties.name == "Rhode Island" ||
        d.properties.name == "Connecticut" ||
        d.properties.name == "District of Columbia" ||
        d.properties.name == "New Jersey" ||
        d.properties.name == "Massachusetts" ||
        d.properties.name == "Delaware"
      ) {
        return "0.2px";
      } else if (d.properties.name == "Hawaii") return "0.1px";
    })
    .text(function(d) {
      // Manually erasing states names that are hard to display
      return d.properties.name;
    });

  map
    .selectAll(".path")
    .data(topojson.feature(topology, topology.objects.states).features)
    .enter()
    .append("line")
    .attr("x1", function(d) {
      if (
        d.properties.name == "New Hampshire" ||
        d.properties.name == "Rhode Island" ||
        d.properties.name == "Connecticut" ||
        d.properties.name == "District of Columbia" ||
        d.properties.name == "New Jersey" ||
        d.properties.name == "Massachusetts" ||
        d.properties.name == "Delaware"
      ) {
        return path.centroid(d)[0];
      }
      return 0;
    })
    .attr("x2", function(d) {
      switch (d.properties.name) {
        case "New Hampshire":
          return path.centroid(d)[0] + 15;
        case "Connecticut":
          return path.centroid(d)[0] + 20;
        case "Rhode Island":
          return path.centroid(d)[0] + 11;
        case "District of Columbia":
          return path.centroid(d)[0] + 45;
        case "Massachusetts":
          return path.centroid(d)[0] + 20;
        case "Delaware":
          return path.centroid(d)[0] + 30;
        case "New Jersey":
          return path.centroid(d)[0] + 25;
        default:
          return 0;
      }
    })
    .attr("y1", function(d) {
      if (
        d.properties.name == "New Hampshire" ||
        d.properties.name == "Rhode Island" ||
        d.properties.name == "Connecticut" ||
        d.properties.name == "District of Columbia" ||
        d.properties.name == "New Jersey" ||
        d.properties.name == "Massachusetts" ||
        d.properties.name == "Delaware"
      ) {
        return path.centroid(d)[1];
      }
      return 0;
    })
    .attr("y2", function(d) {
      switch (d.properties.name) {
        case "New Hampshire":
          return path.centroid(d)[1] + 10;
        case "Connecticut":
          return path.centroid(d)[1] + 25;
        case "Rhode Island":
          return path.centroid(d)[1] + 15;
        case "District of Columbia":
          return path.centroid(d)[1] + 35;
        case "Massachusetts":
          return path.centroid(d)[1] - 2;
        case "Delaware":
          return path.centroid(d)[1] + 12;
        case "New Jersey":
          return path.centroid(d)[1] + 10;
        default:
          0;
      }
    })
    .attr("stroke", "yellow")
    .attr("stroke-width", 1)
    .attr("opacity", 0.8);

  for (let j = 0; j < data.length; j++) {
    let row = data[j];
    let coord = [row.longitude, row.latitude];
    let x = projection(coord)[0],
      y = projection(coord)[1];

    // Adding circles
    map
      .append("circle")
      .attr("cx", x)
      .attr("cy", y)
      .attr("r", Math.sqrt(row.fatalities) * 2)
      .attr("fill", "red")
      .attr("stroke", "rgba(255, 0, 0, 0.5)")
      .attr("stroke-width", "1%")
      .attr("opacity", "0.8")
      .attr("id", "point")
      .on("mouseover", function() {
        d3.select(this).attr("opacity", 0.6);
        div
          .transition()
          .duration(200)
          .style("opacity", 0.9);
        div
          .html(row.case + "<br/>" + row.fatalities + " casualties")
          .style("left", d3.event.pageX + "px")
          .style("top", d3.event.pageY - 28 + "px");
      })
      .on("mouseout", function() {
        d3.select(this).attr("opacity", 1);
        div
          .transition()
          .duration(500)
          .style("opacity", 0);
      })
      .on("click", function() {
        openPanel(row);
      });
  }
}

function zoomed() {
  map.attr("transform", d3.event.transform);
}

function closePanel() {
  d3.select("#info")
    .style("opacity", 0.7)
    .transition()
    .duration(300)
    .style("opacity", 0)
    .on("end", function() {
      d3.select("#info").html("");
    });
}

function victimCount(count, col) {
  let ret = "";
  for (let i = 0; i < count; i++) {
    ret +=
      "<i class=material-icons style=font-size:14px;color:" +
      col +
      ";>person</i>";
  }
  return ret;
}

function openPanel(pointData) {
  closePanel();
  let fat = pointData.fatalities,
    inj = pointData.injured;
  var content =
    "<div class=info_panel><div class=title>" +
    pointData.case +
    "</div><br><div class=info>" +
    "<i class=material-icons style=font-size:14px;color:black;>location_on</i>  " +
    pointData.location +
    "<br><i class=material-icons style=font-size:14px;color:black;>date_range</i>  " +
    pointData.date +
    "</div><div class=stat-container>" +
    "<div class=stat><div class=cat>Fatalities<br><h6>" +
    fat +
    "</h6></div>" +
    "<div class=count>" +
    victimCount(fat, "darkred") +
    "</div></div>" +
    "<div class=stat><div class=cat>Injured<br><h6>" +
    inj +
    "</h6></div>" +
    "<stat class=count>" +
    victimCount(inj, "orangered") +
    "</div></div><div class=desc>" +
    pointData.summary +
    "<br><center><br><button id=wb class=btn>X</button></div>";

  d3.select("#info")
    .html(content)
    .style("opacity", 0)
    .style("height", 0)
    .transition()
    .duration(700)
    .style("opacity", 0.7)
    .style("height", "auto");

  document.getElementById("wb").addEventListener("click", closePanel);
}

async function initSlider() {
  var slider_label = document.getElementById("slider_year");
  var slider = document.getElementById("slider");
  var all_years = document.getElementById("all_years_button");

  all_years.addEventListener("click", function() {
    slider_label.innerText = "All years";
    curData = allData;
    document.getElementById("map").innerHTML = "";
    highlightYear("all");
    renderMap();
  });
  slider_label.innerText = "All years";
  slider.setAttribute("max", largest_year);
  slider.setAttribute("min", smallest_year);
  slider.addEventListener("change", function() {
    document.getElementById("slider_year").innerText = document.getElementById(
      "slider"
    ).value;
    let currentYear = document.getElementById("slider").value;
    highlightYear(currentYear);
    let temp = year_to_data[currentYear];
    if (temp === undefined) {
      curData = [];
    }
    curData = temp;
    document.getElementById("map").innerHTML = "";
    renderMap();
  });
}

async function initFilter() {
  var race_filter = document.getElementById("select_race");
  filters.race.forEach(element => {
    let option = document.createElement("option");
    option.setAttribute("value", element);
    option.innerText = element;
    race_filter.appendChild(option);
  });
  race_filter.addEventListener("change", function() {
    selected_filters.race = $(this).val();
    renderMap();
    initHistogram();
  });

  var location_state_filter = document.getElementById("select_state");
  filters.location_state.forEach(element => {
    let option = document.createElement("option");
    option.setAttribute("value", element);
    option.innerText = element;
    location_state_filter.appendChild(option);
  });
  location_state_filter.addEventListener("change", function() {
    selected_filters.location_state = $(this).val();
    renderMap();
    initHistogram();
  });

  var gender_filter = document.getElementById("select_gender");
  filters.gender.forEach(element => {
    let option = document.createElement("option");
    option.setAttribute("value", element);
    option.innerText = element;
    gender_filter.appendChild(option);
  });
  gender_filter.addEventListener("change", function() {
    selected_filters.gender = $(this).val();
    renderMap();
    initHistogram();
  });

  var weapon_type_filter = document.getElementById("select_weapon");
  filters.weapon_type.forEach(element => {
    let option = document.createElement("option");
    option.setAttribute("value", element);
    option.innerText = element;
    weapon_type_filter.appendChild(option);
  });
  weapon_type_filter.addEventListener("change", function() {
    selected_filters.weapon_type = $(this).val();
    renderMap();
    initHistogram();
  });

  var mental_filter = document.getElementById("select_mental");
  filters.mental.forEach(element => {
    let option = document.createElement("option");
    option.setAttribute("value", element);
    option.innerText = element;
    mental_filter.appendChild(option);
  });
  mental_filter.addEventListener("change", function() {
    selected_filters.mental = $(this).val();
    renderMap();
    initHistogram();
  });

  var age_filter = document.getElementById("select_age");
  filters.age.forEach(element => {
    let option = document.createElement("option");
    option.setAttribute("value", element.substring(0, 1));
    option.innerText = "" + element;
    age_filter.appendChild(option);
  });
  age_filter.addEventListener("change", function() {
    selected_filters.age = $(this).val();
    renderMap();
    initHistogram();
  });

  var legal_filter = document.getElementById("select_legal");
  filters.legal.forEach(element => {
    let option = document.createElement("option");
    option.setAttribute("value", element);
    option.innerText = element;
    legal_filter.appendChild(option);
  });
  legal_filter.addEventListener("change", function() {
    selected_filters.legal = $(this).val();
    renderMap();
    initHistogram();
  });

  var location_filter = document.getElementById("select_location");
  filters.location.forEach(element => {
    let option = document.createElement("option");
    option.setAttribute("value", element);
    option.innerText = element;
    location_filter.appendChild(option);
  });
  location_filter.addEventListener("change", function() {
    selected_filters.location = $(this).val();
    renderMap();
    initHistogram();
  });

  var type_filter = document.getElementById("select_type");
  filters.type.forEach(element => {
    let option = document.createElement("option");
    option.setAttribute("value", element);
    option.innerText = element;
    type_filter.appendChild(option);
  });
  type_filter.addEventListener("change", function() {
    selected_filters.type = $(this).val();
    renderMap();
    initHistogram();
  });

  document.getElementById("filter_reset").addEventListener("click", function() {
    $(".selectpicker").val("default");
    $(".selectpicker").selectpicker("refresh");
    selected_filters = {
      race: [],
      location_state: [],
      gender: [],
      weapon_type: [],
      mental: [],
      age: [],
      legal: [],
      location: [],
      type: []
    };
    renderMap();
    initHistogram();
  });

  $(".selectpicker").selectpicker("refresh");
}

async function initHistogram() {
  // get current width of the slider div
  document.getElementById("histogram").innerHTML = "";
  var currentWidth = parseInt(d3.select("#slider").style("width"), 10);

  var h = 75,
    w = currentWidth,
    xscale = w / 39,
    yscale = 6;
  var graph = d3
    .select("#histogram")
    .append("svg")
    .attr("height", h)
    .attr("width", w)
    .attr("id", "svg-histogram");
  hist_tooltip = d3
    .select("#histogram")
    .append("div")
    .attr("class", "tooltip");

  let filtered_year_data = get_year_to_data();
  let dx = 0;
  for (let i = 1982; i < 2020; i++) {
    let value =
      filtered_year_data[i] === undefined ? 0 : filtered_year_data[i].length;
    let dy = h - value * yscale;

    graph
      .append("rect")
      .attr("height", value * yscale)
      .attr("width", xscale)
      .attr("x", dx)
      .attr("y", dy)
      .attr("id", "y_" + i)
      .style("stroke", "black")
      .on("mouseover", function() {
        let x = d3.select(this).attr("x"),
          y = d3.select(this).attr("y") - 20;

        hist_tooltip
          .html(
            "<b>" + i + ":</b> " + filtered_year_data[i].length + " shootings "
          )
          .style("left", x + "px")
          .style("top", y + "px")
          .style("opacity", 1);
      })
      .on("mouseout", function() {
        hist_tooltip.html("").style("opacity", 0);
      })
      .on("click", function() {
        var event = new Event("change");
        document.getElementById("slider").value = i;
        document.getElementById("slider").dispatchEvent(event);
      });
    dx += xscale + 1;
  }

  window.addEventListener("resize", resizeHisto);
  highlightYear("all");
  if (document.getElementById("slider_year").innerText !== "All Years") {
    var event = new Event("change");
    document.getElementById("slider").dispatchEvent(event);
  }
}

async function highlightYear(year) {
  let highlight = { color: "steelblue", opacity: 1 };
  let def = { color: "lightgray", opacity: 0.4 };

  if (year === "all") {
    for (let i = 1982; i < 2020; i++) {
      d3.select("#y_" + i)
        .style("fill", highlight.color)
        .style("opacity", highlight.opacity);
    }
  } else if (prevYear === "all") {
    for (let i = 1982; i < 2020; i++) {
      if (String(i) !== year) {
        d3.select("#y_" + i)
          .style("fill", def.color)
          .style("opacity", def.opacity);
      }
    }
  } else {
    d3.select("#y_" + prevYear)
      .style("fill", def.color)
      .style("opacity", def.opacity);
    d3.select("#y_" + year)
      .style("fill", highlight.color)
      .style("opacity", highlight.opacity);
  }
  prevYear = year;
}

async function init() {
  await parseData();
  curData = allData;
  await renderMap();
  await initHistogram();
  await initSlider();
  await initFilter();
  d3.select("#init_exit").on("click", closePanel);
}

function get_year_to_data() {
  // this just filters it
  let data = filterData(allData);
  let ret = [];
  for (let i = 0; i < data.length; i++) {
    if (ret[data[i].year] === undefined) {
      ret[data[i].year] = [data[i]];
    } else {
      ret[data[i].year].push(data[i]);
    }
  }
  return ret;
}

// resize function for histogram
function resizeHisto() {
  var currentWidth = parseInt(d3.select("#slider").style("width"), 10);
  var w = currentWidth,
    xscale = w / 40;
  var graph = d3.select("#histogram").attr("width", w);

  var svg = d3.select("#svg-histogram").attr("width", w);

  var histo = d3
    .select("#svg-histogram")
    .selectAll("rect")
    .attr("width", xscale);

  histo.selectAll("rect").each(function(d, i) {
    d3.select(this).attr("x", xscale * i);
  });
}

init();
