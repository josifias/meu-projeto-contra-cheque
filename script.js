function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function lerInput(id) {
    let valorTexto = document.getElementById(id).value.trim();
    valorTexto = valorTexto.replace(',', '.');
    let numero = parseFloat(valorTexto);
    return isNaN(numero) ? 0 : numero;
}

function calcularContraCheque() {
    const hSD = lerInput('horasSD');
    const hSN = lerInput('horasSN');
    const hFD = lerInput('horasFD');
    const hFN = lerInput('horasFN');

    const valorSD = hSD * 21.60;
    const valorSN = hSN * 25.35;
    const valorFD = hFD * 24.80;
    const valorFN = hFN * 29.05;

    const rendaBruta = valorSD + valorSN + valorFD + valorFN;
    if (rendaBruta <= 0) {
        alert("Por favor, digite as horas trabalhadas em pelo menos um dos campos.");
        return;
    }

    const salarioMinimo = 1518.00;
    const tentoINSS = 8157.41;

    let baseINSS = rendaBruta;
    if (baseINSS < salarioMinimo) baseINSS = 0;
    if (baseINSS > tentoINSS) baseINSS = tentoINSS;
        
    const descontoINSS = baseINSS * 0.20;
    let baseCalculoIR = rendaBruta - descontoINSS;
    if (baseCalculoIR < 0) baseCalculoIR = 0;

    let aliquotaIR = 0;
    let parcelaDeducaoIR = 0;

    if (baseCalculoIR <= 2428.80) {
        aliquotaIR = 0;
        parcelaDeducaoIR = 0;
    } else if (baseCalculoIR <= 2826.65) {
        aliquotaIR = 0.075;
        parcelaDeducaoIR = 182.16;
    } else if (baseCalculoIR <= 3751.05) {
        aliquotaIR = 0.15;
        parcelaDeducaoIR = 394.16;
    } else if (baseCalculoIR <= 4664.68) {
        aliquotaIR = 0.225;
        parcelaDeducaoIR = 675.49;
    } else {
        aliquotaIR = 0.275; 
        parcelaDeducaoIR = 908.73;
    }

    let impostoBruto = (baseCalculoIR * aliquotaIR) - parcelaDeducaoIR;
    if (impostoBruto < 0) impostoBruto = 0;
    let redutorAdicional = 0;
    if (rendaBruta <= 5000.00) {
        redutorAdicional = impostoBruto;
    } else if (rendaBruta <= 7350.00) {
        redutorAdicional = 978.62 - (0.133145 * rendaBruta);
        if (redutorAdicional < 0) redutorAdicional = 0;
    }

    let impostoFinal = impostoBruto - redutorAdicional;
    if (impostoFinal < 0) impostoFinal = 0;

    const totalDescontos = descontoINSS + impostoFinal;
    const valorLiquido = rendaBruta - totalDescontos;
    let htmlCorpo = "";

    if (hSD > 0) htmlCorpo += `<tr><td>Plantão Semana Diurno (${hSD}h)</td><td class="text-right">${formatarMoeda(valorSD)}</td><td></td></tr>`;
    if (hSN > 0) htmlCorpo += `<tr><td>Plantão Semana Noturno (${hSN}h)</td><td class="text-right">${formatarMoeda(valorSN)}</td><td></td></tr>`;
    if (hFD > 0) htmlCorpo += `<tr><td>Plantão Fim de Semana Diurno (${hFD}h)</td><td class="text-right">${formatarMoeda(valorFD)}</td><td></td></tr>`;
    if (hFN > 0) htmlCorpo += `<tr><td>Plantão Fim de Semana Noturno (${hFN}h)</td><td class="text-right">${formatarMoeda(valorFN)}</td><td></td></tr>`;
    
    htmlCorpo += `
        <tr>
            <td>INSS Contrib. Indiv. (20%)</td>
            <td></td>
            <td class="text-right text-desconto">-${formatarMoeda(descontoINSS)}</td>
        </tr>
        <tr>
            <td>IRRF Retido na Fonte</td>
            <td></td>
            <td class="text-right text-desconto">${impostoFinal > 0 ? '-' + formatarMoeda(impostoFinal) : "Isento"}</td>
        </tr>
        <tr class="linha-total">
            <td>TOTAL</td>
            <td class="text-right">${formatarMoeda(rendaBruta)}</td>
            <td class="text-right text-desconto">-${formatarMoeda(totalDescontos)}</td>
        </tr>
        <tr class="linha-liquido">
            <td>VALOR LÍQUIDO A RECEBER</td>
            <td class="text-right" colspan="2">${formatarMoeda(valorLiquido)}</td>
        </tr>
    `;

    document.getElementById('corpoTabela').innerHTML = htmlCorpo;
    document.getElementById('basesCalculo').innerText = `Ref. Base INSS: ${formatarMoeda(baseINSS)} | Base IRRF: ${formatarMoeda(baseCalculoIR)}`;

    const blocoRecibo = document.getElementById('contraCheque');
    blocoRecibo.style.display = "block";
    blocoRecibo.scrollIntoView({ behavior: 'smooth' });
}