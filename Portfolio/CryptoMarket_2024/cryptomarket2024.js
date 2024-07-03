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

	var marginTop = 40,
		marginBottom = 80,
		marginRight = 50,
		marginLeft = 50;

	// Process data format
	var keys = altcoin.columns.slice(1);
	var dates = altcoin.map((d) => new Date(d.date));
	var duration = dates.length;

	// Sumstat
	var marketCap = {
		bitcoin: 1375728580463.2524,
		ethereum: 430639202176.3594,
		binancecoin: 89155437215.42749,
		solana: 84838706571.2534,
		ripple: 34676270602.72719,
		cardano: 23425863356.52765,
		"avalanche-2": 21077240258.155663,
		polkadot: 13028996507.219675,
		chainlink: 11739367402.991226,
		tron: 10591107950.99413,
		dogecoin: 26140142029.04529,
	};

	var tickerAbb = {
		bitcoin: "BTC",
		ethereum: "ETH",
		binancecoin: "BNB",
		solana: "SOL",
		ripple: "XRP",
		cardano: "ADA",
		"avalanche-2": "AVAX",
		polkadot: "DOT",
		chainlink: "LINK",
		tron: "TRX",
		dogecoin: "DOGE",
	};

	// Add color scale
	const color = d3.scaleOrdinal().domain(keys).range([
		"#577590", // Solana
		"#e9c46a", // Ripple
		"#f4a261", // Dogecoin
		"#e76f51", // Avalanche
		"#2a9d8f", // Shiba Inu
	]);

	// Conditioning
	if (reportInterval == "yearly") {
		var yAxisDomain = [0, 1e13];
	} else if (reportInterval == "monthly") {
		var yAxisDomain = [0, 2e12];
	} else if (reportInterval == "daily") {
		var yAxisDomain = [0, 8e10];
	}

	// Add X axis
	const x = d3
		.scaleUtc()
		.domain([new Date("2017-03-27"), new Date(dates[duration - 1])])
		.range([marginLeft, width - marginRight]);
	svg
		.append("g")
		.attr("transform", `translate(${0}, ${height - marginBottom})`)
		.call(
			d3
				.axisBottom(x)
				.tickSize(-(height - marginBottom - marginTop))
				.tickPadding([40])
		)
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
	// Add tool tips
	var Tooltip = svg
		.append("text")
		.attr("x", marginLeft)
		.attr("y", marginTop - 10)
		.style("opacity", 0)
		.style("font-size", 16);
	// Add 3 hover effect
	var mouseover = function (d) {
		Tooltip.style("opacity", 1);
		d3.selectAll(".myArea").style("opacity", 0.2);
		d3.select(this).style("stroke", "black").style("opacity", 1);
	};
	var mousemove = function (i, d) {
		var tickerName = d.key;
		Tooltip.text(
			`${tickerName} (${tickerAbb[tickerName]}) - market cap: $${(
				marketCap[tickerName] / 1e9
			)
				.toFixed(1)
				.toLocaleString()} trillion`
		);
	};
	var mouseleave = function (d) {
		Tooltip.style("opacity", 0);
		d3.selectAll(".myArea").style("opacity", 1).style("stroke", "none");
	};

	svg
		.selectAll("mylayers")
		.data(stackedData)
		.enter()
		.append("path")
		.attr("class", "myArea")
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
		)
		.on("mouseover", mouseover)
		.on("mousemove", mousemove)
		.on("mouseleave", mouseleave);
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
