<div align="center">

# 💱 Conversor de Moedas 2.0
**Conversor moderno com atualização automática, cache e tabela interativa de taxas.**  
Modern currency converter with auto-refresh, caching and an interactive rates table.

<br/>

🔗 **Demo:** https://n1ghthill.github.io/conversor-moeda/

<br/>

![Status](https://img.shields.io/badge/status-active-success)
![Stack](https://img.shields.io/badge/stack-HTML%20%7C%20CSS%20%7C%20JS-blue)
![API](https://img.shields.io/badge/API-Frankfurter-informational)
![License](https://img.shields.io/badge/license-MIT-green)

</div>

---

## ✨ Visão | Overview
O **Conversor de Moedas 2.0** foi feito para ser rápido, claro e “plugável” — ideal para uso como **widget embutido em portfólios, dashboards ou páginas de ferramentas.**

Currency Converter 2.0 is built to be fast, clean and embeddable — perfect as a **widget inside portfolios, dashboards or tools pages.**

---

## 🚀 Recursos | Features
- ⚡ **Cotações em tempo real** via Frankfurter API  
- 🔄 **Auto-refresh** a cada 5 minutos + botão de atualização manual  
- 🧠 **Cache local** para reduzir chamadas e acelerar carregamento  
- 📊 **Tabela interativa** (troca de moeda base com 1 clique)  
- 🌙 **Tema escuro** + UI responsiva (mobile-first)

---

## 🖼️ Screenshot
![Screenshot](assets/Captura%20de%20tela%20de%202025-12-13%2014-36-39.png)

---

## 🧱 Stack
- HTML5, CSS3, JavaScript (ES6+)
- Frankfurter API
- Font Awesome + Google Fonts

---

## ▶️ Como rodar localmente | Run locally
### Opção 1 — Abrir direto
- Abra o `index.html` no navegador.

### Opção 2 — Servir com Python (recomendado)
- python -m http.server

### Acesse: http://localhost:8000

## 🔌 API utilizada | Data source

- Dados fornecidos pela Frankfurter API (taxas atualizadas com base no ECB).
- Rates provided by Frankfurter API (ECB-based exchange rates).

## 🧩 Embed no seu site | Embed into your site

### Você pode embutir o conversor de duas formas:

## ✅ 1) Via iframe (mais simples)

<iframe
  src="https://n1ghthill.github.io/conversor-moeda/"
  width="100%"
  height="720"
  style="border:0; border-radius:16px;"
  loading="lazy"
></iframe>

## ✅ 2) Como módulo interno (mais profissional)

- Transformar em uma pasta /apps/conversor/
- Reaproveitar o CSS do seu site
- Integrar com seu “hub” de projetos
- Planejado: versão “widget” com export e configuração por parâmetros.

## 🗺️ Roadmap

- Suporte a favoritos (moedas mais usadas)
- Histórico simples (últimas conversões)
- Atalhos rápidos (USD, EUR, BRL)
- Modo “widget” (embed + config)
- Melhorar acessibilidade (aria + navegação teclado)

## 📄 Licença | License

MIT — consulte LICENSE.
