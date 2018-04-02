/*------------------------------------------------------------------------------------------------------------------
-- SOURCE FILE:         main.js - A website that visualizes gps tracking data
--
-- PROGRAM:             gps-tracker
--
-- FUNCTIONS:
--                      void initMap()
--                      void formSubmitHandler()
--                      void loginSuccessCallback()
--                      void createCard(deviceHash, line)
--
--
-- DATE:                April 1, 2018
--
-- REVISIONS:           N/A
--
-- DESIGNER:            Benny Wang
--
-- PROGRAMMER:          Benny Wang
--
-- NOTES:
-- This website allows for anyone with the correct login to view the logged gps data that is stored on firebase.
----------------------------------------------------------------------------------------------------------------------*/

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

/*------------------------------------------------------------------------------------------------------------------
-- FUNCTION:            initMap
--
-- DATE:                April 1, 2018
--
-- REVISIONS:           N/A
--
-- DESIGNER:            Benny Wang
--
-- PROGRAMMER:          Benny Wang
--
-- INTERFACE:           void initMap ()
--
-- RETURNS:             void
--
-- NOTES:
-- This is a callback function used by the Google Maps API for javascript. This function creates a map and places it
-- in the div tag with id 'map'.
--
-- The default zoom level of the map is 13 and is centered on Vancouver.
----------------------------------------------------------------------------------------------------------------------*/
function initMap() {
  // Make a new map
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 13,
    center: VANCOUVER,
  });
}

/*------------------------------------------------------------------------------------------------------------------
-- FUNCTION:            formSubmitHandler
--
-- DATE:                April 1, 2018
--
-- REVISIONS:           N/A
--
-- DESIGNER:            Benny Wang
--
-- PROGRAMMER:          Benny Wang
--
-- INTERFACE:           void formSubmitHandler ()
--
-- RETURNS:             void
--
-- NOTES:
-- This is a callback for when the user submit's the login form.
--
-- This function will grab the email and password that has been entered into the form and make an authentication
-- request to firebase.
--
-- On success the authentication state of the website will change and the appropriate listener will display the gps
-- data. If the authetication fails an error message is shown. 
----------------------------------------------------------------------------------------------------------------------*/
function formSubmitHandler()
{
  let email = $('#emailForm').val();
  let password = $('#passwordForm').val();

  firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
    $('#errorDisplay').text(error.message);
  });
}

/*------------------------------------------------------------------------------------------------------------------
-- FUNCTION:            loginSuccessCallback
--
-- DATE:                April 1, 2018
--
-- REVISIONS:           N/A
--
-- DESIGNER:            Benny Wang
--
-- PROGRAMMER:          Benny Wang
--
-- INTERFACE:           void loginSuccessCallback ()
--
-- RETURNS:             void
--
-- NOTES:
-- This function is run when a user successfully authenticates with firebase.
--
-- This function will query firebase for all the gps data and parse it. This is where the lines on the map are drawn
-- and where the data cards are made.
----------------------------------------------------------------------------------------------------------------------*/
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

/*------------------------------------------------------------------------------------------------------------------
-- FUNCTION:            createCard
--
-- DATE:                April 1, 2018
--
-- REVISIONS:           N/A
--
-- DESIGNER:            Benny Wang
--
-- PROGRAMMER:          Benny Wang
--
-- INTERFACE:           void createCard (deviceHash, line)
--                        string deviceHash: The unique id of the device.
--                        JSON[] line: The array of json objects representing coordinates.
--
-- RETURNS:             void
--
-- NOTES:
-- A expandable card is created with the deviceHash as the title. The card will contain a table with all the latitude
-- and longitude of every coordinate transmitted by that device. The expandable card is then appended to the bottom
-- of the div with an id of 'accordian' which is on the right side of the screen.
----------------------------------------------------------------------------------------------------------------------*/
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

