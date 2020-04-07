$(document).ready(function() {

	// Intialize the map as the variable "map"
	// This also hides the + / - zoom controls.
	const map = L.map("mapdiv", { zoomControl: false });

	// Set starting center point, zoom level, and tileset:
	var mapCenter = $("#coords").text();
	var coordinates = mapCenter
											// Convert String into Array
                      .split(/,\s*/) // split the value
                      .map(function(v) { return +v; });
	var zoomLevel = $("#zoom").text();
	map.setView(L.latLng(coordinates), zoomLevel);
	Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
		attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
	}).addTo(map);

	// Invisible Tools
		// Console Log New Center on Map Drag
		map.on('dragend', function() {
  		console.log('New center: ', map.getCenter());
		});

	// Adds a scale to the map
	L.control.scale({
		position: 'topright',
	  // if true, then feet/miles
	  imperial: true
	}).addTo(map);

	// GeoJson
	var geojson = $("#geojson").text()
	$.getJSON(geojson, geodata => {
		L.geoJSON(geodata, {
			onEachFeature: (feature, layer) => {
				// Bind Popups
				layer.bindPopup(function (layer) {
				    return layer.feature.properties.name;
					});
				// Mouseover effects
				layer.on('mouseover', function() { layer.openPopup(); });
				layer.on('mouseout', function() { layer.closePopup(); });
				// Scroll to anchor on map click
				var element = document.getElementById(layer.feature.properties.id);
				layer.on('click', function() { element.scrollIntoView({ behavior: 'smooth', block: 'start' }) });
				// Open popup and pan map on page scroll
				$("article.post.dropcase").scroll(function() {
					if ( $('h1.activeAnchor').attr('id') === layer.feature.properties.id ) {
    				layer.openPopup();
						map.panTo([feature.geometry.coordinates[1], feature.geometry.coordinates[0] ]);
  					}
				});
			},
			pointToLayer: function (feature, latlng) {
				return L.marker(latlng, {icon: L.divIcon(
					{ html: `<i style="color: IndianRed; text-shadow: 1px 1px 4px black;" class="fas fa-map-marker"></i>`, iconSize: [22, 50] }
				)});
			},
			style: function (geoJsonFeature) {
				return {
					"color": "IndianRed"
				}
			}
		}).addTo(map);
	});
});
