function scatterplot(data){
    
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
        .style("fill", "#FF0000");
    // Array of labels corresponding to the first six data points
    const labels = ['Connecticut', 'Maine', 'Massachusetts', 'New Hampshire', 'Rhode Island', 'Vermont'];

    // Add labels to the first six data points
    svg.append('g')
       .selectAll("text")
       .data(data.slice(0, 6)) // Take only the first six elements
       .enter()
       .append("text")
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

}

function processData(data, xKey, yKey) {
    return data.map(item => {
        return {
            x: item[xKey],
            y: item[yKey] 
        };
    });
}