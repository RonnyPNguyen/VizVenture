var input1 = d3.csv("data/cpiBygroup.csv");
var input2 = d3.csv("data/cliRanking.csv");
var input3 = d3.csv("data/cliIndex.csv");

input1.then(function (data) {
	lineChart(data);
});

input2.then(function (data) {
	parallelRanking(data);
});

document.addEventListener("DOMContentLoaded", function () {
	const buttons = document.querySelectorAll("#state-selector button");
	buttons.forEach((button) => {
		button.addEventListener("click", function () {
			// Remove the selected class from all buttons
			buttons.forEach((b) => b.classList.remove("selected-button"));

			// Add the selected class to the clicked button
			this.classList.add("selected-button");
			var selectedButtonID = document.querySelector(".selected-button").id;
			console.log(selectedButtonID);
			if (selectedButtonID == "ranking") {
				d3.select("#chart02 svg").remove();
				input2.then(function (data) {
					parallelRanking(data);
				});
			} else if (selectedButtonID == "index") {
				d3.select("#chart02 svg").remove();
				input3.then(function (data) {
					parallelIndex(data);
				});
			}
		});
	});
});

var lineChart = function (data) {
	var svg = d3.select("#chart01").append("svg").attr("width", "100%");
	var svgDimension = d3.select("#chart01 svg").node().getBoundingClientRect();
	var width = svgDimension.width,
		height = 600,
		margin = { top: 60, right: width * 0.15, bottom: 40, left: width * 0.15 };

	var cpiByGroup = d3.group(data, (d) => d.Period);
	var Period = Array.from(cpiByGroup.keys(), (key) => {
		return new Date(key).toISOString().slice(0, 10);
	});
	var selectedGroup = [
		"Transport",
		"Housing",
		"Food and beverages",
		"Health",
		"Education",
		"Clothing and footwear",
		"WPI",
	];
	var tickValues = [
		{ value: Period[0], alias: "Q1 2019" },
		{ value: Period[4], alias: "2020" },
		{ value: Period[8], alias: "2021" },
		{ value: Period[12], alias: "2022" },
		{ value: Period[16], alias: "2023" },
		{ value: Period[20], alias: "Q1 2024" },
	];
	svg.attr("height", height);
	var x = d3
		.scalePoint()
		.domain(Period)
		.range([margin.left, width - margin.right]);
	var y = d3
		.scaleLinear()
		.domain([95, 130])
		.range([height - margin.bottom, margin.top]);
	var colors = d3.scaleOrdinal([
		"#577590",
		"#43aa8b",
		"#90be6d",
		"#f9c74f",
		"#f8961e",
		"#f3722c",
		"#f94144",
	]);

	// Add recession periods
	var recessionPeriods = [
		// { start: "2007-12-01", end: "2009-06-01" }, // The Great Recession
		{ start: "2020-03-01", end: "2020-12-01" }, // COVID-19 Recession
	];

	recessionPeriods.forEach((period) => {
		svg
			.append("rect")
			.attr("x", x(new Date(period.start).toISOString().slice(0, 10)))
			.attr("y", margin.top)
			.attr(
				"width",
				x(new Date(period.end).toISOString().slice(0, 10)) -
					x(new Date(period.start).toISOString().slice(0, 10))
			)
			.attr("height", height - margin.top - margin.bottom)
			.attr("fill", "lightgrey")
			.attr("border", "transparent")
			.attr("opacity", 1);
	});
	// Draw the x-axis
	svg
		.append("g")
		.attr("transform", `translate(0,${height - margin.bottom})`)
		.call(
			d3
				.axisBottom(x)
				.tickValues(tickValues.map((d) => d.value))
				.tickFormat((d) => {
					var tick = tickValues.find((t) => t.value === d);
					return tick ? tick.alias : d;
				})
		)
		.attr("font-size", "14px");
	// Draw the y-axis
	svg
		.append("g")
		.attr("transform", `translate(${margin.left},0)`)
		.call(d3.axisLeft(y))
		.attr("font-size", "14px");

	svg
		.append("g")
		.attr("transform", `translate(${width - margin.right},0)`)
		.call(d3.axisRight(y).tickSize(0).tickFormat(""))
		.attr("font-size", "14px");

	svg
		.append("g")
		.attr("class", "grid")
		.attr("transform", `translate(${margin.left},0)`)
		.call(
			d3
				.axisLeft(y)
				.tickSize(-width + margin.left + margin.right)
				.tickFormat("")
		)
		.attr("stroke", "lightgrey")
		.attr("stroke-opacity", 0.3);

	// Add Y label
	svg
		.append("text")
		.attr("x", -height / 2)
		.attr("y", margin.left / 2)
		.attr("text-anchor", "middle")
		.attr("font-size", "12px")
		.attr("transform", "rotate(-90)")
		.text("Base Year Q1 2019 = 100");

	// Add title
	svg
		.append("text")
		.attr("x", width / 2)
		.attr("y", margin.top / 2)
		.attr("text-anchor", "middle")
		.attr("font-size", "14px")
		.attr("font-weight", "bold")
		.attr("alignment-baseline", "middle")
		.text("Consumer Price Index by Selected Groups");

	// Draw the line

	function wrapText(text, maxWidth) {
		var words = text.split(" ");
		var line1 = [];
		var line2 = [];
		var line3 = [];
		var lines = [line1, line2, line3];
		var currentLine = 0;

		words.forEach((word) => {
			var tempLine = lines[currentLine].concat(word).join(" ");
			var tempText = svg
				.append("text")
				.attr("font-size", "12px")
				.text(tempLine);
			var tempWidth = tempText.node().getBBox().width;
			tempText.remove();

			if (tempWidth < maxWidth) {
				lines[currentLine].push(word);
			} else {
				currentLine++;
				if (currentLine < lines.length) {
					lines[currentLine].push(word);
				}
			}
		});

		return lines.map((line) => line.join(" "));
	}

	// Draw the lines for each selected group
	selectedGroup.forEach((group, i) => {
		var line = d3
			.line()
			.x((d) => x(new Date(d.Period).toISOString().slice(0, 10)))
			.y((d) => y(+d[group]))
			.curve(d3.curveBasis); // Apply curve function here

		// Draw the line
		svg
			.append("path")
			.attr("id", "line" + i)
			.datum(data)
			.attr("fill", "none")
			.attr("stroke", colors(i))
			.attr("stroke-width", 2)
			.attr("d", line);

		// Get the last value for the group
		var lastDataPoint = data[data.length - 1];
		var lastValue = +lastDataPoint[group];

		// Wrap the text if it exceeds the max width
		var wrappedText = wrapText(group, margin.right - 20);

		// Calculate the dimensions of the box
		var boxWidth = 120;
		var boxHeight = wrappedText[2] ? 45 : wrappedText[1] ? 30 : 15;

		// Add a background box for the label
		svg
			.append("rect")
			.attr("x", width - margin.right + 5)
			.attr("y", y(lastValue) - boxHeight / 2)
			.attr("width", boxWidth)
			.attr("height", boxHeight)
			.attr("fill", "transparent")
			.attr("stroke-width", 1);

		// Add the first line of text
		svg
			.append("text")
			.attr("id", "label" + i)
			.attr("x", width - margin.right + 10)
			.attr("y", y(lastValue) - (wrappedText[2] ? 15 : wrappedText[1] ? 7 : 0))
			.attr("dy", "0.35em")
			.attr("font-size", "13px")
			.attr("fill", colors(i))
			.text(wrappedText[0]);

		// Add the second line of text if it exists
		if (wrappedText[1]) {
			svg
				.append("text")
				.attr("x", width - margin.right + 10)
				.attr("y", y(lastValue) + (wrappedText[2] ? -3 : 10))
				.attr("dy", "0.35em")
				.attr("font-size", "13px")
				.attr("fill", colors(i))
				.text(wrappedText[1]);
		}

		// Add the third line of text if it exists
		if (wrappedText[2]) {
			svg
				.append("text")
				.attr("x", width - margin.right + 10)
				.attr("y", y(lastValue) + 9)
				.attr("dy", "0.35em")
				.attr("font-size", "13px")
				.attr("fill", colors(i))
				.text(wrappedText[2]);
		}
	});
	d3.select("#line6").attr("stroke-width", "5px").attr("stroke-dasharray", "6");

	d3.select("#label0").attr("transform", "translate(0,0)");
	d3.select("#label1").attr("transform", "translate(0,-5)");
	d3.select("#label2").attr("transform", "translate(0,0)");
	d3.select("#label3").attr("transform", "translate(0,0)");
	d3.select("#label4").attr("transform", "translate(0,0)");
	d3.select("#label5").attr("transform", "translate(0,-5)");
	d3.select("#label6")
		.attr("transform", "translate(0,0)")
		.attr("font-size", "16px");
};

