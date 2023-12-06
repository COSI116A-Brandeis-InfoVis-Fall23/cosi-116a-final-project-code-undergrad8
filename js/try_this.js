function map(){

    // let ourBrush = null,
    // selectableElements = d3.select(null),
    // dispatcher;

    function chart(selector, data) {

        var width = window.innerWidth,  //scale + center map
            height = window.innerHeight;
        var projection = d3.geoAlbersUsa()
            .scale(2000)    //resize so it can focus in on new england
            .translate([width/500, height/2])
            .precision(.1);

            console.log(selector)
        let map = d3.select(selector)
            .append("svg")
            .classed("vis-1", true);

        var path = d3.geoPath() //set path
            .projection(projection);

        let mergeData;

        d3.json("../data/states.json", function(error, topologies) {
            var state = topojson.feature(topologies[12], topologies[12].objects.stdin); //use topologies[12] so that the geodata is from 1910, not 1790 lol
            //console.log(state.features) //debugging
            var newEngland = ["Connecticut", "Rhode Island", "Massachusetts", "Vermont", "New Hampshire", "Maine"];
            var newEnglandData = state.features.filter(function(state) {    //filter the states to focus the map on new england
                return newEngland.includes(state.properties.STATENAM);    //STATENAM is the property in the JSON which we need to match
            });
            //console.log(newEnglandData) //debugging
            map.selectAll("path")
                .data(newEnglandData)   //use the newEngland states only
                .enter()
                .append("path")
                .attr("d", path)
                .attr("class", "map-element");

            //     console.log("what's in here");
            // console.log(data);

                d3.json("../data/official_data.json", function(error) {  //nested: join state_local data file to geo data

                    d3.select("#map svg.vis-1").html();

                    console.log("and again");
                    console.log(data);
                    mergeData = newEnglandData.map(function(newEnglandState) {
                        var censusState = data.find(function(localCensus) {
                            return localCensus.STATENAM === newEnglandState.properties.STATENAM; //compare the STATENAM property from the geo new england data and the census data
                        });
        
                        return Object.assign({}, newEnglandState, censusState); //assign properties of censusState to newEnglandState
                    });
        
                    var Per_Capitas = mergeData.map(function(d) {
                        return d.Police_per_capita;
                    });
        
                    var colorScale = d3.scaleSequential(d3.interpolateBlues)    //set up your color scale
                        .domain([d3.min(Per_Capitas)-.015, d3.max(Per_Capitas)+.025]);
        
                    //console.log(mergeData)  //debugging
                
                    var paths = map.selectAll("path") //create new paths SVG selection 
                        .data(mergeData)
                        .enter()
                        .append("path")
                        .attr("d", path)
                        .attr("class", "map-element")
                        .merge(map.selectAll("path"))
                        .style("fill", function(d) {
                            return colorScale(d.Police_per_capita); //color them!
                        })
                        // .on("mouseover", function(d){   //testing out mouse events for brushing and linking
                        //     console.log("mouseover")
            //                 d3.select(path).classed("mouseover", true)
            //                 if(isBrushing){ //true after mouseDown, false after mouseUp or when there has not yet been a mouseDown
            //                     d3.select(path[i]).classed("selected", true)  //class as "selected" to create dark pink mouseover.selected color
            //                     let dispatchString = Object.getOwnPropertyNames(dispatcher._)[0];
            //                     dispatcher.call(dispatchString, this, map.selectAll(".selected").data());  //dispatch
            //                 }
             //           })
                        // .on("mouseout", function(d){
                        //     console.log("mouseout")
            //                 d3.select(path).classed("mouseover", false)
            //                 if(!isBrushing){  //if you are no longer brushing, dispatch
            //                     let dispatchString = Object.getOwnPropertyNames(dispatcher._)[0];
            //                     dispatcher.call(dispatchString, this, map.selectAll(".selected").data());
            //                 }
                        //  })
                        // .on("mousedown", function(d){
                        //     console.log("mousedown")
            //                 d3.selectAll("path").classed("selected", false) //clear previous selected data
            //                 let dispatchString = Object.getOwnPropertyNames(dispatcher._)[0];
            //                 dispatcher.call(dispatchString, this, map.selectAll(".selected").data());  //dispatch
            //                 isBrushing = true;  //set isBrushing to true to keep track when hovering
            //                 d3.event.preventDefault();  //override the blue highlight
                        // })
                        // .on("mouseup", function(d){
                        //     console.log("mouseup")
            //                 console.log("up")
            //                 if(isBrushing){ //if you were just brushing, dispatch data
            //                      d3.select(path).classed("selected", true)
            //                      let dispatchString = Object.getOwnPropertyNames(dispatcher._)[0];
            //                     dispatcher.call(dispatchString, this, map.selectAll(".selected").data());
            //                 }
            // isBrushing = false; //set isBrushing to false
             //            })
                        .append("svg:title")
                        .text(function(d) { //tooltip
                            console.log(d.Population)   //debugging
                            return ["State: " + d.properties.STATENAM + "\nPopulation: " + d.Population + "\nPolice per capita: " +d.Police_per_capita + "\nTotal police expenditure: " + d.Local_police];
                        })
                        ;

                    })

                    //appending legend: following tutorial from https://www.visualcinnamon.com/2016/05/smooth-color-legend-d3-svg-gradient/
                    var defs = map.append("defs");

                    var legendScale = d3.scaleLinear()  //create a linear scale with colors chosen to match map colors using color brewer
                        .range(["#eff3ff", "#2171b5"]);

                    var linearGradient = defs.append("linearGradient")
                        .attr("id", "linear-gradient")
                        .attr("x1", "0%")
                        .attr("y1", "0%")
                        .attr("x2", "100%") //we want this scale to be moving from left to right, so x2 is the only one with 100% and the others are 0
                        .attr("y2", "0%");

                    linearGradient 
                        .selectAll("stop")
                        .data(legendScale.range())
                        .enter().append("stop")
                        .attr("offset", function (d, i) {
                            return i / (legendScale.range().length - 1);    //this increments through the linear scale
                        })
                        .attr("stop-color", function (d) {
                            return d;
                        });

                    map.append("rect")  //this appends it to the map. i want to update the positioning of this next
                    .attr("width", 300)
                    .attr("height", 20)
                    .style("fill", "url(#linear-gradient)")

        })

var brush = d3.brush()
.on("start brush", brushed)
.on("end", brushended);

// svg = d3.select("#map svg.vis-1")

console.log(map)
console.log(selector)

map.append("svg.vis-1") //matching console output for grant's svg
    .attr("class", "brush")
    .call(brush)
    .on("start brush", function () {    //debugging :(
        console.log("Brushing started");
    })
    .on("end", function () {
        console.log("Brushing ended");
    });
console.log("reached code");

function brushed() {
    const selection = d3.event.selection;
    console.log("brushend: ", selection);
    if (selection) {
        console.log("selected");
        const [[x0, y0], [x1, y1]] = selection;
        const selectedData = mergeData.filter(function(d) {
            return newEngland.includes(d.properties.STATENAM);  //filter by statename
        });
    updateSelection(selectedData);
    }
}

function brushended() {
    const selection = d3.event.selection;
    console.log("brushend: ", selection);
    if (!selection) {
        console.log('Brush deselected');
        updateSelection([]);    //clear selection
    }
}

function updateSelection(selectedData) {    //basic update selection function, will be changed to implement recoloring
    map.selectAll("path")
        .classed("selected", function(d) {
            return selectedData.some(function(selected) {
                return d.properties.STATENAM === selected.properties.STATENAM;
            });
    });

    let dispatchString = Object.getOwnPropertyNames(dispatcher._)[0];   //update dispatcher for other visualizations
    dispatcher.call(dispatchString, this, selectedData);
}

    return chart;

}

      return chart;

}