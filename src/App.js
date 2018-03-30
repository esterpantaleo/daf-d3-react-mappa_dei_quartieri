import React, { Component } from 'react';
import './App.css';
import Map from './Map';
import BarChart from './BarChart';
import geojson from './NILZone.EPSG4326.js';
import data from './results.js';
import { range } from 'd3-array';
import { scaleLinear } from 'd3-scale';

var colorIntervals = ["#FFFFDD","#AAF191","#80D385","#61B385","#3E9583","#217681","#285285","#1F2D86","#000086"];
var C = colorIntervals.length;
var dataMin = 2.5, dataMax = 3.8;
var dataIntervals = [...Array(C).keys()];
dataIntervals = dataIntervals.map((d) => d * (dataMax-dataMin) / C  + dataMin);

var options = {
    city: "Milano",
    center: [9.191383, 45.464211],
    zoom: 10.7,
    dataIntervals: dataIntervals, 
    colorIntervals: ["#FFFFDD","#AAF191","#80D385","#61B385","#3E9583","#217681","#285285","#1F2D86","#000086"],
    highlightColor: 'black',
    id: 'NIL',
    property: 'tipiAlloggio'
};

//define color scale
//color scale for mapbox
var stops = options.dataIntervals.map((d, i) => [options.dataIntervals[i],options.colorIntervals[i]]);

//color scale for d3
const colorScale = scaleLinear().domain(options.dataIntervals).range(options.colorIntervals);

//extract features from geojson
var features = geojson.features;

var quartieri = data.map((d) => d[options.id]);

features.forEach((d) => {
    var index = quartieri.indexOf(d.properties[options.id]); 
    d.properties[options.property] = data[index][options.property];
});

features = features.sort((a,b) => b.properties[options.property]-a.properties[options.property]);

class App extends Component {
    constructor(props){
	super(props)
	this.onHover = this.onHover.bind(this)
	this.state = { hover: "none"}
    };
        
    onHover(d) {
	this.setState({ hover: d.properties[options.id] })
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
	                    data={{type: "FeatureCollection", features: features}}
	                    property={options.property}
	                    id={options.id}
	                    quartieri={{center: options.center, zoom: options.zoom}}
		        />
	                <div style={{ width: "25vw" }}>
	                    <BarChart
	                        hoverElement={this.state.hover}
	                        onHover={this.onHover}
	                        colorScale={colorScale}
	                        highlightColor={options.highlightColor}
	                        data={features}
   	                        property={options.property}
	                        id={options.id}
		            />   
	                </div>        	    
		    </div>
		</div>
	)
    };
}

export default App;
