// 1. Inicializa o mapa
const map = L.map('map').setView([-14.86, -42.58], 5); 

// 2. DEFINE OS MAPAS BASE (Satélite, Ruas e Topográfico)
const mapaSatelite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: '© Esri'
});

const mapaRuas = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
});

const mapaTopografico = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenTopoMap'
});

// Define qual mapa vai aparecer primeiro quando o site abrir
mapaSatelite.addTo(map);

// 3. CRIA O BOTÃO DE CONTROLO DE CAMADAS
const mapasBase = {
    "Satélite (Esri)": mapaSatelite,
    "Ruas (OSM)": mapaRuas,
    "Topográfico": mapaTopografico
};

// Adiciona o botão no mapa (geralmente fica no canto superior direito)
L.control.layers(mapasBase).addTo(map);

// 4. Carrega o ficheiro GeoJSON sem usar a cache do navegador
fetch('data/dados.geojson?' + new Date().getTime())
    .then(response => response.json())
    .then(data => {
        
        // DESENHA OS POLÍGONOS E OS POPUPS
        const camadaLimite = L.geoJSON(data, {
            style: { color: "#00FFFF", weight: 3, fillOpacity: 0.2 },
            onEachFeature: function (feature, layer) {
                if (feature.properties) {
                    const area = Number(feature.properties.Area_ha || 0).toFixed(2);
                    const recibo = feature.properties.recibo || "Sem recibo";
                    const nome = feature.properties.nome || "Não informado";
                    const email = feature.properties.email || "Não informado";
                    const cpf = feature.properties.cpf || "Não informado";
                    
                    const textoPopup = `
                        <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">
                            <h3 style="color: #2E7D32; margin-bottom: 8px; border-bottom: 1px solid #ccc; padding-bottom: 4px;">Dados da Propriedade</h3>
                            <b>Proprietário:</b> ${nome}<br>
                            <b>CPF:</b> ${cpf}<br>
                            <b>E-mail:</b> ${email}<br>
                            <hr style="border: 0; border-top: 1px solid #eee; margin: 8px 0;">
                            <b>Recibo CAR:</b> <span style="font-size: 11px;">${recibo}</span><br>
                            <b>Área:</b> ${area} ha
                        </div>
                    `;
                    layer.bindPopup(textoPopup);
                }
            }
        }).addTo(map);

        // Ajusta o zoom da câmara para o polígono
        map.fitBounds(camadaLimite.getBounds());

        // GERAÇÃO DO GRÁFICO DINÂMICO
        gerarGraficoDashboard(data);
    })
    .catch(err => console.error("Erro ao carregar o mapa:", err));


// FUNÇÃO QUE CONSTRÓI O GRÁFICO CHART.JS
function gerarGraficoDashboard(geojson) {
    const rotulosGrafico = geojson.features.map(f => {
        if (f.properties.nome) {
            return f.properties.nome;
        } else if (f.properties.recibo) {
            return f.properties.recibo.substring(0, 15) + "..."; 
        } else {
            return "Propriedade";
        }
    });
    
    const valoresGrafico = geojson.features.map(f => Number(f.properties.Area_ha || 0));

    const contexto = document.getElementById('meuGrafico').getContext('2d');
    
    new Chart(contexto, {
        type: 'bar',
        data: {
            labels: rotulosGrafico,
            datasets: [{
                label: 'Área em Hectares (ha)',
                data: valoresGrafico,
                backgroundColor: '#4CAF50',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { labels: { color: 'white' } }
            },
            scales: {
                y: { ticks: { color: 'white' }, grid: { color: 'rgba(255,255,255,0.1)' } },
                x: { ticks: { color: 'white' }, grid: { display: false } }
            }
        }
    });
}
