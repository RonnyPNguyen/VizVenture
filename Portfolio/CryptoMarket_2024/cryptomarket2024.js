var loadData = d3.json("data/watchList.json");
loadData
	.then(function (processData) {
		streamGraph(processData);
	})
	.catch(function (error) {
		// Handle any errors that occurred during the loading
		console.error("Error loading data:", error);
	});

function streamGraph(altcoin) {
	var svg = d3.select("#stream-graph").attr("width", "100%");
	var svgDimension = svg.node().getBoundingClientRect();
	var width = svgDimension.width;
	var height = 600;

	var marginTop = 50,
		marginBottom = 50,
		marginRight = 0,
		marginLeft = 0;

	const dates = [
		...new Set(Array.from(altcoin.map((d) => d.date)).sort(d3.ascending)),
	];

	var x = d3.scaleTime().domain(d3.extent(dates)).range([0, width]);

	var y = d3.scalePoint().domain([0, 5, 10000000000]).range([height, 0]);

	svg
		.append("g")
		.attr("transform", `translate(${marginLeft}, ${marginBottom})`)
		.call(d3.axisBottom(x).tickSize(-height * 0.7));
	svg
		.append("g")
		.attr("transform", `translate(${marginLeft}, ${height - marginBottom})`)
		.call(d3.axisLeft(y));
}
