export default [
{
    id : "quartieriMilano",
    city : "Milano",
    type : "source",
    url : "localhost:3000/Milano/NILZone.EPSG4326.json",
    center : [9.191383, 45.464211],
    zoom : 11,
    joinField : "NIL",
    default : true,
    indicators : [{
	category : "Dati Geografici",
	label : "Area (mq)",
	id : "AreaMQ",
	default: true
    }]
},{
    id : "vitalitaMilano",
    city : "Milano",
    type : "layer",
    sourceId : "quartieriMilano",
    url : "localhost:3000/Milano/results.json",
    indicators : [{
	category : "Vitalità",
	label : "Tipo di alloggi",
	id : "tipiAlloggio"
    },{
	category : "Vitalità",
	label : "Densità di occupati (per mq)",
	id : "densitaOccupati"
    }]
},{
    id : "quartieriTorino",
    city: "Torino",
    type : "source",
    url : "localhost:3000/Torino/0_geo_zone_circoscrizioni_wgs84.json",
    center : [7.6869, 45.0703],
    zoom : 10.5,
    joinField : "NCIRCO",
    indicators : [],
    default : true
},{
    id : "dataTorino",
    city : "Torino",
    type : "layer",
    sourceId : "quartieriTorino",
    url : "localhost:3000/Torino/results.json",
    indicators : [{
	category : "Vitalità",
	label : "Tipi di Alloggio",
	id : "tipiAlloggio2"
    },{
	category : "Vitalità",
	label : "Densità di occupati (per mq)",
	id : "densitaOccupati2"
    },{
	category : "Dati Geografici",
	label : "Area",
	id : "SUPERF",
	default: true
    },{
	category : "Popolazione",
	label : "Numero di residenti",
	id : "residenti"
    }]
}
]
    
