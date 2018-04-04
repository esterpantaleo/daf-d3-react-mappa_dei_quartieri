import React, { Component } from 'react';
import './App.css';
import Map from './Map';
import BarChart from './BarChart';
import geojson from './data/Milano/NILZone.EPSG4326.js';
import results from './data/Milano/results.js'; 
import { range } from 'd3-array';
import { scaleLinear } from 'd3-scale';

//change options fields with a star  
var options = {
    city: "Milano",  //*
    center: [9.191383, 45.464211], //*
    zoom: 10.7, //*
    colorIntervals: ['#FFFFDD','#AAF191','#80D385','#61B385','#3E9583','#217681','#285285','#1F2D86','#000086'],
    highlightColor: 'black',
    unit: 'NIL', //* change this based on the feature in the geojson file identifying the polygon (this should match a header in results.js)
    property: 'densitaOccupati', //* change this based on which property you would like to display (from header in results.js)
    propertyLabel: 'Densità di occupati'
};

//extract features from geojson
//attach additional properties to these features from results.js (i.e. variable "results")
var features = geojson.features;
var quartieri = results.map((d) => d[options.unit]);
features.forEach((d) => {
    var index = quartieri.indexOf(d.properties[options.unit]); 
    d.properties[options.property] = results[index][options.property];
});
//sort features based on value of "options.property"
features = features.sort((a, b) => b.properties[options.property] - a.properties[options.property]);

//define color scale
var arrayProperty = results.map((d) => d[options.property]);
var minProperty = Math.min(...arrayProperty),
    maxProperty = Math.max(...arrayProperty);
var C = options.colorIntervals.length;
var intervalsProperty = [...Array(C).keys()]
    .map((d) => d * (maxProperty - minProperty) / C  + minProperty);

//color scale for mapbox             
var stops = intervalsProperty.map((d, i) => [intervalsProperty[i], options.colorIntervals[i]]);
//color scale for d3                 
const colorScale = scaleLinear().domain(intervalsProperty).range(options.colorIntervals);

class App extends Component {
    constructor(props){
	super(props)
	this.onHover = this.onHover.bind(this)
	this.state = { hover: "none"}
    };
        
    onHover(d) {
	this.setState({ hover: d.properties[options.unit] })
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
	                    unit={options.unit}
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
	                        propertyLabel={options.propertyLabel}
	                        unit={options.unit}
		            />   
	                </div>        	    
		    </div>
		</div>
	)
    };
}

export default App;
