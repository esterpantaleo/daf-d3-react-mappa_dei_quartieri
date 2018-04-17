import React, { Component } from 'react';
import './App.css';
import { format } from 'd3-format';
import { max, min } from 'd3-array';
import { legendColor } from 'd3-svg-legend';
import { select } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { transition } from 'd3-transition';
import { axisBottom } from 'd3-axis';

function round(x) {
    for (var i = 0; i < 7; i++) {
	var multiplier = Math.pow(10, i);
	if (x * multiplier > 100) {
	    return Math.round(x * multiplier) / multiplier;
	}
    }
    return x;
};

class BarChart extends Component {
    yScale;
    barWidth;
    
    constructor(props){
	super(props);
	this.state = {
	    hoverElement: props.hoverElement,
	    city: props.data.city,
	    layer: props.data.headers[1]
	};
	
	this.createBarChart = this.createBarChart.bind(this);
    };

    createChart() {
	this.setLabel();
        this.setYScale();
        this.setLegend();
        this.createBarChart();
    };
    
    componentDidMount() {
	this.createChart();
    };

    setYScale() {
	const dataMax = max(this.props.data.values.map(d => d[1]));
	this.yScale = scaleLinear()
            .domain([0, dataMax])
            .range([0, 200]);
    };
	
    setLegend() {
	select("#defs").remove();
	select("#legend").remove();
	select(".axis").remove(); 

	var chartContainer = this.chartContainer;
	
	var legendWidth = 300,
            legendHeight = 20;
	var legendData = this.props.data.colors.stops,
            legendValues = legendData.map(d => d[0]),
            legendMax = max(legendValues),
            legendMin = min(legendValues);
        
        var barLegend = select(chartContainer)
            .append("defs")
            .append("svg:linearGradient")
            .attr("id", "gradient")
            .attr("x1", "0%")
            .attr("y1", "100%")
            .attr("x2", "100%")
            .attr("y2", "100%")
            .attr("spreadMethod", "pad");

        barLegend.selectAll(".stop")
            .data(legendData)
            .enter()
            .append("stop")
            .attr("offset", (d, i) => {
                return (100 * i / (legendData.length - 1)) + "%";
            })
            .attr("stop-color", d => d[1])
            .attr("stop-opacity", 1);

        select(chartContainer)
	    .append("rect")
	    .attr("id", "legend")
            .attr("width", legendWidth)
            .attr("height", legendHeight)
            .style("fill", "url(#gradient)")
            .attr("transform", "translate(100,730)");

        var y = scaleLinear()
            .range([legendWidth, 0])
            .domain([legendMax, legendMin]);
        var yAxis = axisBottom()
            .scale(y)
            .ticks(5);

        select(chartContainer)
            .append("g")
            .attr("class", "axis")
            .attr("transform", "translate(100,760)")
            .call(yAxis)

    };

