var width = window.innerWidth,  //scale + center map
    height = window.innerHeight;
var projection = d3.geoAlbersUsa()
    .scale(2000)    //resize so it can focus in on new england
    .translate([width/2, height/2])
    .precision(.1);

var svgStates = d3.select("svg #states");

var path = d3.geoPath()
    .projection(projection);

d3.json("../data/states.json", function(error, topologies) {

    var state = topojson.feature(topologies[0], topologies[0].objects.stdin);
    console.log(state.features) //debugging
    var newEngland = ["Connecticut", "Rhode Island", "Massachusetts", "Vermont", "New Hampshire", "Maine"];
    var newEnglandData = state.features.filter(function(state) {    //filter the states to focus the map on new england
        return newEngland.includes(state.properties.STATENAM);    //STATENAM is the property in the JSON which we need to match
    });
    console.log(newEnglandData) //debugging

    svgStates.selectAll("path")
        .data(newEnglandData)
        .enter()
      .append("path")
        .attr("d", path);
  });