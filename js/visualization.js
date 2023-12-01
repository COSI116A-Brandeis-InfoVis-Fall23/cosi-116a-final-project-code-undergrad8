// Immediately Invoked Function Expression to limit access to our 
// variables and prevent 
((() => {

  console.log("Hello, world!");

  d3.json("data/official_data.json", (error,data) => {
    if (error) {
      console.error('Error loading JSON data:', error);
      return;
  }

    const dispatchString = "selectionUpdated";
    let dispatch = d3.dispatch(dispatchString);
      map().selectionDispatcher(dispatch)("#map svg.vis-1");
      scatterplot(data, dispatch);
  });


})());