var parallelRanking = function (data) {
	console.table(data);
	const svg = d3.select("#chart02").append("svg").attr("width", "100%");
	var width = d3.select("#chart02 svg").node().getBoundingClientRect().width;
	var height = 600;

	var margin = { top: 120, right: 80, bottom: 60, left: 160 };

	svg
		.attr("height", height)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	var dimensions = Object.keys(data[0]).filter(function (d) {
		return d != "City";
	});

	var cities = data.map((d) => d.City);
	var color = d3
		.scaleOrdinal()
		.domain(cities)
		.range([
			"#ff595e",
			"#ff924c",
			"#ffca3a",
			"#c5ca30",
			"#8ac926",
			"#36949d",
			"#1982c4",
			"#4267ac",
			"#565aa0",
			"#6a4c93",
		]);

	// For each dimension, I build a linear scale. I store all in a y object
	var y = {};
	for (i in dimensions) {
		var name = dimensions[i];
		y[name] = d3
			.scaleLinear()
			.domain([9, 1])
			.range([height - margin.bottom, margin.top]);
	}
	x = d3
		.scalePoint()
		.range([margin.left, width - margin.right])
		.domain(dimensions);

	// The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
	function path(d) {
		return d3.line().curve(d3.curveCatmullRom.alpha(0.5))(
			dimensions.map(function (p) {
				return [x(p), y[p](d[p])];
			})
		);
	}
	// Draw the lines
	svg
		.selectAll("myPath")
		.data(data)
		.join("path")
		.attr("d", path)
		.style("fill", "none")
		.style("stroke", function (d) {
			return color(d.City);
		})
		.style("opacity", 0.6)
		.style("stroke-linecap", "round")
		.style("stroke-width", 10);

	// Draw the y axis:
	svg
		.selectAll("myAxis")
		.data(dimensions)
		.enter()
		.append("g")
		.attr("transform", function (d) {
			return "translate(" + x(d) + ")";
		})
		.each(function (d) {
			d3.select(this)
				.call(d3.axisRight().scale(y[d]).tickSize(5))
				.style("stroke-width", "2px")
				.selectAll("text")
				.style("fill", "black")
				.style("font-weight", "bold")
				.style("font-size", "14px");
		})
		.append("text")
		.style("text-anchor", "end")
		.attr("y", margin.top - 30)
		.attr("x", margin.left - 90)
		.attr("transform", "rotate(30)")
		.text(function (d) {
			return d;
		})
		.style("fill", "black")
		.style("font-size", "12px");

	// Add a city label per axis.
	var cityAxis = d3
		.scalePoint()
		.domain(cities)
		.range([margin.top, height - margin.bottom]);

	cities.forEach((city) => {
		svg
			.append("text")
			.attr("text-anchor", "end")
			.attr("x", margin.left - 20)
			.attr("y", cityAxis(city))
			.attr("fill", color(city))
			.text(city)
			.style("font-weight", "bold")
			.style("font-size", "14px")
			.attr("alignment-baseline", "middle");
	});
	// Add x-axis label
	svg
		.append("text")
		.text("Cost of Living Index Ranking")
		.attr("x", width / 2)
		.attr("y", height - 10)
		.attr("text-anchor", "middle")
		.attr("font-size", "14px");
};

