// Default location for the map
const VANCOUVER = { lat: 49.2827, lng: -123.1207 };

// Google Maps object
let map = {};

// Initialize firebase
let app = firebase.app();

// Create a listener that checks if the user logs in
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    loginSuccessCallback();
  }
});


function initMap() {
  // Make a new map
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 13,
    center: VANCOUVER,
  });
}

function formSubmitHandler()
{
  let email = $('#emailForm').val();
  let password = $('#passwordForm').val();

  firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
    $('#errorDisplay').text(error.message);
  });
}

function loginSuccessCallback() {
  $('#accordian').empty();

  let lines = [];
  let devices = [];

  // Query the database for all the points
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

function createCard(deviceHash, line) {
  // Create the contents of the card
  let points = "";
  points += "<table class='table'>" +
              "<thead>" +
                "<tr>" +
                  "<th scope='col'>Latitude</th>" +
                  "<th scope='col'>Longitude</th>" +
                "</tr>" +
              "</thead>" +
              "<tbody>";

  // Create a table row for each coordinate
  line.forEach(function(point) {
    points += "<tr>";
    points += "<td>" + point.lat + "</td>"
    points += "<td>" + point.lng + "</td>"
    points += "</tr>"; 
  });
  points +=   "</tbody>" + 
            "</table>";

  // create the card and append it to the list
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

