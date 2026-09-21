// 1. Inicializa o mapa (centralizado inicialmente no Brasil)
const map = L.map('map').setView([-14.86, -42.58], 5); 

// 2. Adiciona o mapa base de Satélite
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: '© Esri'
}).addTo(map);

// 3. Carrega o ficheiro dados.geojson forçando o download da versão mais recente (ignora a cache)
fetch('data/dados.geojson?' + new Date().getTime())
    .then(response => {
        if (!response.ok) {
            throw new Error("Não foi possível aceder ao ficheiro dados.geojson");
        }
        return response.json();
    })
    .then(data => {
        // 4. Desenha o polígono no mapa com uma cor de destaque
        const camadaLimite = L.geoJSON(data, {
            style: { 
                color: "#00FFFF", // Borda azul ciano
                weight: 3,        // Espessura da linha
                fillOpacity: 0.2  // Transparência (deixa ver o satélite por baixo)
            }
        }).addTo(map);

        // 5. Ajusta o zoom e centraliza automaticamente na área do seu polígono
        map.fitBounds(camadaLimite.getBounds());
    })
    .catch(err => console.error("Erro ao carregar o mapa:", err));
