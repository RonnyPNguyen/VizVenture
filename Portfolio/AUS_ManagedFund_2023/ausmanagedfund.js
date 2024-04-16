var industrySource = d3.csv("data/df1_pct_sort.csv");
var institutionGrowth = d3.csv("data/df2_growth_pct.csv");

industrySource
	.then((promiseData) => {
		pieChart(promiseData);
	})
	.catch((err) => {
		console.error("Error loading data:", err);
	});

institutionGrowth
	.then((promiseData) => {
		lineChart(promiseData);
	})
	.catch((err) => {
		console.error("Error loading data:", err);
	});

var pieChart = function (industrySource) {
	var svg = d3.select("#pie-chart").append("svg").attr("width", "100%");
	var svgDimension = svg.node().getBoundingClientRect();
	var width = svgDimension.width,
		height = 600;
	svg.attr("height", height);
	var marginTop = 80,
		marginBottom = 80,
		marginLeft = 50,
		marginRight = 50;
};

var lineChart = function (institutionGrowth) {
	var svg = d3.select("#line-chart").append("svg").attr("width", "100%");
	var svgDimension = svg.node().getBoundingClientRect();
	var width = svgDimension.width,
		height = 600;
	svg.attr("height", height);
	var marginTop = 60,
		marginBottom = 30,
		marginLeft = 60,
		marginRight = 60;
	// Unload data
	const period = [
		...new Set(Array.from(institutionGrowth.map((d) => d.Period))),
	];
	var sumStat = d3.group(institutionGrowth, (d) => d.Institution);
	console.log(sumStat);
	// Create scales
	var x = d3
		.scalePoint()
		.domain(period)
		.range([marginLeft, width - marginRight]);

	svg
		.append("g")
		.attr("transform", `translate(0, ${height - marginBottom})`)
		.call(d3.axisBottom(x).tickSizeOuter(5))
		.attr("font-size", "14px");

	var y = d3
		.scaleLinear()
		.domain([-15.5, 15.5])
		.range([height - marginBottom, marginTop]);
	svg
		.append("g")
		.attr("class", "y-axis")
		.attr("transform", `translate(${marginLeft - 10}, 0)`)
		.call(
			d3
				.axisLeft(y)
				.tickSizeInner(-(width - marginLeft - marginRight + 20))
				.tickSizeOuter(10)
				.tickPadding(10)
		)
		.select(".domain")
		.remove();
	svg
		.select(".y-axis")
		.attr("font-size", "12px")
		.selectAll(".tick line")
		.attr("stroke", "#b8b8b8");
	svg
		.append("line")
		.attr("class", "zero-line")
		.attr("stroke-width", 2)
		.attr("fill", "#000000")
		.attr("x1", marginLeft)
		.attr("x2", width - marginRight)
		.attr("y1", height / 2)
		.attr("y2", height / 2)
		.attr("stroke", "#000000");

	const color = d3
		.scaleOrdinal()
		.range([
			"#e41a1c",
			"#377eb8",
			"#4daf4a",
			"#984ea3",
			"#ff7f00",
			"#ffff33",
			"#a65628",
			"#f781bf",
		]);

	svg
		.selectAll(".line")
		.data(sumStat)
		.join("path")
		.attr("class", "trend-lines")
		.attr("fill", "none")
		.attr("stroke", function (d) {
			return color(d[0]);
		})
		.attr("stroke-width", 2)
		.attr("d", function (d) {
			return d3
				.line()
				.x((d) => x(d.Period))
				.y((d) => y(+d.Rate))(d[1]);
		});

	var mouseover = function (event, d) {
		d3.selectAll(".trend-lines").style("opacity", 0.0);
		d3.select(this).style("opacity", 1);
	};
	var mousemove = function (event, d) {};
	var mouseleave = function (event, d) {
		d3.selectAll(".trend-lines").style("opacity", 1);
	};
	var lengend = svg
		.append("rect")
		.attr("class", "legend")
		.attr("x", marginLeft)
		.attr("y", marginTop / 2)
		.attr("width", width - marginRight - marginLeft)
		.attr("height", 40);
	svg
		.selectAll(".trend-lines")
		.on("mouseover", mouseover)
		.on("mousemove", mousemove)
		.on("mouseleave", mouseleave);
};

var scrollPos = 0;
// Resize the chart after window resizing
window.addEventListener("resize", function () {
	// Store current scroll position
	scrollPos = window.scrollY;

	// Remove previous svg
	d3.select("#pie-chart svg").remove();
	d3.select("#line-chart svg").remove();

	// Redraw chart
	industrySource.then(function (data) {
		pieChart(data);
		// Reset scroll position
		window.scrollTo(0, scrollPos);
	});
	institutionGrowth.then(function (data) {
		lineChart(data);
		// Reset scroll position
		window.scrollTo(0, scrollPos);
	});
});

// // set the dimensions and margins of the graph
// const margin = { top: 10, right: 30, bottom: 30, left: 60 },
// 	width = 460 - margin.left - margin.right,
// 	height = 400 - margin.top - margin.bottom;

// // append the svg object to the body of the page
// const svg = d3
// 	.select("#my_dataviz")
// 	.append("svg")
// 	.attr("width", width + margin.left + margin.right)
// 	.attr("height", height + margin.top + margin.bottom)
// 	.append("g")
// 	.attr("transform", `translate(${margin.left},${margin.top})`);

// //Read the data
// d3.csv(
// 	"https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/5_OneCatSevNumOrdered.csv"
// ).then(function (data) {
// 	// group the data: I want to draw one line per group
// 	const sumstat = d3.group(data, (d) => d.name); // nest function allows to group the calculation per level of a factor
// 	console.log(sumstat);
// 	// Add X axis --> it is a date format
// 	const x = d3
// 		.scaleLinear()
// 		.domain(
// 			d3.extent(data, function (d) {
// 				return d.year;
// 			})
// 		)
// 		.range([0, width]);
// 	svg
// 		.append("g")
// 		.attr("transform", `translate(0, ${height})`)
// 		.call(d3.axisBottom(x).ticks(5));

// 	// Add Y axis
// 	const y = d3
// 		.scaleLinear()
// 		.domain([
// 			0,
// 			d3.max(data, function (d) {
// 				return +d.n;
// 			}),
// 		])
// 		.range([height, 0]);
// 	svg.append("g").call(d3.axisLeft(y));

// 	// color palette
// 	const color = d3
// 		.scaleOrdinal()
// 		.range([
// 			"#e41a1c",
// 			"#377eb8",
// 			"#4daf4a",
// 			"#984ea3",
// 			"#ff7f00",
// 			"#ffff33",
// 			"#a65628",
// 			"#f781bf",
// 			"#999999",
// 		]);
// 	// Draw the line
// 	svg
// 		.selectAll(".line")
// 		.data(sumstat)
// 		.join("path")
// 		.attr("fill", "none")
// 		.attr("stroke", function (d) {
// 			return color(d[0]);
// 		})
// 		.attr("stroke-width", 1.5)
// 		.attr("d", function (d) {
// 			return d3
// 				.line()
// 				.x(function (d) {
// 					return x(d.year);
// 				})
// 				.y(function (d) {
// 					return y(+d.n);
// 				})(d[1]);
// 		});
// });
