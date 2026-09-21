const map = L.map('map').setView([-14.86, -42.58], 5); 

L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: '© Esri'
}).addTo(map);

fetch('data/dados.geojson?' + new Date().getTime())
    .then(response => response.json())
    .then(data => {
        const camadaLimite = L.geoJSON(data, {
            style: { color: "#00FFFF", weight: 3, fillOpacity: 0.2 },
            onEachFeature: function (feature, layer) {
                if (feature.properties) {
                    // Proteção para garantir que a área é lida como número
                    const area = Number(feature.properties.Area_ha || 0).toFixed(2);
                    const recibo = feature.properties.recibo || "Sem recibo";
                    
                    const textoPopup = `
                        <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">
                            <h3 style="color: #2E7D32; margin-bottom: 8px; border-bottom: 1px solid #ccc; padding-bottom: 4px;">Informações do CAR</h3>
                            <b>Recibo:</b> <span style="font-size: 12px;">${recibo}</span><br>
                            <b>Área:</b> ${area} ha
                        </div>
                    `;
                    layer.bindPopup(textoPopup);
                }
            }
        }).addTo(map);

        map.fitBounds(camadaLimite.getBounds());
    })
    .catch(err => console.error("Erro ao carregar o mapa:", err));
