import React, { Component } from 'react';
import './App.css';
import { max, sum } from 'd3-array';
import { legendColor } from 'd3-svg-legend';
import { select } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { transition } from 'd3-transition';

class BarChart extends Component {
    constructor(props){
	super(props);
	this.createBarChart = this.createBarChart.bind(this);
    };
    
    componentDidMount() {
	this.createBarChart();
    };
    
    componentDidUpdate() {
	this.createBarChart();
    };
    
    createBarChart() {
	const node = this.node;
	const dataMax = max(this.props.data.map(d => sum(d.data)));
	const barWidth = 10;
	
	const legend = legendColor()
	      .scale(this.props.colorScale)
	      .labels(["semestre 1", "semestre 2", "semestre 3", "semestre 4"]);
	
	select(node)
	    .selectAll("g.legend")
	    .data([0])
	    .enter()
	    .append("g")
            .attr("class", "legend")
            .call(legend);
	
	select(node)
	    .select("g.legend")
            .attr("transform", "translate(50, 700)");
	
	const yScale = scaleLinear()
	      .domain([0, dataMax])
	      .range([0, 250]);
	
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
            .attr("y", (d,i) => 20 + i * barWidth)
            .attr("x", d => 400 - yScale(sum(d.data)))
            .attr("width", d => yScale(sum(d.data)))
            .attr("height", barWidth)
            .style("fill", (d,i) => this.props.hoverElement === d.properties[this.props.property] ? this.props.highlightColor : this.props.colorScale(d.properties[this.props.property]))
            .style("stroke", "black")
            .style("stroke-opacity", 0.25);
	
    };
    
    render() {
	return <svg
                   ref={node => this.node = node}
                   width={900}
                   height={900}
	       />
    };
}

export default BarChart;
