var width = window.innerWidth,  //scale + center map
    height = window.innerHeight;
var projection = d3.geoAlbersUsa()
    .scale(2000)    //resize so it can focus in on new england
    .translate([width/500, height/2])
    .precision(.1);

var svgStates = d3.select("svg #states");   //select svg

var path = d3.geoPath() //set path
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
        .data(newEnglandData)   //use the newEngland states only
        .enter()
      .append("path")
        .attr("d", path);
  
        d3.json("../data/state_local_2021.json", function(error, localCensus2021) {  //nested: join state_local data file to geo data

            var mergeData = newEnglandData.map(function(newEnglandState) {  //
                var censusState = localCensus2021.find(function(localCensus) {
                    return localCensus.STATENAM === newEnglandState.properties.STATENAM; //compare the STATENAM property from the geo new england data and the census data
                });

                return Object.assign({}, newEnglandState, censusState); //assign properties of censusState to newEnglandState
            });

            var Per_Capitas = mergeData.map(function(d) {
                return d.Police_per_capita;
            });

            var colorScale = d3.scaleSequential(d3.interpolateBlues)
                .domain([d3.min(Per_Capitas)-.015, d3.max(Per_Capitas)+.025]);

            console.log(mergeData)  //debugging
        
            var paths = svgStates.selectAll("path") //create new paths SVG selection 
                .data(mergeData)
                .enter()
                .append("path")
                .attr("d", path)
                .merge(svgStates.selectAll("path"))
                .style("fill", function(d) {
                    return colorScale(d.Police_per_capita);
                })
                .append("svg:title")
                .text(function(d) { //tooltip
                    console.log(d.Population)   //debugging
                    return ["State: " + d.properties.STATENAM + "\nPopulation: " + d.Population + "\nPolice per capita: " +d.Police_per_capita + "\nTotal police expenditure: " + d.Police_protection];
                });
                    //TODO: Add color
                    //TODO: make the tooltip fancy - should it be a separate object as opposed to the way we learned it in class, or is css enough?
                    //TODO: make map fit page better
                    //TODO: find state data that isn't from the 1790 when maine was a part of massachusetts lol
        });
  
    });

  