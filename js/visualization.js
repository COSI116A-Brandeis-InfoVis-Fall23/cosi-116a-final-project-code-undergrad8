((() => {

  console.log("Hello, world!");
  // console.log(sharedState.selectedLabels);

  // Immediately Invoked Function Expression to limit access to our 
  // variables and prevent 
  var sharedState={
    selectedLabels: new Set()
  };
  var mapDispatcher = d3.dispatch("selectionUpdated");
  var scatterplotDispatcher = d3.dispatch("selectionUpdated");

  d3.json("../data/official_data.json", (error, data) => {
    if (error) {
      console.error('Error loading JSON data:', error);
      return;
    }

    const dispatchString = "selectionUpdated";

    
    // let mapData = map()
     //map(data);
      //.selectionDispatcher(d3.dispatch(dispatchString))
      
    map("#map svg.vis-1", data, mapDispatcher, scatterplotDispatcher, sharedState);
    scatterplot(data, scatterplotDispatcher, mapDispatcher, sharedState);
    
    treemap();

  });


})());
