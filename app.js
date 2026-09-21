// 1. Inicializa o mapa
const map = L.map('map').setView([-14.86, -42.58], 5); 

// 2. DEFINE OS MAPAS BASE
const mapaSatelite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: '© Esri' });
const mapaRuas = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' });
const mapaTopografico = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', { attribution: '© OpenTopoMap' });

mapaSatelite.addTo(map);
L.control.layers({ "Satélite": mapaSatelite, "Ruas": mapaRuas, "Topográfico": mapaTopografico }).addTo(map);

// NOVA LÓGICA DE CORES E MEMÓRIA
let camadasPoligonos = []; // Guarda os polígonos para o gráfico acessar
const estiloPadrao = { color: "#22c55e", weight: 3, fillOpacity: 0.2 }; // Verde profissional
const estiloDestaque = { color: "#FFD700", weight: 5, fillOpacity: 0.6 }; // Dourado brilhante

// 3. Carrega os dados
fetch('data/dados.geojson?' + new Date().getTime())
    .then(response => response.json())
    .then(data => {
        
        const camadaLimite = L.geoJSON(data, {
            style: estiloPadrao,
            onEachFeature: function (feature, layer) {
                
                camadasPoligonos.push(layer); // Salva o polígono na memória
                
                if (feature.properties) {
                    const area = Number(feature.properties.Area_ha || 0).toFixed(2);
                    const recibo = feature.properties.recibo || "Sem recibo";
                    const nome = feature.properties.nome || "Não informado";
                    
                    const textoPopup = `
                        <div style="font-family: 'Segoe UI', sans-serif; font-size: 13px; color: #333;">
                            <h3 style="color: #22c55e; margin-bottom: 5px; border-bottom: 2px solid #22c55e;">Detalhes do CAR</h3>
                            <b>Proprietário:</b> ${nome}<br>
                            <b>Recibo:</b> <span style="font-size: 11px;">${recibo}</span><br>
                            <b>Área:</b> ${area} ha
                        </div>
                    `;
                    layer.bindPopup(textoPopup);
                }
            }
        }).addTo(map);

        map.fitBounds(camadaLimite.getBounds());
        
        // Passa os dados e a memória de polígonos para o gráfico
        gerarGraficoDashboard(data, camadasPoligonos);
    })
    .catch(err => console.error("Erro ao carregar o mapa:", err));


// 4. GRÁFICO COM INTERATIVIDADE
function gerarGraficoDashboard(geojson, camadasRef) {
    const rotulosGrafico = geojson.features.map(f => f.properties.nome || f.properties.recibo.substring(0, 15) + "...");
    const valoresGrafico = geojson.features.map(f => Number(f.properties.Area_ha || 0));

    const contexto = document.getElementById('meuGrafico').getContext('2d');
    
    new Chart(contexto, {
        type: 'bar',
        data: {
            labels: rotulosGrafico,
            datasets: [{
                label: 'Área (ha)',
                data: valoresGrafico,
                backgroundColor: '#22c55e', // Verde padrão da barra
                hoverBackgroundColor: '#FFD700', // Barra fica Dourada ao passar o mouse
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            onHover: (event, activeElements) => {
                // 1. Volta todos os polígonos para o verde padrão
                camadasRef.forEach(layer => layer.setStyle(estiloPadrao));

                // 2. Se o mouse estiver sobre alguma barra, destaca o polígono
                if (activeElements.length > 0) {
                    const index = activeElements[0].index;
                    const layerSelecionada = camadasRef[index];
                    
                    layerSelecionada.setStyle(estiloDestaque);
                    layerSelecionada.bringToFront(); // Traz o polígono para a frente dos outros
                }
            },
            plugins: { legend: { labels: { color: '#e2e8f0' } } },
            scales: {
                y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                x: { ticks: { color: '#94a3b8' }, grid: { display: false } }
            }
        }
    });
}
