const apiKey = '5b3ce3597851110001cf6248de4a3328eb864b478a761d3cc770ce0c';

const map = L.map('map').setView([-30.015763, -51.212362], 15);
const redIcon = L.icon({
    iconUrl: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });

  const senacCoords = [-30.015763, -51.212362];
  L.marker(senacCoords, { icon: redIcon })
    .addTo(map)
    .bindPopup("Senac Distrito Criativo")
    .openPopup();
  
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let markers = [];
let routeLine = null;

function clearMap() {
  markers.forEach(m => map.removeLayer(m));
  markers = [];
  if (routeLine) map.removeLayer(routeLine);
  document.getElementById('info').innerHTML = '';
}

map.on('click', async function(e) {
  if (markers.length === 2) {
    clearMap();
  }

  const marker = L.marker(e.latlng).addTo(map);
  markers.push(marker);

  if (markers.length === 2) {
    const coords = markers.map(m => [m.getLatLng().lng, m.getLatLng().lat]);

    const response = await fetch('https://api.openrouteservice.org/v2/directions/driving-car/geojson', {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ coordinates: coords })
    });

    const data = await response.json();

    if (data && data.features && data.features.length > 0) {
      const route = data.features[0];
      routeLine = L.geoJSON(route).addTo(map);

      const distance = route.properties.summary.distance / 1000;
      const duration = route.properties.summary.duration / 60; 

      document.getElementById('info').innerHTML =
        `<strong>Distância:</strong> ${distance.toFixed(2)} KM<br>
         <strong>Tempo estimado:</strong> ${duration.toFixed(1)} minutos de carro`;
    } else {
      alert('Erro ao calcular rota');
    }
  }
});