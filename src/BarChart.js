import React, { Component } from 'react';
import './App.css';
import { format } from 'd3-format';
import { max } from 'd3-array';
import { legendColor } from 'd3-svg-legend';
import { select } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { transition } from 'd3-transition';

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
	select("g.legend").remove();
	
	const node = this.node;
	
	const legend = legendColor()
              .scale(this.props.colorScale)
              .labelFormat(format('.5f'));

        select(node)
            .selectAll("g.legend")
            .data([0])
            .enter()
            .append("g")
            .attr("class", "legend")
            .call(legend);
	select(node)
            .select("g.legend")
            .attr("transform", "translate(15, 330)");
    };

    setDescription() {
	var index = this.props.data.map(d => d.properties[this.props.unit]).indexOf(this.props.hoverElement);
        if (index > -1) {
            select('#' + this.props.unit)
                .text(this.props.unit + ": "  + this.props.data[index].properties[this.props.unit]);
            select("#property")
                .text(this.props.propertyLabel + ": " + round(this.props.data[index].properties[this.props.property]));
        }
    };

    setValueLabel() {
	select(".bartext").remove();
	
	const node = this.node;
	select(node)
            .append("text")
            .attr("class", "bartext")
            .attr("text-anchor", "left")
            .attr("x", 190 - this.yScale(this.props.data[0].properties[this.props.property]))
            .attr("y", 110)
            .text(round(this.props.data[0].properties[this.props.property]));
    };
	
    setLabel() {
	const node = this.node;
	
	select(node)
            .append("text")
            .attr("class", "bartitle")
            .attr("text-anchor", "left")
            .attr("x", 80)
            .attr("y", 20)
            .text(this.props.propertyLabel);
    };
    
    createBarChart() {
	const node = this.node;
	
	select(node)
	    .append("text")
	    .attr("id", this.props.unit)
	    .attr("x", 20)
	    .attr("y", 50)

	select(node)
	    .append("text")
	    .attr("id", "property")
	    .attr("x", 20)
	    .attr("y", 60 + this.barWidth * 2)

	select(node)
	    .selectAll("rect.bar")
	    .data(this.props.data)
	    .enter()
	    .append("rect")
            .attr("class", "bar")
            .on("mouseover", this.props.onHover);
	
	select(node)
	    .selectAll("rect.bar")
	    .data(this.props.data)
	    .exit()
            .remove();
	
	select(node)
	    .selectAll("rect.bar")
	    .data(this.props.data)
            .attr("y", (d,i) => 100 + i * this.barWidth)
            .attr("x", d => 260 - this.yScale(d.properties[this.props.property]))
            .attr("width", d => this.yScale(d.properties[this.props.property]))
            .attr("height", this.barWidth)
            .style("fill", d => {
		return this.props.hoverElement === d.properties[this.props.unit] ? this.props.highlightColor : this.props.colorScale(d.properties[this.props.property]);
	    })
            .style("stroke", "black")
            .style("stroke-opacity", 0.25);

	this.setDescription();
    };
    
    render() {
	return <svg
                   ref={node => this.node = node}
                   width={900}
                   height={950}
	       />
    };
}

export default BarChart;
