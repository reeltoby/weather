
        // Creating the map variable and setting zoom and coordinates to Ontario, Canada    
         
		var map = L.map('mapid').setView([51.2538, -85.3232], 5);
		
		L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYWp1dHppIiwiYSI6ImNrbGQ3d2E4MTE3cHAydXFlanJ1aG9maG4ifQ.6MOuQtvruOzh95-1C3i0jg', {
			attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
			maxZoom: 19,
			id: 'mapbox/streets-v11',
			tileSize: 512,
			zoomOffset: -1,
			accessToken: 'pk.eyJ1IjoiYWp1dHppIiwiYSI6ImNrbGQ3d2E4MTE3cHAydXFlanJ1aG9maG4ifQ.6MOuQtvruOzh95-1C3i0jg'
		}).addTo(map);
		
        // Creating variables for weather tile layers
        // OpenWeatherMap API tile reference: https://openweathermap.org/api/weathermaps
        // Leaflet tile reference: https://leafletjs.com/reference-1.7.1.html#tilelayer
        // Javascript 'new' operator reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/new
		var precip = (new L.TileLayer("http://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=35b79f04000d801c24276115e7093f38")),
			weather = (new L.TileLayer("http://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=35b79f04000d801c24276115e7093f38")),
			wind = (new L.TileLayer("http://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=35b79f04000d801c24276115e7093f38")),
			clouds = (new L.TileLayer("http://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=35b79f04000d801c24276115e7093f38")),
			pressure = (new L.TileLayer("http://tile.openweathermap.org/map/pressure_new/{z}/{x}/{y}.png?appid=35b79f04000d801c24276115e7093f38"));
		
		    
        // Key-value pairs used for the control panel 
        // Keys are the text values seen in the control panel, and the values are the corresponding tile layer variables
        // Layer groups and layers control tutorial: https://leafletjs.com/examples/layers-control/
		var overlayMaps = {
		"Precipitation" : precip,
		"Weather" : weather,
		"Wind" : wind,
		"Clouds" : clouds,
		"Pressure" : pressure
		};
		
        // Control panel in top left corner
        // Gives user the ability to toggle between different weather layers
		L.control.layers(overlayMaps).addTo(map);

        var trailheads = L.esri.Cluster.featureLayer({
			url: 'https://ws.lioservices.lrc.gov.on.ca/arcgis1071a/rest/services/LIO_OPEN_DATA/LIO_Open04/MapServer/20'
		}).addTo(map);

		trailheads.bindPopup(function (layer) {
			if (theMarker != undefined) {
					  map.removeLayer(theMarker);
				}
			return L.Util.template('<p>Trail: <strong>{TRAIL_NAME}</strong><br>Association: {TRAIL_ASSOCIATION}<br>Website: <a href="url">{TRAIL_ASSOCIATION_WEBSITE}</a><br>Activity: {ACTIVITY}<br>Description: <i>{DESCRIPTION}</i><br>Length: {LENGTH_KMS}km<br>Difficulty: {OTC_TRAIL_CHALLENGE}</p>', layer.feature.properties);
		});
		
		var trailPaths = L.esri.featureLayer({
			url: 'https://ws.lioservices.lrc.gov.on.ca/arcgis1071a/rest/services/LIO_OPEN_DATA/LIO_Open04/MapServer/19'
		});
		
		trailPaths.bindPopup(function (layer) {
			if (theMarker != undefined) {
					  map.removeLayer(theMarker);
				}
			return L.Util.template('<p><strong>Path material:{SURFACE_DETAIL}</strong></p>', layer.feature.properties);
		});


		var startup = document.getElementById("start").innerHTML = "<b>Ontario Trail Weather Map</b>: Click a marker to get trail information, and and click anywhere to get the current weather";


		// source: https://github.com/pointhi/leaflet-color-markers
		var greyIcon = new L.Icon({
		  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
		  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
		  iconSize: [18.75, 30.75],
		  iconAnchor: [9, 30.75],
		  popupAnchor: [1, -34],
		  shadowSize: [30.75, 30.75]
		});

		// source: https://gis.stackexchange.com/questions/238414/adding-a-new-and-removing-an-old-marker-every-time-the-user-click-on-the-map
		 var theMarker = {};

		  map.on('click',function(e){
			lat = e.latlng.lat;
			lon = e.latlng.lng;

			$('#start').remove();

			console.log("You clicked the map at LAT: "+ lat+" and LONG: "+lon );
				//Clear existing marker, 

				if (theMarker != undefined) {
					  map.removeLayer(theMarker);
				}

			//Add a marker to show where you clicked.
			 theMarker = L.marker([lat,lon], {icon: greyIcon}).addTo(map);  
		});

        // user gets weather data by clicking a location on the tile map
        map.on('click', function(layer){
		  var latlng = map.mouseEventToLatLng(layer.originalEvent);
		  console.log(latlng.lat + ', ' + latlng.lng);
		  //alert(latlng.lat + ' , ' + latlng.lng);
		  $.get( "https://api.openweathermap.org/data/2.5/weather?units=metric&lat="+latlng.lat+"&lon="+latlng.lng+"&appid=35b79f04000d801c24276115e7093f38", function( data ) {
			  console.log(data);
			  var weatherdata = JSON.stringify(data);
			  //alert( "Data Loaded: " + weatherdata );

			  var obj = JSON.parse(weatherdata);
			  
			  // returning json values help: https://idratherbewriting.com/learnapidoc/docapis_access_json_values.html
		
			  document.getElementById("temp").innerHTML = "Marker coordinates: " + latlng.lat.toFixed(5) + ', ' + latlng.lng.toFixed(5) + "<br />" +
			  "Current weather: " + obj.main.temp + " °C" +  "<br />" + "Feels like: " + obj.main.feels_like + " °C" + "<br />" + obj.weather[0].main + "<br />" + obj.weather[0].description + "<br />" + "Visibility: " + obj.visibility + " m" + "<br />" + "Wind gust: " + obj.wind.gust + " km/h";

			  document.getElementById("temperature").innerHTML = obj.main.feels_like + " °C";
			  document.getElementById("temperature").style.fontSize = 35;
			  document.getElementById("temperature").style.fontFamily = "Arial";
		
		var dynamictemp = obj.main.feels_like;
			  if (dynamictemp < 0) {
				document.getElementById("temperature").style.color = "navy";
			  	document.getElementById("temperature").style.fontSize = 35;
			  	document.getElementById("temperature").style.fontFamily = "Arial";}
			  if (dynamictemp > 0) {
				document.getElementById("temperature").style.color = "red";
			  	document.getElementById("temperature").style.fontSize = 35;
			  	document.getElementById("temperature").style.fontFamily = "Arial";}
			});
		});

		trailheads.on('click', function(layer){
		  
		  $('#start').remove();

		  var latlng = map.mouseEventToLatLng(layer.originalEvent);
		  console.log(latlng.lat + ', ' + latlng.lng);
		  $.get( "https://api.openweathermap.org/data/2.5/weather?units=metric&lat="+latlng.lat+"&lon="+latlng.lng+"&appid=35b79f04000d801c24276115e7093f38", function( data ) {
			  console.log(data);
			  var weatherdata = JSON.stringify(data);
			  //alert( "Data Loaded: " + weatherdata );
			  var obj = JSON.parse(weatherdata);
			  
			  // returning json values help: https://idratherbewriting.com/learnapidoc/docapis_access_json_values.html
			  document.getElementById("temp").innerHTML = "Marker coordinates: " + latlng.lat.toFixed(5) + ', ' + latlng.lng.toFixed(5) + "<br />" +
			  "Current weather: " + obj.main.temp + " °C" +  "<br />" + "Feels like: " + obj.main.feels_like + " °C" + "<br />" + obj.weather[0].main + "<br />" + obj.weather[0].description + "<br />" + "Visibility: " + obj.visibility + " m" + "<br />" + "Wind gust: " + obj.wind.gust + " km/h";
			  
			  document.getElementById("temperature").innerHTML = obj.main.feels_like + " °C";
			  document.getElementById("temperature").style.fontSize = 35;
			  document.getElementById("temperature").style.fontFamily = "Arial";
		var dynamictemp = obj.main.feels_like;
			  if (dynamictemp < 0) {
				document.getElementById("temperature").style.color = "navy";}
			  if (dynamictemp > 0) {
				document.getElementById("temperature").style.color = "red";}

			});
		});
			
	    //Search feature layer Trail names plus geocoding//
    
        var arcgisOnlineProvider = L.esri.Geocoding.arcgisOnlineProvider({
            apikey: "AAPK8f4efd31704b4fdbac83f0919b3c87062-2cORlqNMZqlULdoh9mzEY_4gPuy3OuWGbVye-kuYgk5p5L-mbMDAQueCV71_HA"
        }); 

        var trailsProvider = L.esri.Geocoding.featureLayerProvider({
            url: 'https://ws.lioservices.lrc.gov.on.ca/arcgis1071a/rest/services/LIO_OPEN_DATA/LIO_Open04/MapServer/20',
            searchFields: ['TRAIL_NAME'],
            label: 'Ontario Trails',
            bufferRadius: 5000,
            formatSuggestion: function (feature) {
            return feature.properties.TRAIL_NAME;
            }
        });
  
        L.esri.Geocoding.geosearch({
            providers: [arcgisOnlineProvider, trailsProvider]
        }).addTo(map);

    
        // minimum zoom level for the trailPaths layer
        // source: https://gis.stackexchange.com/questions/182628/leaflet-layers-on-different-zoom-levels-how
        map.on('zoomend', function() {
            var zoomlevel = map.getZoom();
                if (zoomlevel  <13){
                    if (map.hasLayer(trailPaths)) {
                        map.removeLayer(trailPaths);
                    } else {
                        console.log("no point layer active");
                    }
                }
                if (zoomlevel >= 13){
                    if (map.hasLayer(trailPaths)){
                        console.log("layer already added");
                    } else {
                        map.addLayer(trailPaths);
                    }
                }
            console.log("Current Zoom Level =" + zoomlevel);
            });
                    

		

