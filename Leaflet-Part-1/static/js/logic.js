var queryUrl= "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl).then(function (data) {
  console.log(data);
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

function markerSize(magnitude) {
  return magnitude * 2000;
}

function chooseColor(depth) {
  switch (true) {
    case depth > 90:
      return "red";
    case depth > 70:
      return "orangered";
    case depth > 50:
      return "orange";
    case depth > 30:
      return "gold";
    case depth > 10:
      return "yellow";
    default:
      return "lightgreen";
  }
}

function createFeatures(earthquakeData) {
  // Define a function that we want to run once for each feature in the features array
  // Give each feature a popup that describes the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>Location: ${feature.properties.place}</h3><hr><p>Date: ${new Date(feature.properties.time)}</p><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]}</p>`);
  }

  // Create a GeoJSON layer that contains the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    // Point to layer used to alter markers
    pointToLayer: function(feature, latlng) {
      // Determine the style of markers based on properties
      var markers = {
        radius: markerSize(feature.properties.mag),
        fillColor: chooseColor(feature.geometry.coordinates[2]),
        fillOpacity: 0.8,
        color: "black",
        stroke: true,
        weight: 0.5
      };
      return L.circle(latlng, markers);
    }
  });

  // Send our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {
  // Define OpenStreetMap tile layer
  var grayscale = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: "© <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
  });

  // Create a baseMaps object
  var baseMaps = {
    "Grayscale Map": grayscale
  };

  // Create an overlay object to hold our overlay
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 5,
    layers: [grayscale, earthquakes]
  });

   // Add legend
   var legend = L.control({ position: "bottomright" });
   legend.onAdd = function() {
     var div = L.DomUtil.create("div", "info legend"),
         depth = [-10, 10, 30, 50, 70, 90];
 
     div.innerHTML += "<h3 style='text-align: center'>Depth</h3>";
 
     for (var i = 0; i < depth.length; i++) {
       div.innerHTML +=
         '<i style="background:' + chooseColor(depth[i] + 1) + '"></i> ' +
         depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
     }
     return div;
   };
   
  legend.addTo(myMap);

  // Create a layer control
  // Pass it our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
}

