// Immediately Invoked Function Expression to limit access to our 
// variables and prevent 
// visualization.js
(() => {
  d3.json("data/official_data.json", (error, data) => {
      if (error) {
          console.error('Error loading JSON data:', error);
          return;
      }
      scatterplot(data);
  });
})();