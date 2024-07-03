var industrySource = d3.csv("data/df1_pct_sort.csv");
var institutionGrowth = d3.csv("data/df2_growth_pct.csv");
var scrollPos = 0;
var periodSelector = "2023Q4";

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

// Add a period selector
var dropdown = document.getElementById("period-selector");
dropdown.addEventListener("change", function () {
	scrollPos = window.scrollY;
	d3.select("#pie-chart svg").remove();
	periodSelector = dropdown.value;
	industrySource
		.then((promiseData) => {
			pieChart(promiseData);
		})
		.catch((err) => {
			console.error("Error loading data:", err);
		});
});

var pieChart = function (industrySource) {
	var svg = d3.select("#pie-chart").append("svg").attr("width", "100%");
	var svgDimension = svg.node().getBoundingClientRect();
	var width = svgDimension.width,
		height = 600;
	svg.attr("height", height);
	var pie_chart = svg
		.append("g")
		.attr("transform", `translate(${width / 2},${height / 2})`);

	// unload data
	var insKey = [
		"Overseas assets",
		"Units in trusts",
		"Shares",
		"Land, buildings and equipment",
		"Deposits",
		"Others",
	];

	var sumStat = d3
		.group(industrySource, (d) => d.Period)
		.get(periodSelector)
		.map((d) => d["Total Assets"]);
	console.log(sumStat);
	var period_data = d3
		.group(industrySource, (d) => d.Period)
		.get(periodSelector)
		.map((d) => {
			let result = {};
			insKey.forEach((key) => {
				result[key] = d[key];
			});
			return result;
		});
	const color = d3
		.scaleOrdinal()
		.domain(insKey)
		.range([
			"#E76F51",
			"#F4A261",
			"#E9C46A",
			"#8AB17D",
			"#2A9D8F",
			"#287271",
			"#264653",
		]);

	// Compute the position of each group on the pie:
	const pie = d3
		.pie()
		.sort((a, b) => b[1] - a[1])
		.value((d) => d[1]);
	const pie_data = pie(Object.entries(period_data[0]));
	// The arc generator
	var radius = Math.min(height, width) / 2 - 0;
	const arc = d3
		.arc()
		.innerRadius(radius * 0.5) // This is the size of the donut hole
		.outerRadius(radius * 0.8);
	const outerArc = d3
		.arc()
		.innerRadius(radius * 0.9)
		.outerRadius(radius * 0.9);

	function wrapText(text, width) {
		text.each(function () {
			let textElement = d3.select(this),
				words = textElement.text().split(/\s+/).reverse(),
				word,
				line = [],
				lineNumber = 0,
				lineHeight = 1.1, // ems
				y = textElement.attr("y"),
				dy = 0,
				tspan = textElement
					.text(null)
					.append("tspan")
					.attr("x", 0)
					.attr("y", y)
					.attr("dy", `${dy}em`);

			while ((word = words.pop())) {
				line.push(word);
				tspan.text(line.join(" "));
				if (tspan.node().getComputedTextLength() > width) {
					line.pop(); // Remove the word that goes beyond the width
					tspan.text(line.join(" ")); // Set the text without the last word
					line = [word]; // Start a new line with the last word
					tspan = textElement
						.append("tspan")
						.attr("x", 0)
						.attr("y", 20)
						.attr("dy", 0)
						.text(word);
				}
			}
		});
	}

	// Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
	pie_chart
		.append("text")
		.attr("text-anchor", "middle")
		.attr("font-size", "20px")
		.each(function (d) {
			const text = d3.select(this);
			// First line of text
			text
				.append("tspan")
				.attr("x", 0) // Align with the text element's position
				.attr("y", "-0.25em") // Position slightly above the vertical center
				.text("Total consolidated assets");

			// Second line of text
			text
				.append("tspan")
				.attr("x", 0) // Align with the text element's position
				.attr("y", "0.25em") // Position slightly below the first line
				.attr("dy", "1em") // Additional adjustment to line height
				.text(`AUD ${d3.format(",")(d3.sum(sumStat))}b`);
		});
	pie_chart
		.selectAll("allSlices")
		.data(pie_data)
		.join("path")
		.attr("d", arc)
		.attr("fill", (d) => color(d.data[0]))
		.attr("stroke", "white")
		.style("stroke-width", "2px")
		.style("opacity", 0.7);

	// Add the polylines between chart and labels:
	pie_chart
		.selectAll("allPolylines")
		.data(pie_data)
		.join("polyline")
		.attr("stroke", "black")
		.style("fill", "none")
		.attr("stroke-width", 1)
		.attr("points", function (d) {
			const posA = arc.centroid(d); // line insertion in the slice
			const posB = outerArc.centroid(d); // line break: we use the other arc generator that has been built only for that
			const posC = outerArc.centroid(d); // Label position = almost the same as posB
			const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2; // we need the angle to see if the X position will be at the extreme right or extreme left
			posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
			return [posA, posB, posC];
		});

	// Add the polylines between chart and labels:
	pie_chart
		.selectAll("allLabels")
		.data(pie_data)
		.join("text")
		.text((d) => `${d.data[0]} ${d.data[1]}%`)
		.attr("transform", function (d) {
			const pos = outerArc.centroid(d);
			const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
			pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
			return `translate(${pos})`;
		})
		.style("text-anchor", function (d) {
			const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
			return midangle < Math.PI ? "start" : "end";
		})
		.call(wrapText, 200);
};

