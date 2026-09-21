// 6. FUNÇÃO DE GERAÇÃO DO PDF
function gerarPDF() {
    // Esconde os controles do mapa (botões de zoom) antes de tirar a foto
    const controlesMapa = document.querySelector('.leaflet-control-container');
    controlesMapa.style.display = 'none';

    // Pega a tela inteira (o container) para transformar em PDF
    const elemento = document.getElementById('area-relatorio');

    // Configurações da página do PDF
    const configuracao = {
        margin:       0,
        filename:     'Relatorio_CAR_Itapetinga.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true }, // scale: 2 garante alta resolução
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'landscape' } // landscape para caber o mapa e o gráfico lado a lado
    };

    // Gera o PDF, baixa para o computador e depois liga os controles do mapa de volta
    html2pdf().set(configuracao).from(elemento).save().then(() => {
        controlesMapa.style.display = 'block';
    });
}
