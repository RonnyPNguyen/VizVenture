var loadData = d3.json(".json");
loadData
	.then(function (processData) {
		drawChart(processData);
	})
	.catch(function (error) {
		// Handle any errors that occurred during the loading
		console.error("Error loading data:", error);
	});

function drawChart(data) {
	console.log(data);
}
