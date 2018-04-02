const VANCOUVER = { lat: 49.2827, lng: -123.1207 };

function createCard(deviceHash, line)
{
  let points = "";
  points += "<table class='table'>" +
              "<thead>" +
                "<tr>" +
                  "<th scope='col'>Latitude</th>" +
                  "<th scope='col'>Longitude</th>" +
                "</tr>" +
              "</thead>" +
              "<tbody>";

  line.forEach(function(point) {
    points += "<tr>";
    points += "<td>" + point.lat + "</td>"
    points += "<td>" + point.lng + "</td>"
    points += "</tr>"; 
  });
  points +=   "</tbody>" + 
            "</table>";


  $('#accordian').append(
    "<div class='card'>" +
        "<div class='card-header' id='" + deviceHash + "'>" +
          "<h5 class='mb-0'>" +
            "<button class='btn btn-link' data-toggle='collapse' data-target='#collapse" + deviceHash + "' aria-expanded='false' aria-controls='collapse" + deviceHash + "'>" +
              deviceHash +
            "</button>" +
          "</h5>" +
        "</div>" +

        "<div id='collapse" + deviceHash + "' class='collapse' aria-labelledby='headingOne' data-parent='#accordion'>" +
          "<div class='card-body'>" +
            points +
          "</div>" +
        "</div>" +
      "</div>"
  );
}

function initMap() {
  let lines = [];
  let devices = [];

  let app = firebase.app();
  let root = app.database().ref().once('value').then(function(snapshot) {
    let data = snapshot.val();
    devices = Object.keys(data);
    
    // Loop through all the devices
    for (let i = 0; i < devices.length; i++) {
      let device = data[devices[i]];
      let timestamps = Object.keys(device);

      // Loop though all the entries
      let line = [];
      for (let j = 0; j < timestamps.length; j++) {
        let location = device[timestamps[j]];
        line.push({
          lat: location.latitude,
          lng: location.longitude
        });
      }

      lines.push(line);
    }

    // Map a new map
    let map = new google.maps.Map(document.getElementById('map'), {
      zoom: 13,
      center: VANCOUVER,
    });

    // For each line
    lines.forEach(function(line, i) {
      // Create path
      let walkingPath = new google.maps.Polyline({
        path: line,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 4
      });

      // Add path to map
      walkingPath.setMap(map);

      // Create a card for the line
      createCard(devices[i], line);
    });
  });
}