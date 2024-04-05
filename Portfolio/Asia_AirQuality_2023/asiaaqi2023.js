var airquality = d3.json("data/asiaaqi2023.json");
airquality
	.then(function (data) {
		ridgeLine(data);
	})
	.catch(function (error) {
		// Handle any errors that occurred during the loading
		console.error("Error loading data:", error);
	});

function ridgeLine(airquality) {
	// Unload data
	const months = [...new Set(Array.from(airquality.map((d) => d.Month)))];
	const series = d3
		.groups(airquality, (d) => d.Country)
		.map(([name, values]) => {
			const value = new Map(values.map((d) => [d.Month, d.AQI]));
			return { name, values: months.map((d) => value.get(d)) };
		});

	// Set up color
	var countries = [...new Set(airquality.map((d) => d.Country))];
	var allMeans = [];
	for (let c in countries) {
		let key = countries[c];
		let curr = airquality.filter((s) => s.Country == key);
		let mean = d3.mean(curr.map((d) => d.AQI));
		allMeans.push(mean);
	}
	allMeans.sort((a, b) => b - a);

	// Calculate the minimum and maximum mean values
	const minMean = d3.min(allMeans);
	const maxMean = d3.max(allMeans);

	// Normalize each mean value to the range [0, 1]
	const normalizedMeans = allMeans.map((mean) => {
		return ((mean - minMean) / (maxMean - minMean)) * 100;
	});

	var color = d3
		.scaleSequential()
		.domain([0, 100])
		.interpolator(d3.interpolateCool);

	var marginTop = 30,
		marginBottom = 30,
		marginLeft = 120,
		marginRight = 120;
	var width = d3.select(".bg").node().getBoundingClientRect().width;
	var cell = 17;
	var overlap = 15;
	var height = series.length * cell;

	// Create the scales
	const x = d3
		.scalePoint()
		.domain(months)
		.range([marginLeft, width - marginRight]);

	const y = d3
		.scalePoint()
		.domain(series.map((d) => d.name))
		.range([marginTop, height - marginBottom]);
	const z = d3
		.scaleLinear()
		.domain([0, d3.max(series, (d) => d3.max(d.values))])
		.nice()
		.range([0, -overlap * y.step()]);

	// Create the area
	const area = d3
		.area()
		.curve(d3.curveBasis)
		.defined((d) => !isNaN(d))
		.x((d, i) => x(months[i]))
		.y0(0)
		.y1((d) => z(d));

	const line = area.lineY1();

	// Append the svg
	var svg = d3
		.select("#ridge-line")
		.append("svg")
		.attr("width", "100%")
		.attr("height", height);

	// Append the axes.
	// x-axis
	svg
		.append("g")
		.attr("transform", `translate(0,${height - marginBottom})`)
		.call(d3.axisBottom(x).ticks(12).tickSizeOuter(0).tickPadding(5))
		.call((g) => g.select(".domain").remove());
	// y-axis
	svg
		.append("g")
		.attr("transform", `translate(${marginLeft},0)`)
		.call(d3.axisLeft(y).tickSize(0).tickPadding(4))
		.call((g) => g.select(".domain").remove());

	// Append a layer for each series.
	const group = svg
		.append("g")
		.selectAll("g")
		.data(series)
		.join("g")
		.attr("transform", (d) => `translate(0,${y(d.name)})`);

	group
		.append("path")
		.attr("class", "area-path")
		.attr("fill", function (d) {
			let grp = d.name;
			let index = countries.indexOf(grp);
			let value = normalizedMeans[index];
			return color(value);
		}) // You can change the color as needed
		.attr("fill-opacity", 0.4) // Adjust opacity as needed
		.attr("d", (d) => area(d.values))
		.append("title") // Add tooltip
		.text(
			(d) => `Country: ${d.name}, Average AQI: ${d3.mean(d.values).toFixed(2)}`
		)
		.attr("class", "tool-tips");
	// Append lines for each series.
	group
		.append("path")
		.attr("fill", "none")
		.attr("stroke", function (d) {
			let grp = d.name;
			let index = countries.indexOf(grp);
			let value = normalizedMeans[index];
			return color(value);
		}) // You can change the color as needed
		.attr("stroke-width", 1) // Adjust stroke width as needed
		.attr("d", (d) => line(d.values));

	// Append color legend
	var color = d3
		.scaleSequential()
		.domain([0, 100])
		.interpolator(d3.interpolateCool);
	const legend = svg
		.append("g")
		.attr("class", "legend")
		.attr("transform", `translate(${width - marginRight / 1.2 + 10},${cell})`);

	// Create color gradient for legend
	const defs = legend.append("defs");
	const linearGradient = defs
		.append("linearGradient")
		.attr("id", "color-gradient")
		.attr("x1", "0%")
		.attr("y1", "100%")
		.attr("x2", "0%")
		.attr("y2", "0%");
	linearGradient
		.append("stop")
		.attr("offset", "0%")
		.attr("stop-color", color(0));
	linearGradient
		.append("stop")
		.attr("offset", "100%")
		.attr("stop-color", color(100));

	// Append color legend rectangle
	legend
		.append("rect")
		.attr("rx", 2) // horizontal radius
		.attr("ry", 2) // vertical radius
		.attr("width", marginRight / 4)
		.attr("height", height - marginBottom - cell)
		.style("fill", "url(#color-gradient)");

	var doS = height - marginBottom - cell;
	// Append color legend axis
	const legendScale = d3
		.scaleOrdinal()
		.domain([
			d3.max(allMeans).toFixed(1),
			55.4,
			35.4,
			12,
			d3.min(allMeans).toFixed(1),
		])
		.range([
			doS * ((80.3 - 9.3) / 71),
			doS * ((55.4 - 9.3) / 71),
			doS * ((35.4 - 9.3) / 71),
			doS * ((12 - 9.3) / 71),
			doS * ((9.3 - 9.3) / 71),
		]);
	const legendAxis = d3.axisRight(legendScale);
	legend
		.append("g")
		.attr("transform", `translate(${marginRight / 4} , 0)`) // Adjust position
		.call(legendAxis)
		.call((g) => g.select(".domain").remove());
}
var scrollPos = 0;

// Resize the chart after window resizing
window.addEventListener("resize", function () {
	// Store current scroll position
	scrollPos = window.scrollY;

	// Remove previous svg
	d3.select("#ridge-line svg").remove();

	// Redraw chart
	airquality.then(function (data) {
		ridgeLine(data);

		// Reset scroll position
		window.scrollTo(0, scrollPos);
	});
});
