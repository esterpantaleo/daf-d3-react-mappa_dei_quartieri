import React, { Component } from 'react'
import mapboxgl from 'mapbox-gl'
import './App.css'

mapboxgl.accessToken = 'pk.eyJ1IjoiZW5qYWxvdCIsImEiOiJjaWhtdmxhNTIwb25zdHBsejk0NGdhODJhIn0.2-F2hS_oTZenAWc0BMf_uw';

class Map extends Component {
    map;

    constructor(props: Props) {
	super(props);
	this.state = {
	    hoverElement: props.hoverElement,
	    city: props.options.city,
	    property: props.property
	};
    }

    createMap() {
	this.map = new mapboxgl.Map({
            container: this.mapContainer,
            style: 'mapbox://styles/mapbox/light-v9',
            center: this.props.options.center,
            zoom: this.props.options.zoom
        });

	this.map.on('load', () => {
	    var map = this.map;
	    var props = this.props;
	    map.addSource('Quartieri', {type: 'geojson', data: props.data});
	    var layers = map.getStyle().layers;
	    // Find the index of the first symbol layer in the map style
	    this.firstSymbolId;
	    for (var i = 0; i < layers.length; i++) {
		if (layers[i].type === 'symbol') {
		    this.firstSymbolId = layers[i].id;
		    break;
		}
	    }
	    
	    map.addLayer({
		id: 'Quartieri',
		type: 'fill',
		paint: {'fill-opacity': 1},
		layout: {},
		source: 'Quartieri'
	    }, this.firstSymbolId);
	    map.setPaintProperty('Quartieri', 'fill-color', {
		property: props.property,
		stops: props.colors.stops
	    });
	    map.addLayer({
		id: 'Quartieri-hover',
		type: "fill",
		source: 'Quartieri',
		layout: {},
		paint: {"fill-color": props.colors.highlight, "fill-opacity": 1},
		filter: ["==", props.unit, props.hoverElement]
	    }, this.firstSymbolId);
	    map.addLayer({
		id: 'Quartieri-line',
		type: 'line',
		paint: {'line-opacity': 0.25},
		source: 'Quartieri'
	    }, this.firstSymbolId); 
	    map.on('mousemove', 'Quartieri', function(e) {
		map.setFilter('Quartieri-hover', ['==', props.unit, e.features[0].properties[props.unit]]);
		var features = map.queryRenderedFeatures(e.point);
		props.onHover(e.features[0]);
            });
	    map.on('mouseout', 'Quartieri', function() {
		map.setFilter('Quartieri-hover', ['==', props.unit, props.hoverElement]);
		
	    });
	});
    }

    componentDidMount() {
	this.createMap();
    };
    
    componentDidUpdate() {
	const props = this.props;
	if (props.hoverElement !== 'none') {
	    this.map.setFilter('Quartieri-hover', ['==', props.unit, props.hoverElement]);
	}
	if (props.options.city !== this.state.city || props.property !== this.state.property) {
            this.map.remove();
            this.createMap();
	    this.setState({city: props.options.city, property: props.property});
	}
    };
	    
    render() {
	return (
                <div
	            ref={el => this.mapContainer = el}
	            style={{ height: "90vh", width: "70vw" }}>
		</div>
	);
    };
}
    
export default Map;
