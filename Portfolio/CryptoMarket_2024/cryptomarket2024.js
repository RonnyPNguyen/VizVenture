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
	console.log(
		d3.extent(altcoin, function (d) {
			console.log(d.date);
		})
	);
	// Add X axis
	var x = d3
		.scaleLinear()
		.domain(
			d3.extent(altcoin, function (d) {
				return d.date;
			})
		)
		.range([0, width - marginLeft - marginRight]);
	svg
		.append("g")
		.attr("transform", `translate(${marginLeft}, ${height - marginBottom})`)
		.call(d3.axisBottom(x).ticks(5));

	// Add Y axis
	var y = d3
		.scaleLinear()
		.domain([-100, 100])
		.range([height - marginBottom - marginTop, 0]);
	svg
		.append("g")
		.attr("transform", `translate(${marginLeft}, ${marginBottom})`)
		.call(d3.axisLeft(y));

	// color palette
	var color = d3.scaleOrdinal().domain(keys).range(d3.schemecategory10);

	var stackedData = d3.stack().offset(d3.stackOffsetSilhouette).keys(keys);

	var area = d3
		.area()
		.x(function (d) {
			return x(d.altcoin.date);
		})
		.y0(function (d) {
			return y(d[0]);
		})
		.y1(function (d) {
			return y(d[1]);
		});
}
