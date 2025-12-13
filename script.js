// ============================================
// CONFIGURAÇÃO DO APLICATIVO
// ============================================
const API_URL = 'https://api.frankfurter.app/latest';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos em milissegundos
const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutos

// ============================================
// ELEMENTOS DO DOM
// ============================================
const elements = {
    // Inputs
    amount: document.getElementById('amount'),
    fromCurrency: document.getElementById('from-currency'),
    toCurrency: document.getElementById('to-currency'),

    // Botões
    convertBtn: document.getElementById('convert-btn'),
    swapBtn: document.getElementById('swap-currencies'),
    refreshBtn: document.getElementById('refresh-btn'),

    // Resultados
    resultText: document.getElementById('conversion-text'),
    rateText: document.getElementById('rate-text'),
    updateTime: document.getElementById('last-update'),
    currencySymbol: document.getElementById('from-symbol'),

    // Tabela
    ratesTableBody: document.getElementById('rates-table-body'),
    baseCurrency: document.getElementById('base-currency'),
    baseCurrencySymbol: document.getElementById('base-currency-symbol'),

    // Timers
    loadTime: document.getElementById('load-time'),
    refreshTimer: document.getElementById('refresh-timer'),

    // Notificação
    notification: document.getElementById('notification')
};

// ============================================
// DADOS DAS MOEDAS
// ============================================
const currencySymbols = {
    'BRL': 'R$', 'USD': 'US$', 'EUR': '€', 'GBP': '£',
    'JPY': '¥', 'CAD': 'C$', 'AUD': 'A$', 'CHF': 'CHF',
    'CNY': '¥', 'ARS': '$', 'MXN': '$', 'INR': '₹'
};

const currencyNames = {
    'BRL': 'Real Brasileiro', 'USD': 'Dólar Americano',
    'EUR': 'Euro', 'GBP': 'Libra Esterlina',
    'JPY': 'Iene Japonês', 'CAD': 'Dólar Canadense',
    'AUD': 'Dólar Australiano', 'CHF': 'Franco Suíço',
    'ARS': 'Peso Argentino', 'MXN': 'Peso Mexicano'
};

// Cache e Estado
let ratesCache = {};
let cacheTimestamp = null;
let autoRefreshInterval = null;
let refreshCountdown = 300; // 5 minutos em segundos

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

/**
 * Verifica elementos do DOM
 */
function verifyElements() {
    let allFound = true;
    for (const [key, element] of Object.entries(elements)) {
        if (!element) {
            console.warn(`Elemento não encontrado: ${key}`);
            allFound = false;
        }
    }
    return allFound;
}

/**
 * Formata números com separadores
 */
