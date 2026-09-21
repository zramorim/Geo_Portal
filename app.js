// 1. Inicializa o mapa
const map = L.map('map').setView([-14.86, -42.58], 5); 

// 2. Adiciona o mapa base de Satélite
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: '© Esri'
}).addTo(map);

// 3. Carrega o ficheiro GeoJSON sem usar a cache do navegador
fetch('data/dados.geojson?' + new Date().getTime())
    .then(response => response.json())
    .then(data => {
        
        // 4. DESENHA OS POLÍGONOS E OS POPUPS
        const camadaLimite = L.geoJSON(data, {
            style: { color: "#00FFFF", weight: 3, fillOpacity: 0.2 },
            onEachFeature: function (feature, layer) {
                if (feature.properties) {
                    // Extrai as variáveis da tabela de atributos
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

        // 5. PARTE 5: GERAÇÃO DO GRÁFICO DINÂMICO
        gerarGraficoDashboard(data);
    })
    .catch(err => console.error("Erro ao carregar o mapa:", err));


// FUNÇÃO QUE CONSTRÓI O GRÁFICO CHART.JS
function gerarGraficoDashboard(geojson) {
    
    // Varre o GeoJSON e cria uma lista com os Nomes (ou com o número do CAR cortado, para caber no gráfico)
    const rotulosGrafico = geojson.features.map(f => {
        if (f.properties.nome) {
            return f.properties.nome;
        } else if (f.properties.recibo) {
            return f.properties.recibo.substring(0, 15) + "..."; 
        } else {
            return "Propriedade";
        }
    });
    
    // Varre o GeoJSON e cria uma lista com as Áreas em Hectares
    const valoresGrafico = geojson.features.map(f => Number(f.properties.Area_ha || 0));

    // Encontra o espaço reservado para o gráfico no HTML
    const contexto = document.getElementById('meuGrafico').getContext('2d');
    
    // Desenha o gráfico de barras
    new Chart(contexto, {
        type: 'bar', // Tipo de gráfico: barras
        data: {
            labels: rotulosGrafico, // O eixo horizontal (Nomes/Recibos)
            datasets: [{
                label: 'Área em Hectares (ha)',
                data: valoresGrafico, // O eixo vertical (Valores)
                backgroundColor: '#4CAF50', // Cor verde ambiental
                borderRadius: 4 // Deixa as pontas das barras arredondadas
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
