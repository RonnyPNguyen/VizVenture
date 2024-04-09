var scrollPos = 0;
var reportInterval = "monthly";
var loadData = d3.csv("data/watchListMonthly.csv");
loadData
	.then(function (processData) {
		streamGraph(processData);
	})
	.catch(function (error) {
		// Handle any errors that occurred during the loading
		console.error("Error loading data:", error);
	});

var dropdown = document.getElementById("interval-dropdown");
dropdown.addEventListener("change", function () {
	scrollPos = window.scrollY;
	d3.select("#stream-graph svg").remove();
	reportInterval = dropdown.value;
	if (reportInterval == "yearly") {
		var data_path = "data/watchListYearly.csv";
		var yAxisDomain = [0, 4e12];
	} else if (reportInterval == "monthly") {
		var data_path = "data/watchListMonthly.csv";
		var yAxisDomain = [0, 7e11];
	} else if (reportInterval == "daily") {
		var data_path = "data/watchList.csv";
		var yAxisDomain = [0, 4e10];
	}
	var loadData = d3.csv(data_path);
	loadData
		.then(function (processData) {
			streamGraph(processData);
		})
		.catch(function (error) {
			// Handle any errors that occurred during the loading
			console.error("Error loading data:", error);
		});
	window.scrollTo(0, scrollPos);
});

function streamGraph(altcoin, yAxisDomain) {
	// Construct graph parameters
	var svg = d3.select("#stream-graph").append("svg").attr("width", "100%");
	var svgDimension = svg.node().getBoundingClientRect();
	var width = svgDimension.width;
	var height = 600;
	svg.attr("height", height);

	var marginTop = 80,
		marginBottom = 80,
		marginRight = 50,
		marginLeft = 50;

	// Process data format
	var keys = altcoin.columns.slice(1);
	var dates = altcoin.map((d) => new Date(d.date));
	var duration = dates.length;

	const color = d3.scaleOrdinal().domain(keys).range([
		"#e76f51", // Avalanche
		"#f4a261", // Dogecoin
		"#e9c46a", // Ripple
		"#2a9d8f", // Shiba Inu
		"#577590", // Solana
	]);

	// Conditioning
	if (reportInterval == "yearly") {
		var yAxisDomain = [0, 4e12];
	} else if (reportInterval == "monthly") {
		var yAxisDomain = [0, 5e11];
	} else if (reportInterval == "daily") {
		var yAxisDomain = [0, 4e10];
	}

	// Add X axis
	const x = d3
		.scaleUtc()
		.domain([new Date("2017-03-27"), new Date(dates[duration - 1])])
		.range([marginLeft, width - marginRight]);
	svg
		.append("g")
		.attr("transform", `translate(${0}, ${height - marginBottom})`)
		.call(d3.axisBottom(x).tickSize(-(height - marginBottom - marginTop)))
		.select(".domain")
		.remove();
	svg.selectAll(".tick line").attr("stroke", "#b8b8b8");
	// Add Y axis
	var y = d3
		.scaleLinear()
		.domain(yAxisDomain)
		.range([height / 2, 0]);
	svg
		.append("g")
		.attr("transform", `translate(${marginLeft}, ${marginBottom})`)
		.call(d3.axisLeft(y).tickValues([]))
		.select(".domain")
		.remove();

	// Draw the chart
	var stackedData = d3.stack().offset(d3.stackOffsetSilhouette).keys(keys)(
		altcoin
	);
	svg
		.selectAll("mylayers")
		.data(stackedData)
		.enter()
		.append("path")
		.style("fill", function (d) {
			return color(d.key);
		})
		.attr(
			"d",
			d3
				.area()
				.x(function (d, i) {
					var xdate = new Date(d.data.date);
					return x(xdate);
				})
				.y0(function (d) {
					return y(d[0]);
				})
				.y1(function (d) {
					return y(d[1]);
				})
		);
}

// Resize the chart after window resizing
window.addEventListener("resize", function () {
	// Store current scroll position
	scrollPos = window.scrollY;

	// Remove previous svg
	d3.select("#stream-graph svg").remove();

	// Redraw chart
	loadData.then(function (data) {
		streamGraph(data);

		// Reset scroll position
		window.scrollTo(0, scrollPos);
	});
});
