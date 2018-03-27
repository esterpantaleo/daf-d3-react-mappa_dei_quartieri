import React, { Component } from 'react'
import mapboxgl from 'mapbox-gl'
import './App.css'

mapboxgl.accessToken = 'pk.eyJ1IjoiZW5qYWxvdCIsImEiOiJjaWhtdmxhNTIwb25zdHBsejk0NGdhODJhIn0.2-F2hS_oTZenAWc0BMf_uw';

class Map extends Component {
    map;

    componentDidMount() {
	this.map = new mapboxgl.Map({
            container: this.mapContainer,
            style: 'mapbox://styles/mapbox/light-v9',
            center: this.props.quartieri.center,
            zoom: this.props.quartieri.zoom
        });

	this.map.on('load', () => {
	    var map = this.map;
	    var props = this.props;
	   
	    map.addSource('Quartieri', {type: 'geojson', data: props.data});
	        var layers = map.getStyle().layers;
	        // Find the index of the first symbol layer in the map style
	        var firstSymbolId;
	        for (var i = 0; i < layers.length; i++) {
		    if (layers[i].type === 'symbol') {
		        firstSymbolId = layers[i].id;
		        break;
		    }
	        }
	    
	    map.addLayer({
		id: 'Quartieri',
		type: 'fill',
		paint: {'fill-opacity': 1},
		layout: {},
		source: 'Quartieri'
	    }, firstSymbolId);
	    map.setPaintProperty('Quartieri', 'fill-color', {
		property: props.property,
		stops: props.stops
	    });
	    map.addLayer({
		id: 'Quartieri-hover',
		type: "fill",
		source: 'Quartieri',
		layout: {},
		paint: {"fill-color": props.highlightColor, "fill-opacity": 1},
		filter: ["==", props.property, props.hoverElement]
	    }, firstSymbolId);
	    map.addLayer({
		id: 'Quartieri-line',
		type: 'line',
		paint: {'line-opacity': 0.25},
		source: 'Quartieri'
	    }, firstSymbolId); 

	    map.on('mousemove', 'Quartieri', function(e) {
		map.setFilter('Quartieri-hover', ['==', props.property, e.features[0].properties[props.property]]);
		var features = map.queryRenderedFeatures(e.point);
		props.onHover(e.features[0]);
            });
	    map.on('mouseleave', 'Quartieri', function() {
		map.setFilter('Quartieri-hover', ['==', props.property, '']);
	    });
	});
    }
    
    render() {
	return (
                <div
	            ref={el => this.mapContainer = el}
	            style={{ height: "90vh", width: "70vw" }}
		/>
	);
    }
}
    
export default Map;