function formatNumber(num) {
    return num.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

/**
 * Mostra notificação
 */
function showNotification(message, type = 'success') {
    if (!elements.notification) return;

    elements.notification.textContent = message;
    elements.notification.className = `notification ${type}`;
    elements.notification.classList.add('show');

    setTimeout(() => {
        elements.notification.classList.remove('show');
    }, 3000);
}

/**
 * Atualiza contador de refresh
 */
function updateRefreshTimer() {
    if (!elements.refreshTimer) return;

    refreshCountdown--;

    if (refreshCountdown <= 0) {
        refreshCountdown = 300; // Reset para 5 minutos
    }

    const minutes = Math.floor(refreshCountdown / 60);
    const seconds = refreshCountdown % 60;

    elements.refreshTimer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Atualiza timestamp de carregamento
 */
function updateLoadTimestamp() {
    if (elements.loadTime) {
        elements.loadTime.textContent = new Date().toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }
}

/**
 * Formata input enquanto digita
 */
function formatAmountInput() {
    let value = elements.amount.value;

    // Remove tudo que não é número ou ponto
    value = value.replace(/[^\d.]/g, '');

    // Garante apenas um ponto decimal
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

// ============================================
// FUNÇÕES PRINCIPAIS
// ============================================

/**
 * Busca taxas de câmbio da API
 */
async function fetchExchangeRates(baseCurrency = 'BRL') {
    // Verifica cache
    if (ratesCache[baseCurrency] && cacheTimestamp) {
        const cacheAge = Date.now() - cacheTimestamp;
        if (cacheAge < CACHE_DURATION) {
            console.log('📦 Usando dados em cache');
            updateRatesTable(ratesCache[baseCurrency]);
            return ratesCache[baseCurrency];
        }
    }

    try {
        // Estado de carregamento
        if (elements.resultText) {
            elements.resultText.textContent = '📡 Conectando à API...';
            elements.resultText.style.color = '#aaa';
        }

        // Faz requisição à API
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`Erro na API: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Dados recebidos:', data);

        // Se a moeda base for EUR, retorna direto
        if (baseCurrency === 'EUR') {
            ratesCache[baseCurrency] = data;
            cacheTimestamp = Date.now();
            updateRatesTable(data);
            return data;
        }

        // Converte para outras moedas base
        const eurToBase = data.rates[baseCurrency];
        if (!eurToBase) {
            throw new Error(`Moeda ${baseCurrency} não suportada`);
        }

        // Calcula taxas convertidas
        const convertedRates = {};
        for (const [currency, rateInEUR] of Object.entries(data.rates)) {
            convertedRates[currency] = eurToBase / rateInEUR;
        }
        convertedRates[baseCurrency] = 1;

        const convertedData = {
            base: baseCurrency,
            rates: convertedRates,
            date: data.date
        };

        // Atualiza cache
        ratesCache[baseCurrency] = convertedData;
        cacheTimestamp = Date.now();

        // Atualiza tabela
        updateRatesTable(convertedData);

        return convertedData;

    } catch (error) {
        console.error('❌ Erro na API:', error);

        // Dados de fallback
        const fallbackRates = getFallbackRates(baseCurrency);
        if (fallbackRates) {
            showNotification('⚠️ Usando dados offline', 'warning');
            updateRatesTable(fallbackRates);
            return fallbackRates;
        }

        throw error;
    }
}

/**
 * Retorna dados de fallback
 */
function getFallbackRates(baseCurrency) {
    const fallbackData = {
        'BRL': {
            base: 'BRL',
            rates: {
                'USD': 0.185, 'EUR': 0.170, 'GBP': 0.145, 'JPY': 28.5,
                'CAD': 0.25, 'AUD': 0.28, 'CHF': 0.16, 'ARS': 45.2,
                'BRL': 1
            }
        },
        'USD': {
            base: 'USD',
            rates: {
                'BRL': 5.40, 'EUR': 0.92, 'GBP': 0.78, 'JPY': 154.0,
                'CAD': 1.36, 'AUD': 1.52, 'CHF': 0.88, 'ARS': 245.5,
                'USD': 1
            }
        },
        'EUR': {
            base: 'EUR',
            rates: {
                'BRL': 5.88, 'USD': 1.09, 'GBP': 0.85, 'JPY': 168.0,
                'CAD': 1.48, 'AUD': 1.66, 'CHF': 0.96, 'ARS': 267.8,
                'EUR': 1
            }
        }
    };

    return fallbackData[baseCurrency];
}

/**
 * Atualiza tabela de taxas
 */
function updateRatesTable(data) {
    if (!elements.ratesTableBody || !data?.rates) return;

    // Atualiza moeda base
    if (elements.baseCurrency) {
        elements.baseCurrency.textContent = data.base;
    }
    if (elements.baseCurrencySymbol) {
        elements.baseCurrencySymbol.textContent = currencySymbols[data.base] || data.base;
    }

    // Limpa e preenche tabela
    elements.ratesTableBody.innerHTML = '';

    const sortedCurrencies = Object.keys(data.rates)
    .filter(currency => currency !== data.base)
    .sort();

    sortedCurrencies.forEach(currency => {
        const rate = data.rates[currency];
        const row = document.createElement('tr');

        row.innerHTML = `
        <td><strong>${currency}</strong> - ${currencyNames[currency] || currency}</td>
        <td>${rate.toFixed(4)}</td>
        `;

        // Adiciona evento de clique
        row.addEventListener('click', () => {
            elements.toCurrency.value = currency;
            if (elements.amount.value) {
                convertCurrency();
            }
        });

        elements.ratesTableBody.appendChild(row);
    });
}

/**
 * Converte moedas
 */
async function convertCurrency() {
    // Validação básica
    if (!elements.amount || !elements.fromCurrency || !elements.toCurrency) {
        return;
    }

    const amount = parseFloat(elements.amount.value);
    const fromCurrency = elements.fromCurrency.value;
    const toCurrency = elements.toCurrency.value;

    // Validação de entrada
    if (!amount || amount <= 0 || isNaN(amount)) {
        if (elements.resultText) {
            elements.resultText.textContent = '⚠️ Digite um valor válido!';
            elements.resultText.style.color = '#ff6b6b';
        }
        return;
    }

    // Mesma moeda
    if (fromCurrency === toCurrency) {
        const symbol = currencySymbols[fromCurrency] || fromCurrency;
        if (elements.resultText) {
            elements.resultText.innerHTML = `
            <span style="color: #8a2be2">${symbol} ${amount.toFixed(2)}</span> =
            <span style="color: #00ced1">${symbol} ${amount.toFixed(2)}</span>
            `;
        }
        if (elements.rateText) {
            elements.rateText.textContent = '💱 Taxa: 1.0000 (mesma moeda)';
        }
        updateTimestamp();
        return;
    }

    try {
        // Busca taxas
        const ratesData = await fetchExchangeRates(fromCurrency);
        const rate = ratesData.rates[toCurrency];

        if (!rate) {
            throw new Error(`Moeda ${toCurrency} não disponível`);
        }

        // Calcula conversão
        const convertedAmount = amount * rate;
        const fromSymbol = currencySymbols[fromCurrency] || fromCurrency;
        const toSymbol = currencySymbols[toCurrency] || toCurrency;

        // Atualiza interface
        if (elements.resultText) {
            elements.resultText.innerHTML = `
            <span style="color: #8a2be2">${fromSymbol} ${formatNumber(amount)}</span> =
            <span style="color: #00ced1">${toSymbol} ${formatNumber(convertedAmount)}</span>
            `;
            elements.resultText.style.color = '';
        }

        if (elements.rateText) {
            elements.rateText.textContent = `💱 1 ${fromCurrency} = ${rate.toFixed(4)} ${toCurrency}`;
        }

        if (elements.currencySymbol) {
            elements.currencySymbol.textContent = fromSymbol;
        }

        updateTimestamp();

    } catch (error) {
        console.error('Erro na conversão:', error);
        if (elements.resultText) {
            elements.resultText.innerHTML = '❌ Erro ao converter. Tente BRL ↔ USD/EUR.';
            elements.resultText.style.color = '#ff6b6b';
        }
        if (elements.rateText) {
            elements.rateText.textContent = '💡 Dica: Use moedas principais';
        }
        showNotification('Erro na conversão', 'error');
    }
}

/**
 * Atualiza timestamp da conversão
 */
function updateTimestamp() {
    if (!elements.updateTime) return;

    const now = new Date();
    const timeString = now.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    elements.updateTime.innerHTML = `
    <i class="far fa-clock"></i> Última atualização: ${timeString}
    `;
}

/**
 * Troca moedas de posição
 */
function swapCurrencies() {
    const fromValue = elements.fromCurrency.value;
    const toValue = elements.toCurrency.value;

    // Troca valores
    elements.fromCurrency.value = toValue;
    elements.toCurrency.value = fromValue;

    // Atualiza símbolo
    const symbol = currencySymbols[elements.fromCurrency.value] || elements.fromCurrency.value;
    if (elements.currencySymbol) {
        elements.currencySymbol.textContent = symbol;
    }

    // Converte automaticamente se houver valor
    if (elements.amount?.value && parseFloat(elements.amount.value) > 0) {
        convertCurrency();
    }
}

/**
 * Atualização manual das taxas
 */
async function manualRefresh() {
    if (!elements.refreshBtn) return;

    // Estado de carregamento
    elements.refreshBtn.classList.add('updating');
    elements.refreshBtn.disabled = true;

    try {
        // Limpa cache
        ratesCache = {};
        cacheTimestamp = null;
        refreshCountdown = 300; // Reset timer

        // Busca novas taxas
        await fetchExchangeRates(elements.fromCurrency.value);

        // Atualiza conversão atual
        if (elements.amount?.value && parseFloat(elements.amount.value) > 0) {
            await convertCurrency();
        }

        showNotification('✅ Taxas atualizadas com sucesso!');

    } catch (error) {
        console.error('Erro ao atualizar:', error);
        showNotification('❌ Erro ao atualizar taxas', 'error');
    } finally {
        // Restaura botão
        setTimeout(() => {
            elements.refreshBtn.classList.remove('updating');
            elements.refreshBtn.disabled = false;
        }, 1000);
    }
}

/**
 * Inicia atualização automática
 */
function startAutoRefresh() {
    // Limpa intervalo anterior
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
    }

    // Inicia contador
    setInterval(updateRefreshTimer, 1000);

    // Configura auto-refresh
    autoRefreshInterval = setInterval(async () => {
        console.log('🔄 Atualização automática iniciada...');

        try {
            // Limpa cache
            ratesCache = {};
            cacheTimestamp = null;

            // Atualiza taxas
            await fetchExchangeRates(elements.fromCurrency.value);

            // Atualiza conversão atual
            if (elements.amount?.value && parseFloat(elements.amount.value) > 0) {
                await convertCurrency();
            }

            // Notificação silenciosa
            console.log('✅ Taxas atualizadas automaticamente');

        } catch (error) {
            console.error('Erro no auto-refresh:', error);
        }
    }, AUTO_REFRESH_INTERVAL);

    console.log(`⏰ Auto-refresh configurado para ${AUTO_REFRESH_INTERVAL / 60000} minutos`);
}

// ============================================
// INICIALIZAÇÃO
// ============================================
async function initApp() {
    console.log('🚀 Conversor de Moedas iniciado');

    // Verifica elementos
    if (!verifyElements()) {
        console.warn('⚠️ Alguns elementos não foram encontrados');
    }

    // Configura timestamps
    updateLoadTimestamp();
    updateTimestamp();

    // Configura event listeners
    setupEventListeners();

    // Adiciona mais moedas aos selects
    populateCurrencySelects();

    // Inicia auto-refresh
    startAutoRefresh();

    // Primeira conversão
    try {
        await convertCurrency();
        console.log('✅ Aplicação pronta!');
    } catch (error) {
        console.log('⚠️ Primeira carga falhou, usando dados offline');
    }
}

/**
 * Configura todos os event listeners
 */
function setupEventListeners() {
    // Botão de conversão
    if (elements.convertBtn) {
        elements.convertBtn.addEventListener('click', convertCurrency);
    }

    // Botão de troca
    if (elements.swapBtn) {
        elements.swapBtn.addEventListener('click', swapCurrencies);
    }

    // Botão de atualização
    if (elements.refreshBtn) {
        elements.refreshBtn.addEventListener('click', manualRefresh);
    }

    // Input de valor
    if (elements.amount) {
        elements.amount.addEventListener('input', formatAmountInput);
        elements.amount.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') convertCurrency();
        });
    }

    // Mudança de moedas
    if (elements.fromCurrency) {
        elements.fromCurrency.addEventListener('change', () => {
            // Atualiza símbolo
            const symbol = currencySymbols[elements.fromCurrency.value] || elements.fromCurrency.value;
            if (elements.currencySymbol) {
                elements.currencySymbol.textContent = symbol;
            }

            // Conversão automática
            if (elements.amount?.value && parseFloat(elements.amount.value) > 0) {
                convertCurrency();
            }
        });
    }

    if (elements.toCurrency) {
        elements.toCurrency.addEventListener('change', () => {
            if (elements.amount?.value && parseFloat(elements.amount.value) > 0) {
                convertCurrency();
            }
        });
    }
}

/**
 * Adiciona moedas aos selects
 */
function populateCurrencySelects() {
    if (!elements.fromCurrency || !elements.toCurrency) return;

    const additionalCurrencies = ['GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'ARS'];

    additionalCurrencies.forEach(currency => {
        if (currencyNames[currency]) {
            const optionText = `${currency} - ${currencyNames[currency]}`;

            const optionFrom = new Option(optionText, currency);
            const optionTo = new Option(optionText, currency);

            elements.fromCurrency.add(optionFrom);
            elements.toCurrency.add(optionTo);
        }
    });
}

// ============================================
// INICIALIZAÇÃO DA APLICAÇÃO
// ============================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// ============================================
// FUNÇÕES DE DEBUG (opcional)
// ============================================
window.debugConverter = {
    clearCache: () => {
        ratesCache = {};
        cacheTimestamp = null;
        console.log('🧹 Cache limpo');
        convertCurrency();
    },
    showCache: () => {
        console.log('📦 Cache atual:', ratesCache);
    },
    forceUpdate: () => {
        manualRefresh();
    },
    getRates: () => ratesCache
};