    createBarTooltip() {
	const chartContainer = this.chartContainer;

	var size = 15;
	select(chartContainer)
	    .selectAll("text.tooltip")
	    .data(this.props.data.values)
	    .enter()
	    .append("text")
	    .attr("class", "tooltip");
	select(chartContainer)
	    .selectAll("text.tooltip")
	    .data(this.props.data.values)
	    .exit()
	    .remove();
	select(chartContainer)
	    .selectAll("text.tooltip")
	    .data(this.props.data.values)
	    .attr("text-anchor", "left")
	    .attr("x", d => 300 - this.yScale(d[1]))
	    .attr("y", (d, i) => 70 + 0.4 * size + (i + 0.5) * this.barWidth)
	    .attr("color", "white")
	    .text(d => round(d[1]))
	    .style("visibility", (d, i) => {
		return (this.props.hoverElement === d[0] || (this.props.hoverElement === "none" && i === 0)) ? "visible" : "hidden";
	    })
	    .style("font-size", size);
	
	select(chartContainer)
	    .selectAll("rect.tooltip")
	    .data(this.props.data.values)
	    .enter() 
	    .append("rect")
	    .attr("class", "tooltip");
	select(chartContainer)
	    .selectAll("rect.tooltip")
	    .data(this.props.data.values)
	    .exit()
	    .remove();
	select(chartContainer)
	    .selectAll("rect.tooltip")
	    .data(this.props.data.values)   
	    .attr("x", d =>  300 - this.yScale(d[1]) - size * 0.6)
	    .attr("y",  (d, i) => 70 + (i + 0.5) * this.barWidth - 1.5/2 * size)
	    .attr("width", d => round(d[1]).toString().length * size * 0.7)
	    .attr("height", 1.5 * size)
	    .style("fill", "black")
	    .style("fill-opacity", ".3")
	    .style("stroke", "black")
	    .style("stroke-width", "1.5px")
	    .style("visibility", (d, i) => {
                return (this.props.hoverElement === d[0] || (this.props.hoverElement === "none" && i === 0)) ? "visible" : "hidden";
            });

	select(chartContainer)
	    .selectAll("line.tooltip")
	    .data(this.props.data.values)
            .enter()
            .append("line")
            .attr("class", "tooltip");
	select(chartContainer)
            .selectAll("line.tooltip")
            .data(this.props.data.values)
            .exit()
            .remove();
        select(chartContainer)
            .selectAll("line.tooltip")
            .data(this.props.data.values)
	    .attr("x1", d => 300 - this.yScale(d[1]) + round(d[1]).toString().length * size * 0.7 - size * 0.7)
            .attr("y1", (d, i) => 70 + (i + 0.5) * this.barWidth)
            .attr("x2", d => 400 - this.yScale(d[1]))
            .attr("y2", (d, i) => 70 + (i + 0.5) * this.barWidth)
	    .style("stroke", "#666")
	    .style("stroke-width", "1.5px")
	    .style("visibility", (d, i) => {
		return (this.props.hoverElement === d[0] || (this.props.hoverElement === "none" && i === 0)) ? "visible" : "hidden";
            });
    };

    setLabel() {
	select(".bartitle").remove();
	
        const chartContainer = this.chartContainer;
        select(chartContainer)
            .append("text")
            .attr("class", "bartitle")
            .attr("text-anchor", "left")
            .attr("x", 80)
            .attr("y", 20)
            .text(this.props.data.label);
    };
    
    setDescription() {
	select('#description').text("");
		
	var index = this.props.data.values.map(d => d[0]).indexOf(this.props.hoverElement);
        if (index > -1) {
            select('#description')
                .text(this.props.data.headers[0] + ": "  + this.props.data.values[index][0]);
        }
    };
    
    createBarChart() {
	const chartContainer = this.chartContainer;
	
	select(chartContainer)
	    .append("text")
	    .attr("id", "description")
	    .attr("x", 20)
	    .attr("y", 50)

	select(chartContainer)
	    .append("text")
	    .attr("id", "property")
	    .attr("x", 20)
	    .attr("y", 60 + this.barWidth * 2)

	select(chartContainer)
	    .selectAll("rect.bar")
	    .data(this.props.data.values)
	    .enter()
	    .append("rect")
            .attr("class", "bar")
            .on("mouseover", this.props.onHover);
	
	select(chartContainer)
	    .selectAll("rect.bar")
	    .data(this.props.data.values)
	    .exit()
            .remove();
	
	select(chartContainer)
	    .selectAll("rect.bar")
	    .data(this.props.data.values)
            .attr("y", (d, i) => 70 + i * this.barWidth)
            .attr("x", d => 400 - this.yScale(d[1]))
            .attr("width", d => this.yScale(d[1]))
            .attr("height", this.barWidth)
            .style("fill", d => {
		return this.props.hoverElement === d[0] ? this.props.data.colors.highlight : this.props.data.colors.scale(d[1]);
	    })
            .style("stroke", "black")
            .style("stroke-opacity", 0.25);
 
	this.setDescription();
	this.createBarTooltip();
    };
    
    render() {
	this.barWidth = Math.min(18, Math.max(950 / (this.props.data.values.length * 1.5), 7));
	console.log(this.barWidth )
	this.createChart(); 
	return <svg
                   ref={el => this.chartContainer = el}
                   width={700}
                   height={950}
	       />
    };
}

export default BarChart;
