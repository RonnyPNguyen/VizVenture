var data = d3.json("data/tea_trade.json");
data
	.then(function (data) {
		sankeyChart(data);
	})
	.catch(function (error) {
		// Handle any errors that occurred during the loading
		console.error("Error loading data:", error);
	});

function sankeyChart(data) {
	// Prepare the container for the sankey chart
	var svg = d3
		.select("#sankey-viz")
		.append("svg")
		.attr("width", "100%")
		.attr("height", "100%");
	var svgDimension = svg.node().getBoundingClientRect();
	var marginTop = 20,
		marginBottom = 20,
		marginLeft = 100,
		marginRight = 200;
	var width = svgDimension.width,
		height = svgDimension.height - marginTop - marginBottom,
		color = d3.scaleOrdinal([
			"#d62828",
			"#F94144",
			"#F3722C",
			"#F8961E",
			"#F9844A",
			"#F9C74F",
			"#90BE6D",
			"#43AA8B",
			"#4D908E",
			"#577590",
			"#277DA1",
			"#264653",
		]);
	// Define the sankey chart dimension, nodes and links
	var g = svg.append("g");
	var sankey = d3
		.sankey()
		.nodeAlign(d3.sankeyCenter)
		.nodeWidth(30)
		.nodePadding(20)
		.extent([
			[0, 0],
			[width * 0.8 - 100, height],
		]);
	sankey(data);
	var links = g.append("g").attr("class", "links").selectAll("path");
	var nodes = g.append("g").attr("class", "nodes").selectAll("g");

	// Define gradient colors for the links
	var gradient = g
		.append("defs")
		.selectAll("linearGradient")
		.data(data.links)
		.enter()
		.append("linearGradient")
		.attr("id", function (d, i) {
			return "gradient" + i;
		})
		.attr("gradientUnits", "userSpaceOnUse")
		.attr("x1", 0)
		.attr("y1", 0)
		.attr("x2", function (d) {
			return d.target.x0 - d.source.x1;
		})
		.attr("y2", 0);

	gradient
		.append("stop")
		.attr("offset", "0%")
		.attr("style", function (d) {
			return "stop-color:" + color(d.source.index) + ";stop-opacity:1";
		});

	gradient
		.append("stop")
		.attr("offset", "100%")
		.attr("style", function (d) {
			return "stop-color:" + color(d.target.index) + ";stop-opacity:1";
		});

	// Draw the links
	links = links
		.data(data.links)
		.enter()
		.append("path")
		.attr("class", "link")
		.attr("d", d3.sankeyLinkHorizontal())
		.attr("stroke-width", function (d) {
			return d.width;
		})
		.attr("stroke", function (d, i) {
			return "url(#gradient" + i + ")";
		});
	links.append("title").text(function (d) {
		return (
			d.source.name +
			" → " +
			d.target.name +
			": " +
			formatValue(d.value) +
			" thousand USD"
		);
	});

	function formatValue(value) {
		return value.toLocaleString(); // Format value with thousands separator
	}

	// Draw the nodes
	nodes = nodes
		.data(data.nodes)
		.enter()
		.append("g")
		.attr("transform", function (d) {
			return "translate(" + d.x0 + "," + d.y0 + ")";
		});

	nodes
		.append("rect")
		.attr("height", function (d) {
			return d.y1 - d.y0;
		})
		.attr("width", function (d) {
			return d.x1 - d.x0;
		})
		.style("fill", function (d, i) {
			return color(d.index);
		})
		.style("stroke", function (d) {
			return color(d.index); // Set the border color same as the fill color
		})
		.style("stroke-width", 0);

	// Re-position the Sankey Chart to the center
	var gDimension = g.node().getBoundingClientRect();
	g.attr(
		"transform",
		"translate(" +
			(svgDimension.width - gDimension.width) / 2 +
			"," +
			(svgDimension.height - gDimension.height) / 2 +
			")"
	);
	// Add countries name to the node
	nodes
		.append("text")
		.attr("x", function (d) {
			// Adjust x position based on the side of the node
			return d.x0 < width / 2 ? -6 : 6 + sankey.nodeWidth();
		})
		.attr("y", function (d) {
			return (d.y1 - d.y0) / 2; // Center text vertically within the node
		})
		.attr("dy", ".35em")
		.attr("text-anchor", function (d) {
			// Adjust text-anchor based on the side of the node
			return d.x0 < width / 2 ? "end" : "start";
		})
		.text(function (d) {
			return d.name;
		});

	// Define the drag behavior
	var drag = d3
		.drag()
		.on("start", dragstarted)
		.on("drag", dragged)
		.on("end", dragended);

	// Apply the drag behavior to nodes
	nodes.call(drag);

	// Drag functions
	function dragstarted(event, d) {
		d3.select(this).raise().classed("active", true);
	}

	function dragged(event, d) {
		d3.select(this).attr("transform", function () {
			d.x0 += event.dx;
			d.x1 += event.dx;
			d.y0 += event.dy;
			d.y1 += event.dy;

			return "translate(" + [d.x0, d.y0] + ")";
		});

		// Update links
		sankey.update(data);
		links.attr("d", d3.sankeyLinkHorizontal());
		gradient.attr("x2", function (d) {
			return d.target.x0 - d.source.x1;
		});
	}

	function dragended(event, d) {
		d3.select(this).classed("active", false);
	}
}
// Resize the chart after window resizing
window.addEventListener("resize", function () {
	d3.select("#sankey-viz svg").remove();
	data.then(function (data) {
		sankeyChart(data);
	});
});
