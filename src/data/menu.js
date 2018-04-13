export default [
{
    id : "quartieriMilano",
    city : "Milano",
    type : "source",
    url : "./data/Milano/NILZone.EPSG4326.js",
    center : [9.191383, 45.464211],
    zoom : 10.7,
    joinField : "NIL",
    indicators : [{
	category : "Dati Geografici",
	label : "Area (mq)",
	id : "AreaMQ"
    }]
},{
    id : "vitalitaMilano",
    city : "Milano",
    type : "layer",
    sourceId : "quartieriMilano",
    url : "./data/Milano/results.js",
    indicators : [{
	category : "Vitalità",
	label : "Tipo di alloggi",
	id : "tipoAlloggi"
    },{
	category : "Vitalità",
	label : "Densità di occupati (per mq)",
	id : "densitaOccupati"
    }]
},{
    id : "quartieriTorino",
    city: "Torino",
    type : "source",
    url : "./data/Torino/0_geo_zone_sezioni_censimento_wgs84.js",
    center : [7.6869, 45.0703],
    zoom : 10.5,
    joinField : "SEZCENS",
    indicators : [{
	category : "Dati Geografici",
	label : "Area",
	id : "SUPERF"
    }]
}]
    
