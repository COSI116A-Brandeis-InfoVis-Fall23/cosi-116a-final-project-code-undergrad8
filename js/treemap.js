var width = window.innerWidth, 
        height = window.innerHeight;

// Assuming you're using D3 v4 based on your HTML, import CSV data and create a treemap
d3.dsv(",", "data/tree.csv", d3.autoType).then(data => {
        let root = d3.hierarchy({values: data}, d => d.values)
            .sum(d => d.expenditure)
            .sort((a, b) => b.expenditure - a.expenditure);
    
        d3.treemap()
            .size([width, height])
            .padding(1)
            (root);
    
        let svg = d3.select("#treemap").select("svg");
        let g = svg.select("#tree");
    
        g.selectAll("rect")
            .data(root.leaves())
            .enter()
            .append("rect")
            // Example attributes, modify to fit your data and visualization
            .attr("x", d => d.x0)
            .attr("y", d => d.y0)
            .attr("width", d => d.x1 - d.x0)
            .attr("height", d => d.y1 - d.y0);
    }).catch(err => {
        console.log(err);
    });
  