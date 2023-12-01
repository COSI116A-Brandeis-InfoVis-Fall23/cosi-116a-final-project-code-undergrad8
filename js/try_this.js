function map(){

    let ourBrush = null,
    selectableElements = d3.select(null),
    dispatcher;

    function chart(selector, data) {

        var width = window.innerWidth,  //scale + center map
            height = window.innerHeight;
        var projection = d3.geoAlbersUsa()
            .scale(2000)    //resize so it can focus in on new england
            .translate([width/500, height/2])
            .precision(.1);

        let map = d3.select(selector)
            .append("svg")
            .classed("vis-1", true);

        var path = d3.geoPath() //set path
            .projection(projection);

        d3.json("../data/states.json", function(error, topologies) {
            var state = topojson.feature(topologies[12], topologies[12].objects.stdin);
            console.log(state.features) //debugging
            var newEngland = ["Connecticut", "Rhode Island", "Massachusetts", "Vermont", "New Hampshire", "Maine"];
            var newEnglandData = state.features.filter(function(state) {    //filter the states to focus the map on new england
                return newEngland.includes(state.properties.STATENAM);    //STATENAM is the property in the JSON which we need to match
            });
            console.log(newEnglandData) //debugging
            map.selectAll("path")
                .data(newEnglandData)   //use the newEngland states only
                .enter()
                .append("path")
                .attr("d", path);

                d3.json("../data/official_data.json", function(error, localCensus2021) {  //nested: join state_local data file to geo data

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
                
                    var paths = map.selectAll("path") //create new paths SVG selection 
                        .data(mergeData)
                        .enter()
                        .append("path")
                        .attr("d", path)
                        .merge(map.selectAll("path"))
                        .style("fill", function(d) {
                            return colorScale(d.Police_per_capita);
                        })
                        .append("svg:title")
                        .text(function(d) { //tooltip
                            console.log(d.Population)   //debugging
                            return ["State: " + d.properties.STATENAM + "\nPopulation: " + d.Population + "\nPolice per capita: " +d.Police_per_capita + "\nTotal police expenditure: " + d.Local_police];
                        });

                    })

        })

        return chart;

    }

    chart.selectionDispatcher = function (_) {
        if (!arguments.length) return dispatcher;
        dispatcher = _;
        return chart;
      };

      chart.updateSelection = function (selectedData) {
        if (!arguments.length) return;
      };

      return chart;

}