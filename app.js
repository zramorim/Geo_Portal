// 1. Inicializa o mapa
const map = L.map('map').setView([-14.86, -42.58], 5); 

// 2. Adiciona o mapa base de Satélite
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: '© Esri'
}).addTo(map);

// 3. Carrega o arquivo dados.geojson
fetch('data/dados.geojson?' + new Date().getTime())
    .then(response => response.json())
    .then(data => {
        
        // 4. Desenha o polígono e adiciona o balão de informações (Popup)
        const camadaLimite = L.geoJSON(data, {
            style: { 
                color: "#00FFFF", // Borda azul ciano
                weight: 3,        
                fillOpacity: 0.2  
            },
            // NOVO: Função que roda para cada polígono carregado
            onEachFeature: function (feature, layer) {
                // Confere se o polígono tem dados na tabela de atributos
                if (feature.properties) {
                    
                    // Monta o visual e o texto do balão (puxando os nomes exatos do seu GeoJSON)
                    // O comando toFixed(2) deixa a área bonitinha com apenas 2 casas decimais (ex: 44.48)
                    const textoPopup = `
                        <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">
                            <h3 style="color: #2E7D32; margin-bottom: 8px; border-bottom: 1px solid #ccc; padding-bottom: 4px;">Informações do CAR</h3>
                            <b>Recibo:</b> <span style="font-size: 12px;">${feature.properties.recibo}</span><br>
                            <b>Área:</b> ${feature.properties.Area_ha.toFixed(2)} ha
                        </div>
                    `;
                    
                    // Atrela o balão ao polígono
                    layer.bindPopup(textoPopup);
                }
            }
        }).addTo(map);

        // 5. Ajusta o zoom automático
        map.fitBounds(camadaLimite.getBounds());
    })
    .catch(err => console.error("Erro ao carregar o mapa:", err));
