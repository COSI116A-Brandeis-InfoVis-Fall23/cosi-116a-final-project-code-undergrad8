function treemap(dispatch3, sharedState){
  var margin = {top: 10, right: 10, bottom: 10, left: 10},
  width = 600 - margin.left - margin.right,
  height = 250 - margin.top - margin.bottom;

  // append the svg 
  d3.select("#vis-2").html("");
  var colorScale = d3.scaleSequential(d3.interpolateBlues)
    .domain([-0.1,0.6]);
  const svg = d3.select("#vis-2")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        // "translate(" + margin.left + "," + margin.top + ")");
        "translate(" + (width / 100) + "," + (height / 12) + ")"); // Center the <g> element


  // Read data
  d3.csv('data/tree.csv', function(data) {

  // stratify the data: reformatting for d3.js
  var root = d3.stratify()
    .id(function(d) { return d.name; })   
    .parentId(function(d) { return d.parent; })   
    (data);
  root.sum(function(d) { return +d.value })   

  d3.treemap()
    .size([width, height])
    .padding(3)
    (root)

  console.log(root.leaves())
  
  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  svg
    .selectAll("rect")
    .data(root.leaves())
    .enter()
    .append("rect")
      .attr('x', function (d) { return d.x0; })
      .attr('y', function (d) { return d.y0; })
      .attr('width', function (d) { return d.x1 - d.x0; })
      .attr('height', function (d) { return d.y1 - d.y0; })
      // .style("stroke", "black")
      // .style("fill", "#69a4b3");
      .style("fill", function(d) {
        return colorScale(d.data.percent);
      })
      .append("title") // tooltip
      .text(d => `${d.data.name}\nTotal police expenditure: ${d.value}`);

  // and to add the text labels
  svg
    .selectAll("text")
    .data(root.leaves())
    .enter()
    .append("text")
      .attr("x", function(d){ return d.x0+5})   
      .attr("y", function(d){ return d.y0+20})    
      .text(function(d){ return d.data.name})
      .attr("font-size", "15px")
      .attr("fill", "white")

  svg
  .selectAll("text.percentage")
  .data(root.leaves())
  .enter()
  .append("text")
    .attr("x", function(d){ return d.x0+5})    // +10 to adjust position (more right)
    .attr("y", function(d){ return d.y0+37})    // +60 to adjust position (lower)
    .text(function(d){ return (d.data.percent*100).toFixed(1) + "%" })
    .attr("font-size", "13px")
    .attr("fill", "white");
})

function updateTreemap() {
  const selectedLabels = sharedState.selectedLabels; // Access selected labels from sharedState
  if(selectedLabels.size===0){
    console.log("IF ITS EMPTY");
    svg.selectAll("rect")
     .style("fill", d => originalFillColor(d));
  }else{
  svg.selectAll("rect")
     .style("fill", d => selectedLabels.has(d.data.name) ? originalFillColor(d) : "gray");
  }
}

function originalFillColor(d){
  return colorScale(d.data.percent);
}

dispatch3.on("selectionUpdated.treemap", function(selectedLabels) {
  updateTreemap();
});

}
