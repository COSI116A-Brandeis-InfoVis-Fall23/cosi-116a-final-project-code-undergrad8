// Immediately Invoked Function Expression to limit access to our 
// variables and prevent 
var sharedState={
  selectedLabels: new Set()
};
((() => {

  console.log("Hello, world!");
  // console.log(sharedState.selectedLabels);
  d3.json("../data/official_data.json", (error, data) => {
    if (error) {
      console.error('Error loading JSON data:', error);
      return;
    }

    const dispatchString = "selectionUpdated";
<<<<<<< HEAD
    let mapData = map()
      .selectionDispatcher(d3.dispatch(dispatchString))
      ("#map svg.vis-1", data);
      scatterplot(data);
      treemap(d3.dispatch);
=======
    let mapData = map(data)
     //map(data);
      //.selectionDispatcher(d3.dispatch(dispatchString))
      ("#map svg.vis-1", data);
    scatterplot(data);
    treemap();
>>>>>>> e59b9e5e79b13441bba86983ab983c09f54dc0c6

    /* for when brushing and linking is fully implemented
     mapData.selectionDispatcher().on(dispatchString, function(selectedData) {
         char.updateSelection(selectedData);
         treemap.updateSelection(selectedData);
       });
    */

  });


})());
