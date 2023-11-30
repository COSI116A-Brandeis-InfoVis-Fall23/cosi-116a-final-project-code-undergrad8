
fetch('data/21NewEngland.json')
    .then(response => response.json())
    .then(data => {
        // Now 'data' contains your JSON data
        const processedData=processData(data,'Population','Police Protection');
        console.log(processedData);
        drawScatterPlot(processedData); // Call a function to draw the scatter plot
    })
    .catch(error => console.error('Error loading JSON data:', error));
function drawScatterPlot(data) {

    // Set the dimensions and margins of the graph
    const margin = { top: 10, right: 30, bottom: 30, left: 60 },
          width = 460 - margin.left - margin.right,
          height = 400 - margin.top - margin.bottom;

    // Append the svg object to your page
    const svg = d3.select("#scatterplot")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add X axis
    const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.x)])
        .range([0, width]);
    const xAxis = d3.axisBottom(x)
      .ticks(7); // Adjust the number of ticks as needed
    
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




}

function processData(data, xKey, yKey) {
    return data.map(item => {
        return {
            x: item[xKey],
            y: parseInt(item[yKey].replace(/,/g, ''), 10) // Remove commas and convert to integer
        };
    });
}