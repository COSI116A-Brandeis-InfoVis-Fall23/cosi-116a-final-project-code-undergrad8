function scatterplot(data){
    dispatcher.on("selectionUpdated", function(selectedLabels) {
        console.log("scacterplot I hear");
       updateAllVis();
    });
        // Now 'data' contains your JSON data
        
        const processedData=processData(data,'Population','State_police');
        drawScatterPlot(processedData,'scatterplot-1','Population','State Police Protection'); // Call a function to draw the scatter plot
        const processedData_second=processData(data,'Average_income','Police_per_capita');
        drawScatterPlot(processedData_second,'scatterplot-2','Average income','Police per capita');
        const processedData_third=processData(data,'State_revenue','State_police');
        console.log(processedData_third);
        drawScatterPlot(processedData_third,'scatterplot-3','State Revenue','State Police Protection');
        const processedData_forth=processData(data,'Local_revenue','Local_police');
        console.log(processedData_forth);
        drawScatterPlot(processedData_forth,'scatterplot-4','Local Revenue','Local Police Protection');
    }
  


var scatterplots = {
        'scatterplot-1': d3.select("#scatterplot-1"),
        'scatterplot-2': d3.select("#scatterplot-2"),
        'scatterplot-3': d3.select("#scatterplot-3"),
        'scatterplot-4': d3.select("#scatterplot-4")
};

function drawScatterPlot(data,svgId,xLabel,yLabel) {

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
      .call(xAxis);

    // Add Y axis
    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.y)])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));

    // Add dots
    svg.append('g')
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => x(d.x))
        .attr("cy", d => y(d.y))
        .attr("r", 2.5)
        .style("fill", 'green');
    // Array of labels corresponding to the first six data points
    const labels = ['Connecticut', 'Maine', 'Massachusetts', 'New Hampshire', 'Rhode Island', 'Vermont'];
    data.forEach((d, i) => {
        d.label = labels[i]; // Assuming 'labels' array is available and matches your data
    });
   

    //add dots
    svg.append('g')
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => x(d.x))
    .attr("cy", d => y(d.y))
    .attr("r", 2.5)
    .style("fill", 'green')
    // Store the label in each circle
    .each(function(d) {
        d3.select(this).attr("data-label", d.label);
    });

    //add labels to dots
    svg.selectAll(".dot-label")
    .data(data.slice(0, 6)) // Take only the first six elements
    .enter()
    .append("text")
    .attr("class", "dot-label")
    .attr("x", d => x(d.x) + 5) // Position text right of the dot
    .attr("y", d => y(d.y) - 5) // Position text above the dot
    .text((d, i) => labels[i]) // Use the index to get the corresponding label
    .attr("font-size", "10px")
    .attr("fill", "black");

    // Add title to the scatterplot
    svg.append("text")
        .attr("x", (width + margin.left + margin.right) / 2)
        .attr("y", margin.top)
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
            // console.log(sharedState.selectedLabels);
            sharedState.selectedLabels.clear();
            // const selectedLabels = [];
    
            svg.selectAll("circle")
               .each(function(d) {
                   const isSelected = x0 <= x(d.x) && x(d.x) <= x1 && y0 <= y(d.y) && y(d.y) <= y1;
                   if (isSelected) {
                       //selectedLabels.push(d.label);
                       sharedState.selectedLabels.add(d.label);
                   }
                   d3.select(this).classed("selected", isSelected);
               });
            
            console.log("Selected labels:", sharedState.selectedLabels);
            // console.log("Selected labels:", selectedLabels.join(", "));
            updateAllVis();
        }
    }

    function brushended() {
        const selection=d3.event.selection;
        if (!selection) {
            console.log('dots deselected');
            sharedState.selectedLabels.clear();
            svg.selectAll("circle").classed("selected", false);
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

function updateAllVis(){
    console.log('Now update other scatterplots(about to implement updates on other vis)');
    Object.values(scatterplots).forEach(svg => {
        svg.selectAll("circle")
            .classed("selected", d => sharedState.selectedLabels.has(d.label));
    });
    //update other graphs


    
}