var parallelIndex = function (data) {
	console.table(data);
	const svg = d3.select("#chart02").append("svg").attr("width", "100%");
	var width = d3.select("#chart02 svg").node().getBoundingClientRect().width;
	var height = 600;

	var margin = { top: 120, right: 80, bottom: 60, left: 160 };

	svg
		.attr("height", height)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	var dimensions = Object.keys(data[0]).filter(function (d) {
		return d != "City";
	});

	var cities = data.map((d) => d.City);
	var color = d3
		.scaleOrdinal()
		.domain(cities)
		.range([
			"#ff595e",
			"#ff924c",
			"#ffca3a",
			"#c5ca30",
			"#8ac926",
			"#36949d",
			"#1982c4",
			"#4267ac",
			"#565aa0",
			"#6a4c93",
		]);

	// For each dimension, I build a linear scale. I store all in a y object
	var y = {};
	for (i in dimensions) {
		var name = dimensions[i];
		y[name] = d3
			.scaleLinear()
			.domain([0, 110])
			.range([height - margin.bottom, margin.top]);
	}
	x = d3
		.scalePoint()
		.range([margin.left, width - margin.right])
		.domain(dimensions);

	// The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
	function path(d) {
		return d3.line()(
			dimensions.map(function (p) {
				return [x(p), y[p](d[p])];
			})
		);
	}
	// Draw the lines
	svg
		.selectAll("myPath")
		.data(data)
		.join("path")
		.attr("d", path)
		.style("fill", "none")
		.style("stroke", function (d) {
			return color(d.City);
		})
		.style("opacity", 0.8)
		.style("stroke-width", 3);

	// Draw the y axis:
	svg
		.selectAll("myAxis")
		.data(dimensions)
		.enter()
		.append("g")
		.attr("transform", function (d) {
			return "translate(" + x(d) + ")";
		})
		.each(function (d) {
			d3.select(this)
				.call(d3.axisRight().scale(y[d]).tickSize(5))
				.style("stroke-width", "2px")
				.selectAll("text")
				.style("fill", "black")
				.style("font-weight", "bold")
				.style("font-size", "14px");
		})
		.append("text")
		.style("text-anchor", "end")
		.attr("y", margin.top - 30)
		.attr("x", margin.left - 90)
		.attr("transform", "rotate(30)")
		.text(function (d) {
			return d;
		})
		.style("fill", "black")
		.style("font-size", "12px");

	// Add a city label per axis.
	var cityAxis = d3
		.scalePoint()
		.domain(cities)
		.range([margin.top, height - margin.bottom]);

	cities.forEach((city) => {
		svg
			.append("text")
			.attr("text-anchor", "end")
			.attr("x", margin.left - 20)
			.attr("y", cityAxis(city))
			.attr("fill", color(city))
			.text(city)
			.style("font-weight", "bold")
			.style("font-size", "14px")
			.attr("alignment-baseline", "middle");
	});
	// Add x-axis label
	svg
		.append("text")
		.text("Cost of Living Index relative to New York City = 100")
		.attr("x", width / 2)
		.attr("y", height - 10)
		.attr("text-anchor", "middle")
		.attr("font-size", "14px");
};
