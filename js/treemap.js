var margin = {top: 10, right: 10, bottom: 10, left: 10},
  width = 500 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

// append the svg 
d3.select("#vis-2").html("");
const svg = d3.select("#vis-2")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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
    .padding(6)
    (root)

console.log(root.leaves())
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
      .style("fill", "#69a4b3");

  // and to add the text labels
  svg
    .selectAll("text")
    .data(root.leaves())
    .enter()
    .append("text")
      .attr("x", function(d){ return d.x0+4})   
      .attr("y", function(d){ return d.y0+20})    
      .text(function(d){ return d.data.name})
      .attr("font-size", "13px")
      .attr("fill", "white")
})
