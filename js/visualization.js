((() => {

  // Immediately Invoked Function Expression to limit access to our 
  // variables and prevent 
  var sharedState={
    selectedLabels: new Set()
  };
  var mapDispatcher = d3.dispatch("selectionUpdated");
  var scatterplotDispatcher = d3.dispatch("selectionUpdated");
  var treemapDispatcher = d3.dispatch("selectionUpdated")

  d3.json("../data/official_data.json", (error, data) => {
    if (error) {
      console.error('Error loading JSON data:', error);
      return;
    }

    const dispatchString = "selectionUpdated";
      
    map("#map", data, mapDispatcher, scatterplotDispatcher, treemapDispatcher, sharedState);
    scatterplot(data, scatterplotDispatcher, mapDispatcher, treemapDispatcher, sharedState);
    treemap(treemapDispatcher, sharedState);

  });


})());
