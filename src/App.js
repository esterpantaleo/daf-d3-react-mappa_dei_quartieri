import React, { Component } from 'react';
import './App.css';

import Map from './Map';
import BarChart from './BarChart';
import Button from './Button';
import Menu from './Menu';
import results from './data/Milano/results.js';
import resultsTorino from './data/Torino/results.js';
import geojsonMilano from './data/Milano/NILZone.EPSG4326.js';
import geojsonTorino from './data/Torino/0_geo_zone_circoscrizioni_wgs84.js';
import menu from './data/menu.js';
import { range } from 'd3-array';
import { scaleLinear } from 'd3-scale';

//set default city
var city = "Torino";

var colors = ['#FFFFDD',
              '#AAF191',
              '#80D385',
              '#61B385',
              '#3E9583',
              '#217681',
	      '#285285',
              '#1F2D86',
              '#000086'];
var geojson = getGeojson(city);

class App extends Component {
    colors = {};
        
    setDefaultLayer(city) {
	this.defaultLayer = this.menu
	    .layers
            .filter(l => l.city === city)
            .filter(l => (l.default !== undefined && l.default))[0];
	if (this.defaultLayer === undefined) {
	    console.log("Error: city " + city + " doesn't have a default layer, check the menu file and add property default to one of the indicators");
	}
    };

    setDefaultSource(city) {
	this.defaultSource = menu
            .filter(m => m.city === city)
            .filter(m => m.default !== undefined && m.default)[0];
	if (this.defaultSource === undefined) {
	    console.log("Error: city " + city + " doesn't have a default source, check the menu file and add property default to one of the sources for " + city);
	}
    };

    constructor(props) {
	super(props);

	this.setMenu(menu);
	this.setDefaultSource(city);
	this.setDefaultLayer(city);
	
	this.state = {
	    city: city,
	    layer: this.defaultLayer,
	    hover: "none"
	};

	
        this.center = this.defaultSource.center;
        this.zoom = this.defaultSource.zoom;
        this.joinField = this.defaultSource.joinField;
	
	this.setFeatures(this.state.layer);
	this.setColors(this.state.layer);
	
	this.changeCity = this.changeCity.bind(this);
	this.changeLayer = this.changeLayer.bind(this);
	this.onHoverBarChart = this.onHoverBarChart.bind(this);
	this.onHoverMap = this.onHoverMap.bind(this);
    };
    
    setMenu(menu) {
	var layers = [];
	menu.forEach(m => {
            if (m.indicators !== undefined) {
                layers = layers.concat(m.indicators.map(c => {
                    if (m.type === "source") {
                        return {
                            id: c.id,
                            label: c.label,
                            category: c.category,
                            sourceId: m.id,
                            sourceUrl: m.url,
                            city: m.city,
                            default: c.default
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
                            city: m.city,
                            default: c.default
                        };
                    }
                }))
            }
        });
	this.menu = { layers: layers, cities: layers.map(i => i.city).filter(onlyUnique) };
    };

    getListLayers() {
	var cityLayers = this.menu.layers.filter(i => i.city === this.state.city);
	var listLayers = cityLayers.map(i => i.category)
            .filter(onlyUnique)
            .map(c => {
		var subcategories = cityLayers.filter(i => i.category === c);
		return { category: c, subcategories: subcategories };
            });
	return listLayers;
    };
    
    onHoverBarChart(d) {
	this.setState({ hover: d[0] });
    };

    onHoverMap(d) {
	this.setState({ hover: d.properties[this.joinField] });
    };

    setColors(l) {
	var values = this.features.map((d) => d.properties[l.id]);
	var colorValues = getColorValues(values, colors);
        this.colors.stops = colorValues.map((d, i) => [colorValues[i], colors[i]]);
        this.colors.scale = scaleLinear().domain(colorValues).range(colors);
        this.colors.highlight = "black";
    };
    
    setFeatures(l) {
	if (this.menu.layers.filter(i => i.id === l.id)[0].layerUrl === undefined) {
	    this.features = geojson.features
		.sort((a, b) => b.properties[l.id] - a.properties[l.id]);
	} else {
	    var data = resultsJson(this.state.city);
	    this.features = geojson.features;
	    var quartieri = data.map((d) => d[this.joinField]);
	    
	    this.features.forEach((d) => {
		var index = quartieri.indexOf(d.properties[this.joinField]);
		d.properties[l.id] = data[index][l.id];
	    });
	    this.features = this.features.sort((a, b) => b.properties[l.id] - a.properties[l.id]);
	}
   };

    changeCity(d, label) {
        if (this.state.city !== label) {
            this.setState({ city: label });
        }
    };

    changeLayer(d) {
        if (this.state.layer.id !== d.id) {
            this.setState({ layer: d });
        }
    };
    
    componentWillUpdate(nextProps, nextState) {
	if (nextState.city !== this.state.city) {
	    geojson = getGeojson(nextState.city);
	    
	    this.setDefaultSource(nextState.city);
            this.center = this.defaultSource.center;
            this.zoom = this.defaultSource.zoom;
	    this.joinField = this.defaultSource.joinField;
	    
	    this.setDefaultLayer(nextState.city);
	    this.setState({ layer: this.defaultLayer });
	} else if (nextState.layer.id !== this.state.layer.id) {
	    this.setFeatures(nextState.layer);
	    this.setColors(nextState.layer);
	}
    };
        
    render() {
	var self = this;
	return (
	   
           <div className="App">
		<div className="App-header">
		    <div style={{ display: "flex", justifyContent: "space-between" }}>
		        <Menu
	                    menu={this.getListLayers(this.menu.layers)}
	                    handleClick={this.changeLayer}/> 
		        <h2>Mappa dei quartieri di {this.state.city}</h2>
                
		        <div>
		            {this.menu.cities.map(city =>
				      <Button
				       handleClick={this.changeCity}
				       label={city}/>)}
		        </div>
		    </div>
		</div>
		<div style={{ display: "flex" }}>
		        
		            <Map
	                        hoverElement={this.state.hover}
	                        onHover={this.onHoverMap}
	                        options={{
		                    city: this.state.city,
				    center: this.center,
				    zoom: this.zoom
				}} 
	                        data={{
		                    type: "FeatureCollection",
				    features: this.features
				}}
	                        layer={{
		                    id: this.state.layer.id,
				    colors: this.colors
				}}
	                        joinField={this.joinField}
		            />
		        
	                <div style={{ width: "5vw" }}>
	                    <BarChart
	                        hoverElement={this.state.hover}
	                        onHover={this.onHoverBarChart}
	                        data={{
		                    city: this.state.city,
		                    label: this.state.layer.label,
				    headers: [this.joinField, this.state.layer.id],
		                    values: this.features.map(d => [d.properties[self.joinField], d.properties[self.state.layer.id]]),
				    colors: this.colors
				}}
		            />   
	                </div>
		</div>	
            </div>
	)
    };
}

function getGeojson(city) {
    var toreturn;
    if (city === "Milano") {
        toreturn = geojsonMilano;
    } else if (city === "Torino") {
	toreturn = geojsonTorino;
    }
    return toreturn;
};

function resultsJson(city) {
    var toreturn;
    if (city === "Milano")
	toreturn = results;
    if (city === "Torino")
	toreturn = resultsTorino;
    return toreturn;
};

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
};

function getColorValues(values, colors) {
    var min = Math.min(...values),
        max = Math.max(...values);
    var C = colors.length;

    return [...Array(C).keys()]
        .map((d) => d * (max - min) / C  + min);
};

export default App;

