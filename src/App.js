import React, { Component } from 'react';
import './App.css';
import Map from './Map';
import BarChart from './BarChart';
import geojson from './NILZone.EPSG4326.js';
import { range } from 'd3-array';
import { scaleThreshold } from 'd3-scale';

var options = {
    city: "Milano",
    center: [9.191383, 45.464211],
    zoom: 11,
    dataIntervals: [22,44,66,88],
    colorIntervals: ["#75739F", "#5EAFC6", "#41A368", "#93C464"],
    highlightColor: '#FCBC34',
    property: 'launchday'
};

//define color scale
//color scale for mapbox
var stops = options.dataIntervals.map((d, i) => i>0 ? [options.dataIntervals[i-1], options.colorIntervals[i]] : [0, options.colorIntervals[i]]);
//color scale for d3
const colorScale = scaleThreshold().domain(options.dataIntervals).range(options.colorIntervals);

//extract features from geojson
const data = geojson.features;
//attach random data to data
data.forEach((d,i) => {
    const offset = Math.random()
    d.properties[options.property] = i
    d.data = range(87).map((p,q) => q < i ? 0 : Math.random() * 2 + offset)
});

class App extends Component {
    constructor(props){
	super(props)
	this.onHover = this.onHover.bind(this)
	this.state = { hover: "none"}
    };
        
    onHover(d) {
	this.setState({ hover: d.properties[options.property] })
    };
        
    render() {
	return (
		<div className="App">
		    <div className="App-header">
		        <h2>Mappa dei quartieri di {options.city}</h2>
		    </div>
		    <div style={{ display: "flex" }}>
		        <Map
	                    hoverElement={this.state.hover}
	                    onHover={this.onHover}
	                    stops={stops}
	                    highlightColor={options.highlightColor}
	                    data={{type: "FeatureCollection", features: data}}
	                    property={options.property}
	                    quartieri={{center: options.center, zoom: options.zoom}}
		        />
	                <div style={{ width: "25vw" }}>
	                    <BarChart
	                        hoverElement={this.state.hover}
	                        onHover={this.onHover}
	                        colorScale={colorScale}
	                        highlightColor={options.highlightColor}
	                        data={data}
	                        property={options.property}
		            />   
	                </div>        	    
		    </div>
		</div>
	)
    };
}

export default App;
