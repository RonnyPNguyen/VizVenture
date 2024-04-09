var loadData = d3.csv("data/watchList.csv");
loadData
	.then(function (processData) {
		streamGraph(processData);
	})
	.catch(function (error) {
		// Handle any errors that occurred during the loading
		console.error("Error loading data:", error);
	});

function streamGraph(altcoin) {
	var svg = d3.select("#stream-graph").append("svg").attr("width", "100%");
	var svgDimension = svg.node().getBoundingClientRect();
	var width = svgDimension.width;
	var height = 600;
	svg.attr("height", "600px");

	var marginTop = 50,
		marginBottom = 50,
		marginRight = 50,
		marginLeft = 50;

	var keys = altcoin.columns.slice(1);
	var dates = Array.from(
		altcoin
			.map(function (d) {
				return d.date;
			})
			.keys()
	).sort(d3.ascending);
	var duration = dates.length;
	console.log(dates);

	// Add X axis
	var x = d3
		.scaleTime()
		.domain(d3.extend(dates))
		.range([0, width - marginLeft - marginRight]);
	svg
		.append("g")
		.attr("transform", `translate(${marginLeft}, ${height - marginBottom})`)
		.call(d3.axisBottom(x));

	// Add Y axis
	var y = d3
		.scaleLinear()
		.domain([-100, 100])
		.range([height - marginBottom - marginTop, 0]);
	svg
		.append("g")
		.attr("transform", `translate(${marginLeft}, ${marginBottom})`)
		.call(d3.axisLeft(y));
}
