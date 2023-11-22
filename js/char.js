// Sample data - replace this with your actual data
const dataset = [ 5, 10, 15, 20, 25 ];

// Set dimensions for your chart
const svgWidth = 500, svgHeight = 300, barPadding = 5;
const barWidth = (svgWidth / dataset.length);

// Select the SVG element and set its width and height
const svg = d3.select('.chart-1')
    .attr('width', svgWidth)
    .attr('height', svgHeight);

// Bind data to rectangles (bars)
const barChart = svg.selectAll('rect')
    .data(dataset)
    .enter()
    .append('rect')
    .attr('y', d => svgHeight - d)
    .attr('height', d => d)
    .attr('width', barWidth - barPadding)
    .attr('transform', (d, i) => {
        const translate = [barWidth * i, 0]; 
        return `translate(${translate})`;
    });

// Optional: add labels to the bars
const text = svg.selectAll('text')
    .data(dataset)
    .enter()
    .append('text')
    .text(d => d)
    .attr('y', (d, i) => svgHeight - d - 2)
    .attr('x', (d, i) => barWidth * i)
    .attr('fill', '#fff');


// Add X-Axis Label
svg.append("text")             
    .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.bottom - 10) + ")")
    .style("text-anchor", "middle")
    .text("Policing");

// Add Y-Axis Label
svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Population");