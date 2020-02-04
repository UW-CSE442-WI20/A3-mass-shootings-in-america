

console.log('hello world');
var width = 950,
    height = 550;

// set projection
var projection = d3.geo.mercator();

// create path variable
var path = d3.geo.path()
    .projection(projection);


d3.csv('./data.csv').then(data => {
    console.log(data)

  	states = topojson.feature(topo, topo.objects.location).features

  	// set projection parameters
  	// projection
    //   .scale(1000)
    //   .center([-106, 37.5])

    // create svg variable
    var svg = d3.select("body").append("svg")
    				.attr("width", width)
    				.attr("height", height);

    // points
    aa = [-122.490402, 37.786453];
	bb = [-122.389809, 37.72728];

	console.log(projection(aa),projection(bb));

	// add states from topojson
	svg.selectAll("path")
      .data(states).enter()
      .append("path")
      .attr("class", "feature")
      .style("fill", "steelblue")
      .attr("d", path);

    // put boarder around states 
  	svg.append("path")
      .datum(topojson.mesh(topo, topo.objects.location, function(a, b) { return a !== b; }))
      .attr("class", "mesh")
      .attr("d", path);

    // add circles to svg
    svg.selectAll("circle")
		.data([aa,bb]).enter()
		.append("circle")
		.attr("cx", function (d) { console.log(projection(d)); return projection(d)[0]; })
		.attr("cy", function (d) { return projection(d)[1]; })
		.attr("r", "8px")
		.attr("fill", "red")

});