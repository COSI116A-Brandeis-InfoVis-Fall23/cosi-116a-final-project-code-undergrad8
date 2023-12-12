function scatterplot(data, dispatcher, dispatcher2, dispatcher3, sharedState){
    dispatcher.on("selectionUpdated", function(selectedLabels) {
       updateAllVis(sharedState);
    });
        // Now 'data' contains your JSON data
        
        const processedData=processData(data,'Population','State_police');
        drawScatterPlot(processedData, dispatcher, dispatcher2, dispatcher3, sharedState,'scatterplot-1','Population','State Police Protection ($)'); // Call a function to draw the scatter plot
        const processedData_second=processData(data,'Average_income','Police_per_capita');
        drawScatterPlot(processedData_second,dispatcher, dispatcher2, dispatcher3, sharedState, 'scatterplot-2','Average income ($)','Police per capita');
        const processedData_third=processData(data,'State_revenue','State_police');
        drawScatterPlot(processedData_third,dispatcher, dispatcher2, dispatcher3, sharedState, 'scatterplot-3','State Revenue ($)','State Police Protection ($)');
        const processedData_forth=processData(data,'Local_revenue','Local_police');
        drawScatterPlot(processedData_forth,dispatcher, dispatcher2, dispatcher3, sharedState, 'scatterplot-4','Local Revenue ($)','Local Police Protection ($)');
    }

let scatterplots = {
        'scatterplot-1': d3.select("#scatterplot-1"),
        'scatterplot-2': d3.select("#scatterplot-2"),
        'scatterplot-3': d3.select("#scatterplot-3"),
        'scatterplot-4': d3.select("#scatterplot-4")
};

function drawScatterPlot(data, dispatcher, dispatcher2, dispatcher3, sharedState,svgId,xLabel,yLabel) {

    // Set the dimensions and margins of the graph
    const margin = { top: 10, right: 30, bottom: 30, left: 60 },
          width = 460 - margin.left - margin.right,
          height = 400 - margin.top - margin.bottom;
    //clear the previous svg content
    d3.select("#"+svgId).html("");
    // Append the svg object to your page
    const svg = d3.select("#"+svgId)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add X axis
    const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.x)])
        .range([0, width]);
    const xAxis = d3.axisBottom(x)
      .ticks(5); // Adjust the number of ticks as needed
    
    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", `translate(0, ${height})`)
      .call(xAxis)
      .selectAll("text")
      .style("font-size", "8px");   //shrink font size so that axis title can fit

    // Add Y axis
    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.y)])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y))
        .selectAll("text")
        .style("font-size", "8px"); //shrink font size so that axis title can fit

    // Add dots
    svg.append('g')
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => x(d.x))
        .attr("cy", d => y(d.y))
        .attr("r", 2.5);
    // Array of labels corresponding to the first six data points
    const labels = ['Connecticut', 'Maine', 'Massachusetts', 'New Hampshire', 'Rhode Island', 'Vermont'];
    const abbreviations = ['CT', 'ME', 'MA', 'NH', 'RI', 'VT'];
    data.forEach((d, i) => {
        d.label = labels[i]; // Assuming 'labels' array is available and matches your data
    });
    data.forEach((d, i) => {
        d.abbreviation = abbreviations[i]; // Assuming 'labels' array is available and matches your data
    });

    // Add title for x-axis
    svg.append("text")
        .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.top + 30) + ")")
        .style("text-anchor", "middle")
        .style("font-size", "13px")
        .text(xLabel);

    // Add title for y-axis
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left - 3.5)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("font-size", "13px")
        .text(yLabel);


    //add dots
    svg.append('g')
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => x(d.x))
        .attr("cy", d => y(d.y))
        .attr("r", 5)
        .style("fill", "rgb(160, 198, 255)")
        // Store the label in each circle
        .each(function(d) {
            d3.select(this).attr("data-label", d.label);
            d3.select(this).attr("data-abbreviation", d.abbreviation);
        });

    //add labels to dots
    svg.selectAll(".dot-label")
        .data(data.slice(0, 6)) // Take only the first six elements
        .enter()
        .append("text")
        .attr("class", "dot-label")
        .attr("x", d => x(d.x) + 5) // Position text right of the dot
        .attr("y", d => y(d.y) - 5) // Position text above the dot
        .text((d, i) => abbreviations[i]) // Use the index to get the corresponding label
        .attr("font-size", "10px")
        .attr("fill", "black");

    // Add title to the scatterplot
    svg.append("text")
        .attr("x", (width + margin.left + margin.right) / 2)
        .attr("y", margin.top + 10)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("text-decoration", "underline")
        .text(`${xLabel} vs ${yLabel}`);
    const brush = d3.brush().extent([[0,0],[width,height]])
        .on('start brush',brushed)
        .on('end',brushended);
    
    svg.append("g")
       .attr("class", "brush")
       .call(brush);
    function brushed() {
        const selection = d3.event.selection;
        if (selection) {
            const [[x0, y0], [x1, y1]] = selection;
            sharedState.selectedLabels.clear();
    
            svg.selectAll("circle")
                .each(function(d) {
                   const isSelected = x0 <= x(d.x) && x(d.x) <= x1 && y0 <= y(d.y) && y(d.y) <= y1;
                   if (isSelected) {
                       sharedState.selectedLabels.add(d.label);
                   }
                   d3.select(this).classed("selected", isSelected);
                })
                .filter(":not(.selected)")  // Select circles that are not part of the current selection
                .classed("unselected", true);
            
            updateAllVis(sharedState);
        }
        dispatcher.call("selectionUpdated", null, sharedState.selectedLabels);
        dispatcher2.call("selectionUpdated", null, sharedState.selectedLabels);
        dispatcher3.call("selectionUpdated", null, sharedState.selectedLabels);
    }

    function brushended() {
        const selection=d3.event.selection;
        if (!selection) {
            sharedState.selectedLabels.clear();
            svg.selectAll("circle").classed("selected", false);
            dispatcher3.call("selectionUpdated", null, sharedState.selectedLabels);
        }
    }
}

function processData(data, xKey, yKey) {
    return data.map(item => {
        return {
            x: item[xKey],
            y: item[yKey] 
        };
    });
}

function updateAllVis(sharedState){
    Object.values(scatterplots).forEach(svg => {
        svg.selectAll("circle")
            .classed("selected", d => sharedState.selectedLabels.has(d.label));
    });
    //update other graphs

}
