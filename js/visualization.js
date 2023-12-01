// Immediately Invoked Function Expression to limit access to our 
// variables and prevent 
((() => {

  console.log("Hello, world!");

  d3.json("data/official_data.json", (data) => {
    const dispatchString = "selectionUpdated";

    let mapData = map()
      .selectionDispatcher(d3.dispatch(dispatchString))
      ("#map svg.vis-1", data);

  });


})());