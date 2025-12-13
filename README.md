# 💱 Conversor de Moedas em Tempo Real

![Tema Escuro - Fantasma das Sombras](assets/screenshot.png)

Um conversor de moedas moderno e responsivo que busca cotações em tempo real através de API pública. Desenvolvido com HTML, CSS e JavaScript puro.

## ✨ Funcionalidades

- ✅ **Conversão em tempo real** usando ExchangeRate-API
- ✅ **Tema escuro moderno** (Fantasma das Sombras)
- ✅ **Cache inteligente** (5 minutos para evitar requisições excessivas)
- ✅ **Tabela de taxas** atualizada automaticamente
- ✅ **Inversão rápida** de moedas com um clique
- ✅ **Responsivo** para mobile e desktop
- ✅ **Validação** de entrada em tempo real
- ✅ **Histórico offline** (usa última cotação disponível)

## 🚀 Como Usar

1. Acesse: [https://github.com/N1ghthill/conversor-moeda.git]
2. Digite o valor a converter
3. Selecione as moedas de origem e destino
4. Clique em **"Converter Agora"**
5. Use o botão ↔️ para inverter as moedas rapidamente

## 🛠️ Tecnologias

- **HTML5** - Estrutura semântica
- **CSS3** - Flexbox, Grid, variáveis CSS, tema escuro
- **JavaScript ES6+** - Async/await, fetch API, manipulação de DOM
- **ExchangeRate-API** - Dados de câmbio em tempo real
- **Font Awesome** - Ícones
- **Google Fonts** - Tipografia (Poppins, Roboto Mono)

## 📁 Estrutura do Projeto

conversor-moeda/<br>
├── index.html # Estrutura principal<br>
├── style.css # Estilos (tema escuro)<br>
├── script.js # Lógica e API<br>
├── README.md # Esta documentação<br>
├── LICENSE # Licença MIT<br>
└── assets/ # Recursos visuais<br>
└── screenshot.png # Captura de tela<br>

## 🔧 Instalação Local

```bash
# Clone o repositório
git clone https://github.com/N1ghthill/conversor-moeda.git

# Entre na pasta
cd conversor-moeda

# Instale um servidor local (se necessário)
python3 -m http.server 8080

# Abra no navegador
# http://localhost:8080

