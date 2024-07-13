const input1 = d3.csv("data/home_ownership_rates.csv");
var clickedState = "Australia";
input1.then(function (data) {
	lineplot(data, "Australia");
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
			// Match cases
			switch (selectedButtonID) {
				case "AUS-button":
					clickedState = "Australia";
					break;
				case "NSW-button":
					clickedState = "New South Wales";
					break;
				case "VIC-button":
					clickedState = "Victoria";
					break;
				case "QLD-button":
					clickedState = "Queensland";
					break;
				case "WA-button":
					clickedState = "Western Australia";
					break;
				case "SA-button":
					clickedState = "South Australia";
					break;
				case "TAS-button":
					clickedState = "Tasmania";
					break;
				case "ACT-button":
					clickedState = "Australian Capital Territory";
					break;
				case "NT-button":
					clickedState = "Northern Territory";
					break;
			}
			d3.select("#chart01").selectAll("svg").remove();
			input1.then(function (data) {
				lineplot(data, clickedState);
			});
		});
	});
});

function lineplot(data, clickedState) {
	var svg = d3.select("#chart01").append("svg").attr("width", "100%");
	var height = 800;
	var width = d3.select("#chart01 svg").node().getBoundingClientRect().width;
	var margin = { top: 20, right: 120, bottom: 60, left: 120 };
	svg.attr("width", width).attr("height", height);

	// import data
	var ageGroup = Array.from(new Set(data.map((d) => d.age_group)));
	var birthYears = Array.from(new Set(data.map((d) => d.birth_year)));
	var generations = Array.from(new Set(data.map((d) => d.generation)));

	var byState = d3.group(data, (d) => d.state);
	var selectedState = d3.group(byState.get(clickedState), (d) => d.birth_year);

	// set domain
	var x = d3
		.scalePoint()
		.domain(ageGroup)
		.range([margin.left, width - margin.right]);
	var y = d3
		.scaleLinear()
		.domain([20, 85])
		.range([height - margin.bottom, margin.top]);
	var genColors = d3.scaleOrdinal().domain(generations).range([
		"#f61067", //red
		"#5e239d", //purple
		"#1b998b", //green
	]);

	svg
		.append("g")
		.attr("transform", `translate(${0},${height - margin.bottom})`)
		.call(d3.axisBottom(x))
		.attr("font-size", "12px");
	svg
		.append("g")
		.attr("transform", `translate(${margin.left - 20},0)`)
		.call(d3.axisLeft(y))
		.attr("font-size", "12px");
	// Add X axis label:
	svg
		.append("text")
		.attr("text-anchor", "middle")
		.attr("x", width / 2)
		.attr("y", height - margin.bottom / 2)
		.attr("dy", "1em")
		.text("Age Group")
		.attr("font-size", "12px");
	// Y axis label:
	svg
		.append("text")
		.attr("text-anchor", "middle")
		.attr("transform", "rotate(-90)")
		.attr("x", -height / 2)
		.attr("y", margin.left / 2)
		.attr("dy", "-1em")
		.text("Home Ownership Rate (%)")
		.attr("font-size", "12px");
	selectedState.forEach((d, i) => {
		svg
			.append("g")
			.selectAll("dot")
			.data(d)
			.enter()
			.append("circle")
			.attr("cx", (d) => x(d.age_group))
			.attr("cy", (d) => y(d.ownership_rate))
			.style("fill", (d) => genColors(d.generation))
			.attr("r", 5);

		// Draw the line
		var line = d3
			.line()
			.x((d) => x(d.age_group))
			.y((d) => y(d.ownership_rate));
		svg
			.append("path")
			.datum(d)
			.attr("d", line)
			.attr("stroke-width", 2)
			.attr("stroke", genColors(d[0].generation))
			.attr("fill", "none");
		// Add text label of i
		var len = d.length;
		var text = svg
			.append("text")
			.attr("x", x(d[len - 1].age_group) + 10)
			.attr("y", y(d[len - 1].ownership_rate))
			.attr("dy", "0.4em")
			.attr("text-anchor", "left")
			.attr("font-size", "12px")
			.text(`Born ${d[0].birth_year}`);
	});

	// Add legend
	var legend = svg
		.append("g")
		.attr("class", "legend")
		.attr("transform", `translate(${width - 200},${height - 200})`);

	// Add legend items
	generations.forEach((generation, index) => {
		var legendRow = legend
			.append("g")
			.attr("transform", `translate(0, ${index * 20})`);

		legendRow
			.append("rect")
			.attr("width", 10)
			.attr("height", 10)
			.attr("fill", genColors(generation));

		legendRow
			.append("text")
			.attr("x", 20)
			.attr("y", 10)
			.attr("text-anchor", "start")
			.style("text-transform", "capitalize")
			.text(generation);
	});
}
