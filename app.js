// 1. INICIALIZANDO O MAPA
// As coordenadas iniciais [-14.86, -42.58] centralizam na região da Bahia. Ajuste conforme necessário.
const map = L.map('map').setView([-14.86, -42.58], 10); 

// 2. ADICIONANDO CAMADAS DE FUNDO (Basemaps)
const mapaRuas = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
});

const mapaSatelite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: '© Esri'
});

// Adiciona o satélite como padrão
mapaSatelite.addTo(map);

// Controle para alternar entre as camadas
const baseMaps = {
    "Satélite": mapaSatelite,
    "Ruas": mapaRuas
};
L.control.layers(baseMaps).addTo(map);

// 3. CARREGANDO O GEOJSON E GERANDO GRÁFICO INTEGRADo
fetch('data/dados.geojson')
    .then(response => response.json())
    .then(data => {
        // Adiciona os polígonos no mapa
        L.geoJSON(data, {
            style: function (feature) {
                return {color: "#4CAF50", weight: 2, fillOpacity: 0.5};
            },
            onEachFeature: function (feature, layer) {
                // Adiciona um popup interativo ao clicar
                if (feature.properties) {
                    layer.bindPopup(`<b>Propriedade:</b> ${feature.properties.nome || 'N/A'}<br>
                                     <b>Área (ha):</b> ${feature.properties.area || 'N/A'}`);
                }
            }
        }).addTo(map);

        // 4. CRIANDO O GRÁFICO DINÂMICO
        criarGrafico(data);
    })
    .catch(err => console.error("Erro ao carregar o GeoJSON:", err));

// Função para extrair atributos do GeoJSON e gerar o gráfico
function criarGrafico(geojson) {
    // Exemplo: Coletando nomes e áreas (ha) do seu GeoJSON
    // (Certifique-se de que os atributos 'nome' e 'area' existem no seu arquivo QGIS)
    const nomes = geojson.features.map(f => f.properties.nome || 'Desconhecido');
    const areas = geojson.features.map(f => f.properties.area || 0);

    const ctx = document.getElementById('meuGrafico').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: nomes,
            datasets: [{
                label: 'Área em Hectares',
                data: areas,
                backgroundColor: '#4CAF50',
                borderRadius: 5
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