// ============================================
// CONFIGURAÇÃO INICIAL E CONSTANTES
// ============================================

// Chave da API (gratuita - até 1500 requisições/mês)
const API_KEY = '1a8c5c3e7b4e4f2a9b0c3d5e7f8a9b0c'; // Esta é uma chave de exemplo
const API_URL = `https://api.exchangerate-api.com/v4/latest/`;

// Elementos do DOM - mapeamos todos os elementos que vamos manipular
const elements = {
    amount: document.getElementById('amount'),
    fromCurrency: document.getElementById('from-currency'),
    toCurrency: document.getElementById('to-currency'),
    fromSymbol: document.getElementById('from-symbol'),
    convertBtn: document.getElementById('convert-btn'),
    swapBtn: document.getElementById('swap-currencies'),
    conversionText: document.getElementById('conversion-text'),
    rateText: document.getElementById('rate-text'),
    lastUpdate: document.getElementById('last-update'),
    ratesTableBody: document.getElementById('rates-table-body'),
    baseCurrency: document.getElementById('base-currency'),
    baseCurrencySymbol: document.getElementById('base-currency-symbol'),
    loadTime: document.getElementById('load-time')
};

// Símbolos das moedas para exibição
const currencySymbols = {
    'BRL': 'R$',
    'USD': 'US$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'CAD': 'C$',
    'AUD': 'A$',
    'CHF': 'CHF',
    'CNY': '¥',
    'ARS': '$'
};

// Nomes completos das moedas
const currencyNames = {
    'BRL': 'Real Brasileiro',
    'USD': 'Dólar Americano',
    'EUR': 'Euro',
    'GBP': 'Libra Esterlina',
    'JPY': 'Iene Japonês',
    'CAD': 'Dólar Canadense',
    'AUD': 'Dólar Australiano',
    'CHF': 'Franco Suíço',
    'CNY': 'Yuan Chinês',
    'ARS': 'Peso Argentino'
};

// Taxas em cache para evitar requisições desnecessárias
let exchangeRatesCache = null;
let lastFetchTime = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos em milissegundos

// ============================================
// FUNÇÕES PRINCIPAIS
// ============================================

/**
 * Função principal que busca as taxas de câmbio da API
 * Implementa cache para melhor performance
 */
async function fetchExchangeRates(baseCurrency = 'BRL') {
    // Verifica se temos dados em cache e se ainda estão válidos
    if (exchangeRatesCache &&
        lastFetchTime &&
        (Date.now() - lastFetchTime) < CACHE_DURATION &&
        exchangeRatesCache.base === baseCurrency) {
        console.log('Usando dados do cache');
    return exchangeRatesCache;
        }

        try {
            // Mostra estado de carregamento
            elements.conversionText.textContent = 'Buscando cotações...';
            elements.conversionText.style.color = '#aaa';

            // Faz a requisição para a API
            const response = await fetch(`${API_URL}${baseCurrency}`);

            if (!response.ok) {
                throw new Error(`Erro na API: ${response.status}`);
            }

            const data = await response.json();

            // Atualiza o cache
            exchangeRatesCache = data;
            lastFetchTime = Date.now();

            console.log('Dados atualizados da API:', data);
            return data;

        } catch (error) {
            console.error('Erro ao buscar taxas:', error);

            // Fallback: usa dados do cache mesmo expirados em caso de erro
            if (exchangeRatesCache) {
                elements.conversionText.textContent = 'Usando dados offline (última cotação disponível)';
                return exchangeRatesCache;
            }

            // Se não há cache, mostra erro
            elements.conversionText.textContent = 'Erro ao conectar com a API. Tente novamente.';
            elements.conversionText.style.color = '#ff6b6b';
            throw error;
        }
}

/**
 * Converte um valor de uma moeda para outra
 */