var lineChart = function (institutionGrowth) {
	var svg = d3.select("#line-chart").append("svg").attr("width", "100%");
	var svgDimension = svg.node().getBoundingClientRect();
	var width = svgDimension.width,
		height = 600;
	svg.attr("height", height);
	var marginTop = 30,
		marginBottom = 30,
		marginLeft = 60,
		marginRight = 60;
	// Unload data
	const period = [
		...new Set(Array.from(institutionGrowth.map((d) => d.Period))),
	];
	var sumStat = d3.group(institutionGrowth, (d) => d.Institution);
	var legendData = Array.from(sumStat).map((d) => [
		d[0],
		d[1].map((item) => item.identifier)[0],
	]);
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
		.attr("transform", `translate(${width - marginRight}, 0)`)
		.call(
			d3
				.axisRight(y)
				.tickSizeInner(-(width - marginLeft - marginRight))
				.tickSizeOuter(10)
				.tickPadding(10)
				.tickFormat((d) => d + "%")
		)
		.selectAll(".tick text") // Select all the tick text elements
		.style("text-anchor", "end") // Right-align the text by anchoring it to the end
		.attr("dx", "2em") // Adjust horizontal position relative to the tick
		.attr("dy", "0.32em"); // Adjust vertical position for vertical centering
	svg.select(".y-axis").select(".domain").remove();
	svg
		.select(".y-axis")
		.attr("font-size", "12px")
		.selectAll(".tick line")
		.attr("stroke", "#b8b8b8");
	svg
		.append("line")
		.attr("class", "zero-line")
		.attr("stroke-width", 3)
		.attr("fill", "#000000")
		.attr("x1", marginLeft)
		.attr("x2", width - marginRight)
		.attr("y1", height / 2)
		.attr("y2", height / 2)
		.attr("stroke", "#000000");

	const color = d3
		.scaleOrdinal()
		.range([
			"#E76F51",
			"#F4A261",
			"#E9C46A",
			"#8AB17D",
			"#2A9D8F",
			"#287271",
			"#264653",
		]);

	svg
		.selectAll(".line")
		.data(sumStat)
		.join("path")
		.attr("class", "trend-lines")
		.attr("id", function (d) {
			return d[1].map((item) => item.identifier)[0] + "-line";
		})
		.attr("fill", "none")
		.attr("stroke", function (d) {
			return color(d[0]);
		})
		.attr("stroke-width", 3)
		.attr("d", function (d) {
			return d3
				.line()
				.x((d) => x(d.Period))
				.y((d) => y(+d.Rate))(d[1]);
		});

	// Add legend
	var legend = svg
		.append("g")
		.attr("class", "legend")
		.attr("transform", `translate(${marginLeft}, ${marginTop * 1.5 - 5})`);

	var legendItem = legend
		.selectAll(".legend-item")
		.data(legendData)
		.enter()
		.append("g")
		.attr("class", "legend-item")
		.attr("transform", function (d, i) {
			return `translate(0, ${i * 35})`;
		})
		.attr("id", function (d) {
			return `${d[1]}-legend`;
		});
	legendItem
		.append("circle")
		.attr("cx", 5)
		.attr("cy", 5)
		.attr("r", 10)
		.attr("fill", function (d) {
			return color(d[0]);
		});

	legendItem
		.append("text")
		.attr("x", 20)
		.attr("y", 5)
		.attr("dy", "0.35em")
		.text(function (d) {
			return d[0];
		})
		.attr("font-size", "12px");
	var mouseover = function (event, d) {
		d3.selectAll(".trend-lines").style("opacity", 0.2);
		d3.selectAll(".legend-item").style("opacity", 0.2);
		let identifyKeys = d[1].map((item) => item.identifier)[0];
		svg.select(`#${identifyKeys}-legend`).style("opacity", 1);
		d3.select(this).style("opacity", 1);
	};
	var mouseoverLegend = function (event, d) {
		d3.selectAll(".trend-lines").style("opacity", 0.2);
		d3.selectAll(".legend-item").style("opacity", 0.2);
		d3.select(this).style("opacity", 1);
		svg.select(`#${d[1]}-line`).style("opacity", 1);
	};
	var mousemove = function (event, d) {};
	var mouseleave = function (event, d) {
		d3.selectAll(".trend-lines").style("opacity", 1);
		d3.selectAll(".legend-item").style("opacity", 1);
	};
	svg
		.selectAll(".trend-lines")
		.on("mouseover", mouseover)
		.on("mouseleave", mouseleave);

	svg
		.selectAll(".legend-item")
		.on("mouseover", mouseoverLegend)
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
