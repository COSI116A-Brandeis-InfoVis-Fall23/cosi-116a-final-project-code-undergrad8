function map(selector, data, dispatcher, dispatcher2, dispatcher3, sharedState){

    chart(selector, data, dispatcher, dispatcher2, dispatcher3, sharedState);

}

function chart(selector, data, dispatcher, dispatcher2, dispatcher3, sharedState) {

    dispatcher.on("selectionUpdated", function(selectedLabels) {
        updateSelection(selectedLabels);
    });

    let width = window.innerWidth,  //scale + center map
        height = window.innerHeight;

    let projection = d3.geoAlbersUsa()
        .scale(1900)    //resize so it can focus in on new england
        .translate([width/500, height/2])
        .precision(.1);

    let map = d3.select(selector)
        .append("svg")
        .classed("vis-1", true);

    let path = d3.geoPath() //set path
        .projection(projection);

    let mergeData;

    d3.json("../data/states.json", function(error, topologies) {
        let state = topojson.feature(topologies[12], topologies[12].objects.stdin); //use topologies[12] so that the geodata is from 1910, not 1790 lol
        let newEngland = ["Connecticut", "Rhode Island", "Massachusetts", "Vermont", "New Hampshire", "Maine"];
        let newEnglandData = state.features.filter(function(state) {    //filter the states to focus the map on new england
            return newEngland.includes(state.properties.STATENAM);    //STATENAM is the property in the JSON which we need to match
            });
        map.selectAll("path")
            .data(newEnglandData)   //use the newEngland states only
            .enter()
            .append("path")
            .attr("d", path)
            .attr("class", "map-element");

        d3.json("../data/official_data.json", function(error) {  //nested: join state_local data file to geo data

            d3.select("#map svg.vis-1").html();

            mergeData = newEnglandData.map(function(newEnglandState) {
                let censusState = data.find(function(localCensus) {
                    return localCensus.STATENAM === newEnglandState.properties.STATENAM; //compare the STATENAM property from the geo new england data and the census data
                });

                return Object.assign({}, newEnglandState, censusState); //assign properties of censusState to newEnglandState
                });

            colorScale = color(mergeData);   //range based on mergeData
        
            map.selectAll("path") //create new paths SVG selection 
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
                    return [d.properties.STATENAM + "\nPopulation: " + d.Population + "\nPolice per capita: " +d.Police_per_capita + "\nTotal police expenditure: " + d.Total_police];
                });

        })

            //appending legend: following tutorial from https://www.visualcinnamon.com/2016/05/smooth-color-legend-d3-svg-gradient/
            let defs = map.append("defs");

            let legendScale = d3.scaleLinear()  //create a linear scale with colors chosen to match map colors using color brewer
                .range(["#eff3ff", "#2171b5"]);

            let linearGradient = defs.append("linearGradient")
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
            .attr("width", 250)
            .attr("height", 20)
            .style("fill", "url(#linear-gradient)")
            .attr("transform", "translate(480, 275)");

            map.append("text")
                .text("Police expenditure per capita, 2021")
                .attr("x", 470) // Adjust the x-coordinate to center the label based on the width of the rect
                .attr("y", 270);

    })

    const brush = d3.brush().extent([[0,0],[width,height]])
        .on('start brush',mapbrushed)
        .on('end',mapbrushended);

    map.append("g") //matching console output for grant's svg
        .attr("class", "brush")
        .call(brush);

    function mapbrushed() {
        let newEngland = ["Connecticut", "Rhode Island", "Massachusetts", "Vermont", "New Hampshire", "Maine"];
        const selection = d3.event.selection;
        if (selection) {
            sharedState.selectedLabels.clear();
            const [[x0, y0], [x1, y1]] = selection;
            const selectedData = mergeData.filter(function (d) {
                const [x, y] = path.centroid(d);    //grabs center of state: otherwise requires highlighting entire state
                return (
                    newEngland.includes(d.properties.STATENAM) &&
                    x >= selection[0][0] && x <= selection[1][0] &&
                    y >= selection[0][1] && y <= selection[1][1]
                );
            });
            selectedData.forEach(function(d){
                sharedState.selectedLabels.add(d.properties.STATENAM);
            });
            updateSelection(sharedState.selectedLabels);
        }
        dispatcher2.call("selectionUpdated", null, sharedState.selectedLabels);
        dispatcher3.call("selectionUpdated", null, sharedState.selectedLabels);
    }

    function mapbrushended() {
        const selection = d3.event.selection;
        if (!selection) {   // needs to press away to deselect
            sharedState.selectedLabels.clear();
            d3.selectAll(".map-element").classed("selected", false);
            colorScale = color(mergeData);   //range based on mergeData
            map.selectAll(".map-element.unselected")
                .style("fill", function(d) {
                return colorScale(d.Police_per_capita); //color them!
            });
        };
    }

    function updateSelection(selectedLabels) {    //basic update selection function, will be changed to implement recoloring
        d3.selectAll(".map-element").classed("selected", false);
        map.selectAll(".map-element").each(function(d){
            if(sharedState.selectedLabels.has(d.STATENAM)){
                d3.select(this).classed("selected", true);
            }else{
                d3.select(this).classed("unselected", true);
            };
        });
        let selectedData = mergeData.filter(function (d) {
            return sharedState.selectedLabels.has(d.properties.STATENAM);
        });

        if (selectedLabels.size===0){   //if there was just a brushend
            colorScale = color(mergeData);
            map.selectAll(".map-element.unselected")
                .style("fill", function(d) {
                    return colorScale(d.Police_per_capita); //color them with the original color scale
                });
        } else{
        colorScale = color(selectedData);    //range based on selectedData
        map.selectAll(".map-element.unselected")
            .style("fill", "gray");
        map.selectAll(".map-element.selected")
            .style("fill", function(d) {
                return colorScale(d.Police_per_capita); //color them!
            });
        };
    }

    function color(thisData){
        let perCapitas = thisData.map(function(d) {   //range based on whichever data is passed in
            return d.Police_per_capita;
            });

        let colorScale = d3.scaleSequential(d3.interpolateBlues)    //set up your color scale
            .domain([d3.min(perCapitas)-.015, d3.max(perCapitas)+.025]);

        return colorScale;
    };

    return chart;

}