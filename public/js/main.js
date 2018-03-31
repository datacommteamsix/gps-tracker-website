const lineColors = [
  '#FF0000',
  '#0000FF',
  '#00FF00'
]

function initMap() {
  let lines = [];

  let app = firebase.app();
  let root = app.database().ref().once('value').then(function(snapshot) {
    let data = snapshot.val();
    let devices = Object.keys(data);
    
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
      center: { lat: 49.2827, lng: -123.1207 },
    });

    // For each line
    lines.forEach(function(line) {
      // Create path
      let walkingPath = new google.maps.Polyline({
        path: line,
        geodesic: true,
        strokeColor: lineColors[Math.floor(Math.random() * lineColors.length)],
        strokeOpacity: 1.0,
        strokeWeight: 2
      });

      // Add path to map
      walkingPath.setMap(map);
    });
  });
}