var industrySource = d3.json("data/industry_source.json");
var institutionGrowth = d3.json("data/institution_growth.json");

industrySource
	.then((promiseData) => {
		pieChart(promiseData);
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
	var marginTop = 80,
		marginBottom = 80,
		marginLeft = 50,
		marginRight = 50;
};
