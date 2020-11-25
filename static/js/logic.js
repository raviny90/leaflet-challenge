
// Define the earthquake URL
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
console.log(API_KEY);

// Create basemap
var myMap = L.map("mapid", {
    center: [37.09, -95.71],
    zoom: 5,
    // layers: [streetmap, earthquakes]
});

var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
});
var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "dark-v10",
      accessToken: API_KEY
    });

streetmap.addTo(myMap);

// Perform a request to the query URL
d3.json(queryUrl, function(data) {
    //console.log(data)
    createFeatures(data.features);
});

function createFeatures(earthquakeData) {
    // Give each feature a popup describing the place and time of the earthquake
    console.log(earthquakeData);
    function onEachfeature(features, layer) {
        layer.bindPopup("<h3>" + features.properties.place + "</h3><hr><p>" + new Date(features.properties.time) + "</p>");
    }
   
    // Create color based on magnitude
    function fillColor(mag) {
        switch (true) {
            case mag >= 5.0:
                return '#8b0000';
            case mag >= 4.0:
                return '#ff0000';
            case mag >= 3.0:
                return '#ff5349';
            case mag >= 2.0:
                return '#ffa500';
            case mag >= 1.0:
                return '#ffff00';
            case mag < 1.0:
                return '#9acd32';
        };
    };

    // Create marker size based on magnitude
    function markerSize(mag) {
        return mag * 8
    };
    L.geoJSON(earthquakeData, {
        onEachFeature: onEachfeature,
        pointToLayer: function (features, latlng) {
            var geoJSONMarker = {
                radius: markerSize(features.properties.mag),
                fillColor: fillColor(features.properties.mag),
                color: "pink",
                weight: 0.5,
                opacity: 1,
                fillOpacity: 1
            };

            return L.circleMarker(latlng, geoJSONMarker);
        },
    }).addTo(myMap);
};

// Create earthquake layer 
function createMap(earthquakes) {
    var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/streets-v11",
        accessToken: API_KEY
    });
    
    // Define a baseMaps object
    var baseMaps = {
        "Street Map": streetmap,
        "Dark Map": darkmap
    };

    // Create overlay object 
    var overlayMaps = {
        "Earthquakes": earthquakes
    };

    // Create a layer control
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: true
    }).addTo(myMap);

    // Create a legend
    var legend = L.control({ position: 'topright' });

    legend.onAdd = function () {
        var div = L.DomUtil.create('div', 'legend'),
            magnitude = [0, 1.0, 2.0, 3.0, 4.0, 5.0],
            labels = [];
        // loop through our magnitude intervals and generate a label 
        div.innerHTML ='<div><b>Earthquake <br/> Magnitude</b></div';
        for (var i = 0; i < magnitude.length; i++) {
            div.innerHTML += '<i style= "background:' + fillColor(magnitude[i]) + '"></i> ' +
            magnitude[i] + (magnitude[i + 1] ? '&ndash;' + magnitude[i + 1] + '<br>' : '+');
        }
        return div;
    };
    legend.addTo(myMap)};