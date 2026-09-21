// 1. Inicializa o mapa
const map = L.map('map').setView([-14.86, -42.58], 5); 

// 2. DEFINE OS MAPAS BASE
const mapaSatelite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: '© Esri' });
const mapaRuas = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' });
const mapaTopografico = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', { attribution: '© OpenTopoMap' });

mapaSatelite.addTo(map);
L.control.layers({ "Satélite": mapaSatelite, "Ruas": mapaRuas, "Topográfico": mapaTopografico }).addTo(map);

// LÓGICA DE CORES E MEMÓRIA
let camadasPoligonos = []; // Guarda os polígonos para o gráfico acessar
const estiloPadrao = { color: "#22c55e", weight: 3, fillOpacity: 0.2 }; 
const estiloDestaque = { color: "#FFD700", weight: 5, fillOpacity: 0.6 }; 

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
                    const email = feature.properties.email || "Não informado";
                    const cpf = feature.properties.cpf || "Não informado";
                    
                    const textoPopup = `
                        <div style="font-family: 'Segoe UI', sans-serif; font-size: 13px; color: #333;">
                            <h3 style="color: #22c55e; margin-bottom: 5px; border-bottom: 2px solid #22c55e;">Detalhes do CAR</h3>
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

        map.fitBounds(camadaLimite.getBounds());
        
        // Passa os dados para o gráfico e para os blocos de resumo
        gerarGraficoDashboard(data, camadasPoligonos);
        atualizarResumo(data); // Chama a matemática do resumo
    })
    .catch(err => console.error("Erro ao carregar o mapa:", err));


// 4. NOVA FUNÇÃO: MATEMÁTICA DO RESUMO
function atualizarResumo(geojson) {
    const totalPropriedades = geojson.features.length; // Conta polígonos
    
    let areaTotal = 0;
    geojson.features.forEach(f => {
        areaTotal += Number(f.properties.Area_ha || 0); // Soma todas as áreas
    });

    document.getElementById('total-prop').innerText = totalPropriedades;
    document.getElementById('total-area').innerText = areaTotal.toFixed(2) + " ha";
}


// 5. GRÁFICO COM INTERATIVIDADE
function gerarGraficoDashboard(geojson, camadasRef) {
    const rotulosGrafico = geojson.features.map(f => {
        if (f.properties.nome) return f.properties.nome;
        if (f.properties.recibo) return f.properties.recibo.substring(0, 15) + "...";
        return "Propriedade";
    });
    
    const valoresGrafico = geojson.features.map(f => Number(f.properties.Area_ha || 0));

    const contexto = document.getElementById('meuGrafico').getContext('2d');
    
    new Chart(contexto, {
        type: 'bar',
        data: {
            labels: rotulosGrafico,
            datasets: [{
                label: 'Área (ha)',
                data: valoresGrafico,
                backgroundColor: '#22c55e', 
                hoverBackgroundColor: '#FFD700', 
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            onHover: (event, activeElements) => {
                camadasRef.forEach(layer => layer.setStyle(estiloPadrao));

                if (activeElements.length > 0) {
                    const index = activeElements[0].index;
                    const layerSelecionada = camadasRef[index];
                    
                    layerSelecionada.setStyle(estiloDestaque);
                    layerSelecionada.bringToFront(); 
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
