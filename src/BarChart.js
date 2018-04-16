import React, { Component } from 'react';
import './App.css';
import { format } from 'd3-format';
import { max } from 'd3-array';
import { legendColor } from 'd3-svg-legend';
import { select } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { transition } from 'd3-transition';
import { axisBottom } from 'd3-axis';

function round(x) {
    for (var i = 0; i < 7; i++) {
	var multiplier = Math.pow(10, i);
	if (x * multiplier > 0) {
	    return Math.round(x * multiplier) / multiplier;
	}
    }
    return x;
};

class BarChart extends Component {
    yScale;
    barWidth = 7;
    
    constructor(props){
	super(props);
	this.createBarChart = this.createBarChart.bind(this);
	this.state = {
	    hoverElement: props.hoverElement,
	    data: props.data,
	    property: props.property
	};
    };

    componentDidMount() {
	this.setLabel();
	this.setYScale();
	this.setValueLabel();
	this.setLegend();
	this.createBarChart();
    };

    componentDidUpdate() {
	this.setYScale();
	this.setValueLabel();
	this.setLegend();
        this.createBarChart();
    };

    setYScale() {
	const dataMax = max(this.props.data.map(d => d.properties[this.props.property]));
	this.yScale = scaleLinear()
            .domain([0, dataMax])
            .range([0, 150]);
    };
	
    setLegend() {
	select("#defs").remove();
	select("#legend").remove();
	select(".axis").remove(); 

	var chartContainer = this.chartContainer;
	
	var legendWidth = 300,
            legendHeight = 20;
	var legendData = this.props.colors.stops,
            legendValues = legendData.map(d => d[0]),
            legendMax = Math.max(...legendValues),
            legendMin = Math.min(...legendValues);
        
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
            .attr("transform", "translate(20,680)");

        var y = scaleLinear()
            .range([legendWidth, 0])
            .domain([legendMax, legendMin]);
        var yAxis = axisBottom()
            .scale(y)
            .ticks(5);

        select(chartContainer)
            .append("g")
            .attr("class", "axis")
            .attr("transform", "translate(20,700)")
            .call(yAxis)

    };

    setDescription() {
	var index = this.props.data.map(d => d.properties[this.props.unit]).indexOf(this.props.hoverElement);
        if (index > -1) {
            select('#description')
                .text(this.props.unit + ": "  + this.props.data[index].properties[this.props.unit]);
            select("#property")
                .text(this.props.propertyLabel + ": " + round(this.props.data[index].properties[this.props.property]));
        }
    };

    setValueLabel() {
	select(".bartext").remove();
	
	const chartContainer = this.chartContainer;
	select(chartContainer)
            .append("text")
            .attr("class", "bartext")
            .attr("text-anchor", "left")
            .attr("x", 190 - this.yScale(this.props.data[0].properties[this.props.property]))
            .attr("y", 110)
            .text(round(this.props.data[0].properties[this.props.property]));
    };
	
    setLabel() {
	const chartContainer = this.chartContainer;
	
	select(chartContainer)
            .append("text")
            .attr("class", "bartitle")
            .attr("text-anchor", "left")
            .attr("x", 80)
            .attr("y", 20)
            .text(this.props.propertyLabel);
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
	    .data(this.props.data)
	    .enter()
	    .append("rect")
            .attr("class", "bar")
            .on("mouseover", this.props.onHover);
	
	select(chartContainer)
	    .selectAll("rect.bar")
	    .data(this.props.data)
	    .exit()
            .remove();
	
	select(chartContainer)
	    .selectAll("rect.bar")
	    .data(this.props.data)
            .attr("y", (d, i) => 100 + i * this.barWidth)
            .attr("x", d => 260 - this.yScale(d.properties[this.props.property]))
            .attr("width", d => this.yScale(d.properties[this.props.property]))
            .attr("height", this.barWidth)
            .style("fill", d => {
		return this.props.hoverElement === d.properties[this.props.unit] ? this.props.colors.highlight : this.props.colors.scale(d.properties[this.props.property]);
	    })
            .style("stroke", "black")
            .style("stroke-opacity", 0.25);

	this.setDescription();
    };
    
    render() {
	return <svg
                   ref={el => this.chartContainer = el}
                   width={900}
                   height={950}
	       />
    };
}

export default BarChart;
