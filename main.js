(function($){
    $(document).ready(function(){
            const accessToken = 'pk.eyJ1IjoiZWxsZW4zNTAiLCJhIjoiY2tiMG5pcG56MDluNTM1bWU5NnJoZXB5eCJ9.SACx8CmrvvBH5ukO20qs0g';
            mapboxgl.accessToken = accessToken //Mapbox token 
            const map = new mapboxgl.Map({
              container: 'map', // container id
              style: 'mapbox://styles/mapbox/light-v10', //stylesheet location
              center: [-3.2765753, 54.7023545], // starting position
              zoom: 1,// starting zoom
            });

            map.addControl(
                new MapboxGeocoder({
                accessToken,
                mapboxgl: mapboxgl
                })
            );

            $.ajax({
              type: "GET",
              //YOUR TURN: Replace with csv export link
              url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSLBh9AtPPNXvM62veegtgAAtHHd1rPpQsfulyFqBKieyC7e5nmXl3sDWjev_AhCkVaIVQoXYWlsogg/pub?output=csv',
              dataType: "text",
              success: function (csvData) { makeGeoJSON(csvData); }
            });
      
      
      
            function makeGeoJSON(csvData) {
              csv2geojson.csv2geojson(csvData, {
                latfield: 'Latitude',
                lonfield: 'Longitude',
                delimiter: ','
              }, function (err, data) {
                if(err){
                    console.log(err, "Error is here.")
                    return;
                }
                map.on('load', function () {
      
                  //Add the the layer to the map 
                  map.addLayer({
                    'id': 'csvData',
                    'type': 'circle',
                    'source': {
                      'type': 'geojson',
                      'data': data
                    },
                    'paint': {
                      'circle-radius': 10,
                      'circle-color': "#7937CC"
                    }
                  });
      
       
      
                  // Add zoom and rotation controls to the map.
                  map.addControl(new mapboxgl.NavigationControl());
                  
                  // When a click event occurs on a feature in the csvData layer, open a popup at the
                  // location of the feature, with description HTML from its properties.
                  map.on('click', 'csvData', function (e) {
                    var coordinates = e.features[0].geometry.coordinates.slice();
      
                    //set popup text 
                    //You can adjust the values of the popup to match the headers of your CSV. 
                    // For example: e.features[0].properties.Name is retrieving information from the field Name in the original CSV. 
                    var description = `<h3>` + e.features[0].properties.Name + `</h3>` + `<h4>` + `<b>` + `Location: ` + `</b>` + e.features[0].properties.Location + `</h4>` + `<h4>` + `<b>` + `About: ` + `</b>` + e.features[0].properties.Description + `</h4>` + `<h4>` + `<b>` + `Get involved: ` + `</b>` + e.features[0].properties.Link + `</h4>`;
      
                    // Ensure that if the map is zoomed out such that multiple
                    // copies of the feature are visible, the popup appears
                    // over the copy being pointed to.
                    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                    }
      
                    //add Popup to map
      
                    new mapboxgl.Popup()
                      .setLngLat(coordinates)
                      .setHTML(description)
                      .addTo(map);
                  });
      
                  // Change the cursor to a pointer when the mouse is over the places layer.
                  map.on('mouseenter', 'csvData', function () {
                    map.getCanvas().style.cursor = 'pointer';
                  });
      
                  // Change it back to a pointer when it leaves.
                  map.on('mouseleave', 'places', function () {
                    map.getCanvas().style.cursor = '';
                  });
      
                  var bbox = turf.bbox(data);
                  map.fitBounds(bbox, { padding: 50 });
      
                });
      
              });
            };
          });
})(jQuery);