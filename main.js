(function ($) {
  $(document).ready(function () {
    const accessToken =
      "pk.eyJ1IjoibWF0dGhldzM1MCIsImEiOiJaTVFMUkUwIn0.wcM3Xc8BGC6PM-Oyrwjnhg";
    mapboxgl.accessToken = accessToken; //Mapbox token
    const map = new mapboxgl.Map({
      container: "map", // container id
      style: "mapbox://styles/mapbox/light-v10", //stylesheet location
      center: [-3.2765753, 54.7023545], // starting position
      zoom: 1, // starting zoom
    });

    map.addControl(
      new MapboxGeocoder({
        accessToken,
        mapboxgl,
      })
    );

    $.ajax({
      type: "GET",
      //YOUR TURN: Replace with csv export link
      url:
        "https://spreadsheets-to-maps.herokuapp.com/api/v1/buildbackbetteruk",
      dataType: "json",
      success: function (csvData) {
        makeGeoJSON(csvData.data);
      },
    });

    const loadmap = (data) => {
      const featureData = data.map((item) => {
        console.log(item, "item")
        return {
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": [item.longitude, item.latitude],
          },
          "properties": {
            "name": item.name,
            "description": item.description,
            "link": item.link,
            "location": item.location
          },
        };
      });

      map.on("load", function () {
        map.addSource("points", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: featureData,
          },
        });
        map.addLayer({
          id: "points",
          type: "circle",
          source: "points",
          paint: {
            "circle-radius": 10,
            "circle-color": "#7937CC",
          },
        });

        // Add zoom and rotation controls to the map.
        map.addControl(new mapboxgl.NavigationControl());

              // When a click event occurs on a feature in the csvData layer, open a popup at the
      // location of the feature, with description HTML from its properties.
      map.on("click", "points", function (e) {
        var coordinates = e.features[0].geometry.coordinates.slice();
        console.log(e.features, "features???")
        //set popup text
        //You can adjust the values of the popup to match the headers of your CSV.
        // For example: e.features[0].properties.Name is retrieving information from the field Name in the original CSV.
        var description =
          `<h3>` +
          e.features[0].properties.name +
          `</h3>` +
          `<h4>` +
          `<b>` +
          `Location: ` +
          `</b>` +
          e.features[0].properties.location +
          `</h4>` +
          `<h4>` +
          `<b>` +
          `About: ` +
          `</b>` +
          e.features[0].properties.description +
          `</h4>` +
          `<h4>` +
          `<b>` +
          `Get involved: ` +
          `</b>` +
          e.features[0].properties.link +
          `</h4>`;

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
      map.on("mouseenter", "points", function () {
        map.getCanvas().style.cursor = "pointer";
      });

      // Change it back to a pointer when it leaves.
      map.on("mouseleave", "places", function () {
        map.getCanvas().style.cursor = "";
      });

      const line = turf.lineString(featureData.map(feature=> feature.geometry.coordinates));
      const bbox = turf.bbox(line);
      map.fitBounds(bbox, { padding: 50 });
      });
    };

    function makeGeoJSON(csvData) {
      loadmap(csvData);
    }
  });
})(jQuery);
