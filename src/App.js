import React, { Component } from 'react';
import './App.css';
import Map from './Map';
import BarChart from './BarChart';
import Button from './Button';
import Menu from './Menu';
import results from './data/Milano/results.js';
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

	this.layers = this.getLayers();
	this.cities = this.getCities();
	this.colors = {
	    intervals: ['#FFFFDD',
			'#AAF191',
			'#80D385',
			'#61B385',
			'#3E9583',
			'#217681',
			'#285285',
			'#1F2D86',
			'#000086'],
	    highlight: 'black'
	};
	this.geojson = geojsonTorino;
	
	this.state = {
	    city: "Torino",
	    layer: this.getDefaultLayer("Torino"),
	    hover: "none"
	};

	this.setSource(this.state.city);
        this.setLayer(this.state.layer);
	
	this.changeCity = this.changeCity.bind(this);
	this.changeLayer = this.changeLayer.bind(this);
	this.onHover = this.onHover.bind(this);
    };

    getDefaultLayer(city) {
	if (this.layers === undefined) {
            this.layers = this.getLayers();
	}

	var cityLayers = this.layers.filter(l => l.city === city);
	var defaultLayer = cityLayers.filter(l => (l.default !== undefined && l.default))[0];
	return defaultLayer; 
    };
    
    getCities() {
	if (this.layers === undefined) {
	    this.layers = this.getLayers();
	}
	return this.layers.map(i => i.city).filter(onlyUnique);
    };
    
    getLayers() {
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
	return layers;
    };

    getMenu() {
	var cityLayers = this.layers.filter(i => i.city === this.state.city);
	var appMenu = cityLayers.map(i => i.category)
            .filter(onlyUnique)
            .map(c => {
		var subcategories = cityLayers.filter(i => i.category === c);
		return { category: c, subcategories: subcategories };
            });
	return appMenu;
    };
    
    onHover(d) {
	this.setState({ hover: d.properties[this.joinField] })
    };

    setSource(city) {
	var source =  menu.filter(m => m.city === city).filter(m => m.id === "quartieri" + city)[0];
	this.center = source.center;
        this.zoom = source.zoom;
        this.joinField = source.joinField;
    };

    setLayer(l) {
	if (this.layers.filter(i => i.id === l.id)[0].layerUrl === undefined) {
	    this.features = this.geojson
		.features
		.sort((a, b) => b.properties[l.id] - a.properties[l.id]);
	} else {
	    var data = results;
	    var joinField = this.joinField;
	    this.features = this.geojson.features;
	    var quartieri = data.map((d) => d[joinField]);
	    
	    this.features.forEach((d) => {
		var index = quartieri.indexOf(d.properties[joinField]);
		d.properties[l.id] = data[index][l.id];
	    });
	    this.features = this.features.sort((a, b) => b.properties[l.id] - a.properties[l.id]);
	}
	this.setColors(l.id);
    };

    setColors(id) {
        var values = this.features.map((d) => d.properties[id]);
	
        var min = Math.min(...values),
            max = Math.max(...values);
        var C = this.colors.intervals.length;

        var intervals = [...Array(C).keys()]
            .map((d) => d * (max - min) / C  + min);
        //color scale for mapbox
        this.colors.stops = intervals.map((d, i) => [intervals[i], this.colors.intervals[i]]);
        //color scale for d3  
        this.colors.scale = scaleLinear().domain(intervals).range(this.colors.intervals);
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
	    if (nextState.city === "Milano") {
		this.geojson = geojsonMilano;
            } else if (nextState.city === "Torino") {
                this.geojson = geojsonTorino;
            }
	    this.setSource(nextState.city);
	    this.setState({ layer: this.layers.filter(l => l.city === nextState.city).filter(l => l.label.startsWith("Area"))[0] }); 
	} else if (nextState.layer.id !== this.state.layer.id) {
	    this.setLayer(nextState.layer);
	}
    };
        
    render() {
	return (
           <div className="App">
		<div className="App-header">
		    <div style={{ display: "flex", justifyContent: "space-between" }}>
		        <Menu
	                    menu={this.getMenu(this.layers)}
	                    handleClick={this.changeLayer}/> 
		        <h2>Mappa dei quartieri di {this.state.city}</h2>
                
		        <div>
		            {this.cities.map(city =>
				      <Button
				       handleClick={this.changeCity}
				       label={city}/>)}
		        </div>
		    </div>
		</div>
		<div style={{ display: "flex" }}>
		       <Map
	                    hoverElement={this.state.hover}
	                    onHover={this.onHover}
	                    options={{city: this.state.city, center: this.center, zoom: this.zoom}} 
	                    colors={this.colors}
	                    data={{type: "FeatureCollection", features: this.features}}
	                    property={this.state.layer.id}
	                    unit={this.joinField}
		        />
	                <div style={{ width: "25vw" }}>
	                    <BarChart
	                        hoverElement={this.state.hover}
	                        onHover={this.onHover}
	                        colors={this.colors}
	                        data={this.features}
   	                        property={this.state.layer.id}
	                        propertyLabel={this.state.layer.label}
	                        unit={this.joinField}
		            />   
	                </div>
		</div>	
            </div>
	)
    };
}

export default App;

