import React, { Component } from 'react';
import './App.css';
import Map from './Map';
import BarChart from './BarChart';
import Button from './Button';
import Menu from './Menu';
import geojsonMilano from './data/Milano/NILZone.EPSG4326.js';
import geojsonTorino from './data/Torino/0_geo_zone_sezioni_censimento_wgs84.js';
import menu from './data/menu.js';
import { range } from 'd3-array';
import { scaleLinear } from 'd3-scale';

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

class App extends Component {
    constructor(props) {
	super(props);
	this.onHover = this.onHover.bind(this);
	this.indicators = this.getIndicators(menu);
	this.cities = this.indicators.map(i => i.city).filter(onlyUnique);
	this.state = {
	    city: "Torino",
	    hover: "none",
	};
	this.handleClick = this.handleClick.bind(this);
	this.highlightColor = 'black';
	this.colorIntervals = ['#FFFFDD','#AAF191','#80D385','#61B385','#3E9583','#217681','#285285','#1F2D86','#000086'];
	this.initializeMap();
    };

    getIndicators(menu) {
	var indicators = [];
	
	menu.forEach(m => {
            if (m.indicators !== undefined) {
		indicators = indicators.concat(m.indicators.map(c => {
                    if (m.type === "source") {
			return {
                            id: c.id,
                            label: c.label,
			    category: c.category,
                            sourceId: m.id,
                            sourceUrl: m.url,
                            city: m.city
			};
                    } else if (m.type === "layer") {
			var sourceUrl = menu.filter(d => d.id === m.sourceId)[0].url;
			return {
                            id: c.id,
                            label: c.label,
                            category: c.category,
                            layerId: m.id,
                            layerUrl: m.url,
                            sourceId : m.sourceId,
                            sourceUrl: sourceUrl,
                            city: m.city
			};
                    }
		}))
	    }
	});
	return indicators;
    };

    getCityCategories() {
	var cityIndicators = this.indicators.filter(i => i.city === this.state.city);
	return cityIndicators.map(i => i.category)
            .filter(onlyUnique)
            .map(c => {
		var subcategories = cityIndicators.filter(i => i.category === c);
		return { category: c, subcategories: subcategories };
            });
    };
    
    onHover(d) {
	this.setState({ hover: d.properties[this.joinField] })
    };

    initializeMap() {
	var item =  menu.filter(m => m.city === this.state.city).filter(m => m.id === "quartieri" + this.state.city)[0];
	this.center = item.center;
	this.zoom = item.zoom;
	this.joinField = item.joinField;

	this.property = item.indicators.filter(i => (i.label ==="Area" || i.label === "Area (mq)"))[0].id;
	this.propertyLabel = "Area";

	var geojson;
	if (this.state.city === "Milano") {
	    geojson = geojsonMilano;
	} else if (this.state.city === "Torino") {
	    geojson = geojsonTorino;
	}
	//extract features from geojson                             
	//attach additional properties to these features from results.js (i.e. variable "results")                                                      
	var property = this.property;
	this.features = geojson.features
	    .sort((a, b) => b.properties[property] - a.properties[property]);
	//define color scale  
	var arrayProperty = geojson.features.map((d) => d.properties[property]);
	var minProperty = Math.min(...arrayProperty),
	    maxProperty = Math.max(...arrayProperty);
	var C = this.colorIntervals.length;
	var intervalsProperty = [...Array(C).keys()]
	    .map((d) => d * (maxProperty - minProperty) / C  + minProperty);
	
	//color scale for mapbox                                          
	this.stops = intervalsProperty.map((d, i) => [intervalsProperty[i], this.colorIntervals[i]]);
	//color scale for d3                                            
	this.colorScale = scaleLinear().domain(intervalsProperty).range(this.colorIntervals);
    };
    
    handleClick(d, label) {
	if (this.state.city !== label) {
	    this.setState({ city: label });
	}
    };
/*
    componentDidUpdate() {
	this.initializeMap();
    };
  */  
    render() {
	this.initializeMap();
	return (
		<div className="App">
		<div className="App-header">
		    <div style={{ display: "flex", justifyContent: "space-between" }}>
		        <Menu menu={this.getCityCategories(this.indicators)}/> 
		        <h2>Mappa dei quartieri di {this.state.city}</h2>
                
		        <div>
		            {this.cities.map(city =>
				      <Button
				       handleClick={this.handleClick}
				       label={city}/>)}
		        </div>
		    </div>
		</div>
		    
		<div style={{ display: "flex" }}>
		        <Map
                            city={this.state.city}	                    
	                    hoverElement={this.state.hover}
	                    onHover={this.onHover}
	                    stops={this.stops}
	                    highlightColor={this.highlightColor}
	                    data={{type: "FeatureCollection", features: this.features}}
	                    property={this.property}
	                    unit={this.joinField}
	                    quartieri={{center: this.center, zoom: this.zoom}}
		        />
	                <div style={{ width: "25vw" }}>
	                    <BarChart
	                        hoverElement={this.state.hover}
	                        onHover={this.onHover}
	                        colorScale={this.colorScale}
	                        highlightColor={this.highlightColor}
	                        data={this.features}
   	                        property={this.property}
	                        propertyLabel={this.propertyLabel}
	                        unit={this.joinField}
		            />   
	                </div>        	    
		    </div>
		</div>
	)
    };
}

export default App;