async function convertCurrency() {
    // Validação do valor de entrada
    const amount = parseFloat(elements.amount.value);
    if (isNaN(amount) || amount <= 0) {
        elements.conversionText.textContent = 'Digite um valor válido!';
        elements.conversionText.style.color = '#ff6b6b';
        return;
    }

    const fromCurrency = elements.fromCurrency.value;
    const toCurrency = elements.toCurrency.value;

    // Verifica se é a mesma moeda
    if (fromCurrency === toCurrency) {
        const symbol = currencySymbols[fromCurrency] || fromCurrency;
        elements.conversionText.innerHTML = `
        <span style="color: #00ced1">${symbol} ${amount.toFixed(2)}</span> =
        <span style="color: #00ced1">${symbol} ${amount.toFixed(2)}</span>
        `;
        elements.rateText.textContent = 'Taxa de câmbio: 1.0000 (mesma moeda)';
        updateLastUpdateTime();
        return;
    }

    try {
        // Busca as taxas
        const ratesData = await fetchExchangeRates(fromCurrency);

        // Obtém a taxa específica para a moeda de destino
        const rate = ratesData.rates[toCurrency];

        if (!rate) {
            throw new Error(`Taxa não encontrada para ${toCurrency}`);
        }

        // Calcula o valor convertido
        const convertedAmount = amount * rate;

        // Formata os valores para exibição
        const fromSymbol = currencySymbols[fromCurrency] || fromCurrency;
        const toSymbol = currencySymbols[toCurrency] || toCurrency;

        // Formatação com separadores de milhar e decimal
        const formatNumber = (num) => {
            return num.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        };

        // Atualiza a interface com o resultado
        elements.conversionText.innerHTML = `
        <span style="color: #8a2be2">${fromSymbol} ${formatNumber(amount)}</span> =
        <span style="color: #00ced1">${toSymbol} ${formatNumber(convertedAmount)}</span>
        `;

        elements.rateText.textContent = `Taxa de câmbio: 1 ${fromCurrency} = ${rate.toFixed(4)} ${toCurrency}`;

        // Atualiza a tabela de taxas
        updateRatesTable(ratesData);

        // Atualiza o tempo da última conversão
        updateLastUpdateTime();

        // Atualiza o símbolo da moeda de origem
        updateCurrencySymbols();

    } catch (error) {
        console.error('Erro na conversão:', error);
        elements.conversionText.textContent = 'Erro na conversão. Verifique sua conexão.';
        elements.conversionText.style.color = '#ff6b6b';
    }
}

/**
 * Atualiza a tabela de taxas de câmbio
 */
