document.addEventListener("DOMContentLoaded", function () {
	const buttons = document.querySelectorAll("#state-selector button");
	buttons.forEach((button) => {
		button.addEventListener("click", function () {
			// Remove the selected class from all buttons
			buttons.forEach((b) => b.classList.remove("selected-button"));

			// Add the selected class to the clicked button
			this.classList.add("selected-button");

			// Call the updateSource function with the button's ID split by '-'
			// Assumes updateSource function takes the part of the ID after the hyphen
			updateSource(this.id.split("-")[0]);
		});
	});
});

var svg = d3.select("#chart01").append("svg").attr("width", "100%");
var width = svg.node().getBoundingClientRect().width;
var height = 600;
var margin = { top: 30, right: 60, bottom: 30, left: 75 };
svg.attr("height", height);

// Innitialize X-axis
var x = d3.scaleBand().range([margin.left, width - margin.right]);
var xAxis = svg
	.append("g")
	.attr("transform", `translate(0, ${height - margin.bottom})`);

// Innitialize Y-axis
var y = d3.scaleLinear().range([height - margin.bottom, margin.top]);
var yAxis = svg
	.append("g")
	.attr("transform", `translate(${margin.left}, 0)`)
	.attr("class", "myYaxis");
// Add label to X-axis
svg
	.append("text")
	.attr("class", "x-axis-label")
	.attr("x", width - margin.right / 2)
	.attr("y", height - 5)
	.attr("text-anchor", "middle")
	.attr("font-size", "14px")
	.text("(Year)");

// Add label to Y-axis
svg
	.append("text")
	.attr("class", "y-axis-label")
	.attr("transform", `translate(${margin.left / 2}, ${margin.top / 2})`)
	.attr("text-anchor", "middle")
	.attr("font-size", "14px")
	.text("(GWh)");

var updateSource = function (selectedState) {
	var energyByStateSource = d3.csv("data/byStateSource.csv");
	energyByStateSource
		.then((energy) => {
			var year = Array.from(d3.group(energy, (d) => d.Year).keys());
			var sources = d3.group(energy, (d) => d.State);
			var selectedStateData = sources.get(selectedState);
			var selectedSource = d3.group(selectedStateData, (d) => d.Sources);
			var renewable = selectedSource.get("Total renewable");
			var nonRenewable = selectedSource.get("Total non-renewable");
			var renewableData = renewable.map((d) => d["Energy Generation"]);
			var nonRenewableData = nonRenewable.map((d) => d["Energy Generation"]);
			var ylim = Math.max(
				d3.max(renewableData, (d) => +d),
				d3.max(nonRenewableData, (d) => +d)
			);

			// X-axis
			x.domain(year);
			xAxis
				.transition()
				.duration(1000)
				.call(d3.axisBottom(x).tickPadding(5))
				.selectAll("text")
				.style("font-size", "16px");
			// Y-axis
			y.domain([0, ylim * 1.05]);
			yAxis
				.transition()
				.duration(1000)
				.call(d3.axisLeft(y))
				.selectAll("text")
				.style("font-size", "14px");

			// Add the bar
			var barWidth = x.bandwidth() / 3;

			// Handle renewable bars and labels
			svg
				.selectAll(".renewable-group")
				.data(renewable, (d) => d.Year)
				.join(
					(enter) => {
						const group = enter.append("g").attr("class", "renewable-group");

						group
							.append("rect")
							.attr("class", "renewable-bar")
							.attr("x", (d) => x(d.Year) + (barWidth / 2) * 3)
							.attr("y", (d) => y(d["Energy Generation"]))
							.attr("width", barWidth)
							.attr(
								"height",
								(d) => height - margin.bottom - y(d["Energy Generation"])
							)
							.attr("fill", "#2fbf71");

						group
							.append("text")
							.attr("class", "bar-label")
							.attr("x", (d) => x(d.Year) + (barWidth / 2) * 3 + 2)
							.attr("y", (d) => y(d["Energy Generation"]) - 10)
							.attr("text-anchor", "left")
							.attr("font-size", "14px")
							.text((d) => `${d["Percentage"]}%`);

						return group;
					},
					(update) => {
						update
							.select("rect")
							.transition()
							.duration(1000)
							.attr("x", (d) => x(d.Year) + (barWidth / 2) * 3)
							.attr("y", (d) => y(d["Energy Generation"]))
							.attr("width", barWidth)
							.attr(
								"height",
								(d) => height - margin.bottom - y(d["Energy Generation"])
							);

						update
							.select(".bar-label")
							.transition()
							.duration(1000)
							.attr("x", (d) => x(d.Year) + (barWidth / 2) * 3 + 2)
							.attr("y", (d) => y(d["Energy Generation"]) - 10)
							.text((d) => `${d["Percentage"]}%`);

						return update;
					}
				);

			// Handle non-renewable bars
			svg
				.selectAll(".non-renewable-bar")
				.data(nonRenewable, (d) => d.Year)
				.join(
					(enter) =>
						enter
							.append("rect")
							.attr("class", "non-renewable-bar")
							.attr("x", (d) => x(d.Year) + barWidth / 2)
							.attr("y", (d) => y(d["Energy Generation"]))
							.attr("width", barWidth)
							.attr(
								"height",
								(d) => height - margin.bottom - y(d["Energy Generation"])
							)
							.attr("fill", "#ef2d56"),
					(update) =>
						update
							.transition()
							.duration(1000)
							.attr("x", (d) => x(d.Year) + barWidth / 2)
							.attr("y", (d) => y(d["Energy Generation"]))
							.attr("width", barWidth)
							.attr(
								"height",
								(d) => height - margin.bottom - y(d["Energy Generation"])
							)
				);
		})
		.catch(function (error) {
			console.log(error);
		});
};
updateSource("NSW");
