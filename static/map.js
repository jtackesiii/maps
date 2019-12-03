// jQuery available as $
// Leaflet available as L
// Turf available as turf
// Markdown-it available as markdownit
// d3 available as d3

// Intialize the map as the variable "map"
// This also hides the + / - zoom controls.
const map = L.map("mapdiv", { zoomControl: false });
const md = markdownit({html: true}).use(markdownitFootnote);

// Set starting center point, zoom level, and tileset:
var govindNagar = L.latLng([27.510112720964297,77.66918241977692]);
const zoomLevel = 17;
map.setView(govindNagar, zoomLevel);
Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
}).addTo(map);

//Toggle map views with radio butons
$('#map-select input').on('change', function() {
  // pulls radio value string from checked button
  var mapSelection = $("#map-select input[type='radio']:checked").val();
  // splits string into an array legible to leaflet
	var newLatLng = mapSelection
                      .split(/,\s*/) // split the value
                      .map(function(v) { return +v; });
  var newZoomLevel = $("#map-select input[type='radio']:checked").data('zoom');
  // render new coordinates
  map.setView(L.latLng(newLatLng), newZoomLevel);
	// update InfoBoxTitle to match MapSelection
	$(document).ready(function(){
		var infoCardTitle = $("#map-select input[type='radio']:checked").parent().text();
			$('#info-card-text').text(infoCardTitle);
			// Bounce Effect
			$(function(){
				$("#info-card button").effect("bounce", { times: 3}, 2000);
			});
			// update infoCard to match MapSelection
		var infoCardBody = '../markdown/' + $("#map-select input[type='radio']:checked").data('name') + '/' + $("#map-select input[type='radio']:checked").data('name') + '.md';
			$.ajax({ url: infoCardBody,
				success(bodyMarkdown) {
					$("#info-card-body").html(md.render(bodyMarkdown));
				}
			});
		});

  // toggle GeoJson
  var currentGeoJsonId = $("#map-select input[type='radio']:checked").data('name');
  console.log(currentGeoJsonId);
  $.getJSON("/../geojson/" + currentGeoJsonId + ".geojson", geodata => {
		L.geoJSON(geodata, {
			onEachFeature: (feature, layer) => {
				// this builds a working markdown url from the clicked GeoJson element
				var placeData = '../markdown/' + currentGeoJsonId + '/' + layer.feature.properties.id + '.md';
	      // this function pushes the markdown url content to the infoCard
	      var pushTextToCard = function (e) {
					$.ajax({ url: placeData,
					  success(bodyMarkdown) {
					    $("#info-card-body").html(md.render(bodyMarkdown));
					  }
					});
				};
				layer.on('click', pushTextToCard);
				var revertInfoCard = function (e) {
					$.ajax({ url: '/../markdown/' + currentGeoJsonId + '/' + currentGeoJsonId + '.md',
						success(bodyMarkdown) {
							$("#info-card-body").html(md.render(bodyMarkdown));
						}
					});
				}
				map.on('popupclose', revertInfoCard)
			}
		}).bindPopup(function (layer) {
		    return layer.feature.properties.name;
			}).addTo(map);
  });
});

// Default GeoJson on PageLoad
$.getJSON("/../geojson/GovindNagar.geojson", geodata => {
	L.geoJSON(geodata, {
		onEachFeature: (feature, layer) => {
			// this builds a working markdown url from our GeoJson data
			var placeData = '../markdown/' + "GovindNagar" + '/' + layer.feature.properties.id + '.md';
			// this function pushes the markdown url content to the infoCard
			var pushTextToCard = function (e) {
				$.ajax({ url: placeData,
					success(bodyMarkdown) {
						$("#info-card-body").html(md.render(bodyMarkdown));
					}
				});
			};
			layer.on('click', pushTextToCard)
			var revertInfoCard = function (e) {
				$.ajax({ url: '/../markdown/GovindNagar/GovindNagar.md',
					success(bodyMarkdown) {
						$("#info-card-body").html(md.render(bodyMarkdown));
					}
				});
			}
			map.on('popupclose', revertInfoCard)
		}
	}).bindPopup(function (layer) {
			return layer.feature.properties.name;
		}).addTo(map);
});

// Default InfoCard and BounceEffect on PageLoad
var infoCardBody = '../markdown/' + $("#map-select input[type='radio']:checked").data('name') + '/' + $("#map-select input[type='radio']:checked").data('name') + '.md';
	$.ajax({ url: infoCardBody,
		success(bodyMarkdown) {
			$("#info-card-body").html(md.render(bodyMarkdown));
			}
		});
	$(function(){
		for(var i = 0; i < 3; i++) {
			$("#info-card button").effect("bounce", { times: 3}, 2000);
		}
	});

// Adds a scale to the map
L.control.scale({
	position: 'topright',
  // if true, then feet/miles
  imperial: true
}).addTo(map);

// auto rotate skewed images
function resetOrientation(srcBase64, srcOrientation, callback) {
  var img = new Image();

  img.onload = function() {
    var width = img.width,
        height = img.height,
        canvas = document.createElement('canvas'),
        ctx = canvas.getContext("2d");

    // set proper canvas dimensions before transform & export
    if (4 < srcOrientation && srcOrientation < 9) {
      canvas.width = height;
      canvas.height = width;
    } else {
      canvas.width = width;
      canvas.height = height;
    }

    // transform context before drawing image
    switch (srcOrientation) {
      case 2: ctx.transform(-1, 0, 0, 1, width, 0); break;
      case 3: ctx.transform(-1, 0, 0, -1, width, height); break;
      case 4: ctx.transform(1, 0, 0, -1, 0, height); break;
      case 5: ctx.transform(0, 1, 1, 0, 0, 0); break;
      case 6: ctx.transform(0, 1, -1, 0, height, 0); break;
      case 7: ctx.transform(0, -1, -1, 0, height, width); break;
      case 8: ctx.transform(0, -1, 1, 0, 0, width); break;
      default: break;
    }

    // draw image
    ctx.drawImage(img, 0, 0);

    // export base64
    callback(canvas.toDataURL());
  };

  img.src = srcBase64;
};

$(document).on("click", '[data-toggle="lightbox"]', function(event) {
  event.preventDefault();
  $(this).ekkoLightbox();
});