function updateRatesTable(ratesData) {
    const base = ratesData.base;
    const rates = ratesData.rates;

    // Atualiza os cabeçalhos da tabela
    elements.baseCurrency.textContent = base;
    elements.baseCurrencySymbol.textContent = currencySymbols[base] || base;

    // Limpa a tabela
    elements.ratesTableBody.innerHTML = '';

    // Filtra apenas as moedas principais para a tabela
    const mainCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'ARS'];
    if (base !== 'BRL') mainCurrencies.push('BRL');

    // Adiciona cada moeda como uma linha na tabela
    mainCurrencies.forEach(currency => {
        if (currency === base || !rates[currency]) return;

        const rate = rates[currency];
        const row = document.createElement('tr');

        row.innerHTML = `
        <td>${currencyNames[currency] || currency}</td>
        <td><strong>${currency}</strong></td>
        <td>${rate.toFixed(4)}</td>
        `;

        elements.ratesTableBody.appendChild(row);
    });

    // Adiciona mensagem se a tabela estiver vazia
    if (elements.ratesTableBody.children.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="3">Nenhuma taxa disponível para exibir</td>`;
        elements.ratesTableBody.appendChild(row);
    }
}

/**
 * Atualiza os símbolos das moedas nos seletores
 */
function updateCurrencySymbols() {
    const fromCurrency = elements.fromCurrency.value;
    elements.fromSymbol.textContent = currencySymbols[fromCurrency] || fromCurrency;
}

/**
 * Inverte as moedas selecionadas
 */
function swapCurrencies() {
    const fromValue = elements.fromCurrency.value;
    const toValue = elements.toCurrency.value;

    // Troca os valores
    elements.fromCurrency.value = toValue;
    elements.toCurrency.value = fromValue;

    // Atualiza os símbolos
    updateCurrencySymbols();

    // Se há um valor digitado, faz a conversão automaticamente
    if (elements.amount.value && parseFloat(elements.amount.value) > 0) {
        convertCurrency();
    }
}

/**
 * Atualiza o timestamp da última atualização
 */
function updateLastUpdateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    elements.lastUpdate.innerHTML = `<i class="far fa-clock"></i> Última atualização: ${timeString}`;
}

/**
 * Carrega a lista de moedas disponíveis da API
 */
async function loadAvailableCurrencies() {
    try {
        // Busca as taxas com base em USD (tem todas as moedas)
        const data = await fetchExchangeRates('USD');
        const currencies = Object.keys(data.rates);

        // Ordena as moedas alfabeticamente
        currencies.sort();

        // Adiciona USD na lista (que é a base)
        currencies.unshift('USD');

        console.log('Moedas disponíveis:', currencies.length, 'moedas');

        // Atualiza os seletores (mantendo a seleção atual se possível)
        updateCurrencySelectors(currencies);

    } catch (error) {
        console.error('Erro ao carregar moedas:', error);
        // Usa a lista padrão em caso de erro
        const defaultCurrencies = ['BRL', 'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'];
        updateCurrencySelectors(defaultCurrencies);
    }
}

/**
 * Atualiza os dropdowns com as moedas disponíveis
 */
function updateCurrencySelectors(currencies) {
    // Salva as seleções atuais
    const currentFrom = elements.fromCurrency.value;
    const currentTo = elements.toCurrency.value;

    // Limpa os seletores
    elements.fromCurrency.innerHTML = '';
    elements.toCurrency.innerHTML = '';

    // Preenche com as moedas disponíveis
    currencies.forEach(currency => {
        const optionFrom = document.createElement('option');
        const optionTo = document.createElement('option');

        const name = currencyNames[currency] || currency;
        optionFrom.value = currency;
        optionFrom.textContent = `${currency} - ${name}`;

        optionTo.value = currency;
        optionTo.textContent = `${currency} - ${name}`;

        elements.fromCurrency.appendChild(optionFrom);
        elements.toCurrency.appendChild(optionTo);
    });

    // Restaura as seleções anteriores se ainda existirem
    if (currencies.includes(currentFrom)) {
        elements.fromCurrency.value = currentFrom;
    }
    if (currencies.includes(currentTo)) {
        elements.toCurrency.value = currentTo;
    }

    // Atualiza os símbolos
    updateCurrencySymbols();
}

/**
 * Formata o campo de valor enquanto o usuário digita
 */
function formatAmountInput() {
    let value = elements.amount.value;

    // Remove tudo que não é número ou ponto decimal
    value = value.replace(/[^\d.]/g, '');

    // Garante que há no máximo um ponto decimal
    const parts = value.split('.');
    if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('');
    }

    // Limita a 2 casas decimais
    if (parts.length === 2 && parts[1].length > 2) {
        value = parts[0] + '.' + parts[1].substring(0, 2);
    }

    elements.amount.value = value;
}

/**
 * Inicializa a aplicação
 */
async function initApp() {
    console.log('Inicializando Conversor de Moedas...');

    // Configura o timestamp de carregamento
    const now = new Date();
    elements.loadTime.textContent = now.toLocaleTimeString('pt-BR');

    // Configura os event listeners
    elements.convertBtn.addEventListener('click', convertCurrency);
    elements.swapBtn.addEventListener('click', swapCurrencies);

    elements.amount.addEventListener('input', formatAmountInput);
    elements.amount.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            convertCurrency();
        }
    });

    elements.fromCurrency.addEventListener('change', () => {
        updateCurrencySymbols();
        if (elements.amount.value && parseFloat(elements.amount.value) > 0) {
            convertCurrency();
        }
    });

    elements.toCurrency.addEventListener('change', () => {
        if (elements.amount.value && parseFloat(elements.amount.value) > 0) {
            convertCurrency();
        }
    });

    // Carrega as moedas disponíveis
    await loadAvailableCurrencies();

    // Faz uma conversão inicial com valores padrão
    await convertCurrency();

    console.log('Aplicação inicializada com sucesso!');
}

// ============================================
// INICIALIZAÇÃO DA APLICAÇÃO
// ============================================

// Inicia a aplicação quando a página carregar
document.addEventListener('DOMContentLoaded', initApp);

// Adiciona suporte para recarregar as taxas manualmente (útil para desenvolvimento)
window.reloadRates = function() {
    exchangeRatesCache = null;
    lastFetchTime = null;
    convertCurrency();
    console.log('Taxas recarregadas manualmente');
};

// Exibe informações úteis no console
console.log(`
╔══════════════════════════════════════╗
║   CONVERSOR DE MOEDAS - INICIADO     ║
║   Comandos disponíveis:              ║
║   • reloadRates() - Recarrega API    ║
╚══════════════════════════════════════╝
`);
