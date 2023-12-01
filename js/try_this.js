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
                        .on("mouseover", function(d){
                            console.log("mouseover")
                        })
                        .on("mouseout", function(d){
                            console.log("mouseout")
                        })
                        .on("mousedown", function(d){
                            console.log("mousedown")
                        })
                        .on("mouseup", function(d){
                            console.log("mouseup")
                        })
                        .append("svg:title")
                        .text(function(d) { //tooltip
                            console.log(d.Population)   //debugging
                            return ["State: " + d.properties.STATENAM + "\nPopulation: " + d.Population + "\nPolice per capita: " +d.Police_per_capita + "\nTotal police expenditure: " + d.Local_police];
                        })
                        ;

                    })


        })

        // isBrushing = false;
        
        // //how to make it individual states selectable? var paths = map.selectAll("path")
        // d3.selectAll("path")
        // .on("mouseover", (d, i, elements) => {
        //     console.log("over")
        //     d3.select(elements[i]).classed("mouseover", true) //class as "mouseover" to create gray hover
        //     /*
        //     the following block of code occurs when the mouse was held down but not yet let up, meaning in a selectable hovering state
        //     otherwise, if the mouse was not yet held down, or has already been let up, this hovering does not select data
        //     */
        //     if(isBrushing){ //true after mouseDown, false after mouseUp or when there has not yet been a mouseDown
        //       d3.select(elements[i]).classed("selected", true)  //class as "selected" to create dark pink mouseover.selected color
        //       let dispatchString = Object.getOwnPropertyNames(dispatcher._)[0];
        //       dispatcher.call(dispatchString, this, map.selectAll(".selected").data());  //dispatch
        //     }
        //   })
        //   .on("mouseout", (d, i, elements) => {
        //     console.log("out")
        //     d3.select(elements[i]).classed("mouseover", false)  //remove gray color; that should only be during individual hover
        //     if(!isBrushing){  //if you are no longer brushing, dispatch
        //       let dispatchString = Object.getOwnPropertyNames(dispatcher._)[0];
        //       dispatcher.call(dispatchString, this, map.selectAll(".selected").data());
        //     }
          
        //   })
        //   .on("mousedown", (d, i, elements) => {
        //     console.log("down")
        //     d3.selectAll("tr").classed("selected", false) //clear previous selected data
        //     let dispatchString = Object.getOwnPropertyNames(dispatcher._)[0];
        //     dispatcher.call(dispatchString, this, map.selectAll(".selected").data());  //dispatch
        //     isBrushing = true;  //set isBrushing to true to keep track when hovering
        //     d3.event.preventDefault();  //override the blue highlight
        //   })
        //   .on("mouseup", (d, i, elements) => {
        //     console.log("up")
        //     if(isBrushing){ //if you were just brushing, dispatch data
        //       d3.select(elements[i]).classed("selected", true)
        //       let dispatchString = Object.getOwnPropertyNames(dispatcher._)[0];
        //       dispatcher.call(dispatchString, this, map.selectAll(".selected").data());
        //     }
        //     isBrushing = false; //set isBrushing to false
        //   });

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