import React, { Component } from 'react';
import './App.css';
import { format } from 'd3-format';
import { max} from 'd3-array';
import { legendColor } from 'd3-svg-legend';
import { select } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { transition } from 'd3-transition';

class BarChart extends Component {
    yScale;
    barWidth;
    
    constructor(props){
	super(props);
	this.createBarChart = this.createBarChart.bind(this);
	this.state = { hoverElement: props.hoverElement };
    };
    
    componentDidMount() {
	const node = this.node;
	
	const dataMax = max(this.props.data.map(d => d.properties[this.props.property]));
	this.barWidth = 7;
	const legend = legendColor()
	      .scale(this.props.colorScale)
              .labelFormat(format('.2f'));
	
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

	this.yScale = scaleLinear()
	    .domain([0, dataMax])
	    .range([0, 150]);

	select(node)
	    .append("text")
	    .attr("class", "bartitle")
	    .attr("text-anchor", "left")
	    .attr("x", 80)
	    .attr("y", 20)
	    .text(this.props.propertyLabel);

	select(node)
	    .append("text")
	    .attr("class", "bartext")
	    .attr("text-anchor", "middle")
	    .attr("x", 230 - this.yScale(this.props.data[0].properties[this.props.property]))
	    .attr("y", 110)
	    .text(Math.round(1000 * this.props.data[0].properties[this.props.property]) / 1000);

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

	this.createBarChart();
    };
    
    componentDidUpdate() {
	this.createBarChart();
    };
    
    createBarChart() {
	var node = this.node;
		
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
	
	var index = this.props.data.map(d => d.properties[this.props.unit]).indexOf(this.props.hoverElement);
	if (index > -1) {
	    select('#' + this.props.unit)
		.text(this.props.unit + ": "  + this.props.data[index].properties[this.props.unit]);
	    select("#property")
		.text(this.props.propertyLabel + ": " + Math.round(1000 * this.props.data[index].properties[this.props.property]) / 1000);
	}		      
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
