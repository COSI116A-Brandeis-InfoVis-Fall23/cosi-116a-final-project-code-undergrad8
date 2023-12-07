function map(selector, data, dispatcher, dispatcher2, sharedState){

    console.log("whats up dispatcher")
    chart(selector, data, dispatcher, dispatcher2, sharedState)

}

function chart(selector, data, dispatcher, dispatcher2, sharedState) {

    console.log(dispatcher)
    dispatcher.on("selectionUpdated", function(selectedLabels) {
        console.log("map I hear");
        updateSelection(selectedLabels);
    });

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

        map.selectAll(".map-element")
            .each(function(d, i) {
                console.log("Element " + i + ":", d);
            });

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
                .append("svg:title")
                .text(function(d) { //tooltip
                    console.log(d.Population)   //debugging
                    return ["State: " + d.properties.STATENAM + "\nPopulation: " + d.Population + "\nPolice per capita: " +d.Police_per_capita + "\nTotal police expenditure: " + d.Total_police];
                });

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

    const brush = d3.brush().extent([[0,0],[width,height]])
        // .handleSize(50)
        .on('start brush',mapbrushed)
        .on('end',mapbrushended);

// svg = d3.select("#map svg.vis-1")

    console.log(map)
    console.log(selector)

    map.append("g") //matching console output for grant's svg
        .attr("class", "brush")
        .call(brush);

    console.log("reached code");

    function mapbrushed() {
        var newEngland = ["Connecticut", "Rhode Island", "Massachusetts", "Vermont", "New Hampshire", "Maine"];
        const selection = d3.event.selection;
        console.log("mapbrushed: ", selection);
        if (selection) {
            sharedState.selectedLabels.clear();
            const [[x0, y0], [x1, y1]] = selection;
            console.log("selected");
            const selectedData = mergeData.filter(function (d) {
                // const bounds = path.bounds(d);   //for topojson, not using because less useful
                const [x, y] = path.centroid(d);
                return (
                    newEngland.includes(d.properties.STATENAM) &&
                    x >= selection[0][0] && x <= selection[1][0] &&
                    y >= selection[0][1] && y <= selection[1][1]
                );
            });
            console.log(selectedData)
            selectedData.forEach(function(d){
                sharedState.selectedLabels.add(d.properties.STATENAM);
            })
            console.log("Selected labels:", sharedState.selectedLabels);
            updateSelection(sharedState.selectedLabels);
        }
        console.log('about to send dispatch notice');
        dispatcher2.call("selectionUpdated", null, sharedState.selectedLabels);
    }

    function mapbrushended() {
        const selection = d3.event.selection;
        console.log("brushend: ", selection);
        if (!selection) {   // needs to press away to deselect
            console.log('Brush deselected');
            sharedState.selectedLabels.clear();
            d3.selectAll(".map-element").classed("selected", false)
            var Per_Capitas = mergeData.map(function(d) {
                return d.Police_per_capita;
                });
            var colorScale = d3.scaleSequential(d3.interpolateBlues)    //set up your color scale
                .domain([d3.min(Per_Capitas)-.015, d3.max(Per_Capitas)+.025]);
            map.selectAll(".map-element.unselected")
                .style("fill", function(d) {
                return colorScale(d.Police_per_capita); //color them!
            })
        }
    }

    function updateSelection(selectedLabels) {    //basic update selection function, will be changed to implement recoloring
        d3.selectAll(".map-element").classed("selected", false)
        map.selectAll(".map-element").each(function(d){
            if(sharedState.selectedLabels.has(d.STATENAM)){
                d3.select(this).classed("selected", true)
            }else{
                d3.select(this).classed("unselected", true)
            }
        });
        var selectedData = mergeData.filter(function (d) {
            return sharedState.selectedLabels.has(d.properties.STATENAM);
        });

        var Per_Capitas = selectedData.map(function(d) {    //the range is based on selected data only!
            return d.Police_per_capita;
        });

        var colorScale = d3.scaleSequential(d3.interpolateBlues)    //set up your color scale
                            .domain([d3.min(Per_Capitas)-.015, d3.max(Per_Capitas)+.025]);

        map.selectAll(".map-element.unselected")
            .style("fill", "gray");
        map.selectAll(".map-element.selected")
            .style("fill", function(d) {
                return colorScale(d.Police_per_capita); //color them!
            })

        console.log(map.selectAll(".map-element.selected").data());
    }

    return chart;

}