# SAFA - Sistema de Análise Fenológica Automatizada

O SAFA é uma aplicação web desenvolvida em React que permite realizar diagnósticos inteligentes de culturas agrícolas através da análise de dados de satélite (NDVI) e informações climáticas. O sistema combina dados fenológicos de referência com análises em tempo real para fornecer insights sobre o desenvolvimento das culturas.

## 🌱 Funcionalidades Principais

### Análise de Culturas
- **Suporte a múltiplas culturas**: Soja, Milho (1ª safra e safrinha), Trigo, Arroz Irrigado, Fumo, Maçã e Uva
- **Análise fenológica**: Comparação entre NDVI observado e valores esperados para cada estágio de desenvolvimento
- **Diagnóstico inteligente**: Identificação automática de problemas de vigor vegetativo

### Interface Interativa
- **Mapa interativo**: Desenho de polígonos para delimitar áreas de análise usando Leaflet
- **Busca geográfica**: Localização de endereços através de geocoding
- **Visualização de dados**: Gráficos de curva de vida da lavoura e tabelas de diagnóstico
- **Múltiplas camadas**: Visualização de imagens de satélite e tiles NDVI

### Dados e Análises
- **Base de dados fenológica**: Informações detalhadas sobre estágios de desenvolvimento de cada cultura
- **Análise climática**: Dados de temperatura e precipitação por período
- **Tiles NDVI**: Visualização de imagens de satélite processadas
- **Relatórios visuais**: Tabelas de diagnóstico com status de vigor vegetativo

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 19.1.1** - Framework principal
- **Vite 7.1.2** - Build tool e servidor de desenvolvimento
- **Tailwind CSS 4.1.12** - Framework de estilização
- **Leaflet 1.9.4** - Biblioteca de mapas interativos
- **Chart.js 4.5.0** - Visualização de gráficos

### Bibliotecas Específicas
- **react-leaflet 5.0.0** - Componentes React para Leaflet
- **leaflet-draw 1.0.4** - Ferramentas de desenho no mapa
- **leaflet-geosearch 4.2.0** - Busca geográfica
- **react-chartjs-2 5.3.0** - Componentes React para Chart.js
- **axios 1.11.0** - Cliente HTTP para APIs

### Ferramentas de Desenvolvimento
- **ESLint 9.33.0** - Linting de código
- **PostCSS 8.5.6** - Processamento de CSS
- **Autoprefixer 10.4.21** - Prefixos CSS automáticos

## 📁 Estrutura do Projeto

```
sistema-safa/
├── src/
│   ├── components/          # Componentes React
│   │   ├── AnalysisForm.jsx     # Formulário de análise
│   │   ├── DiagnosticTable.jsx  # Tabela de diagnóstico
│   │   ├── Map.jsx              # Componente do mapa
│   │   ├── PhenologyChart.jsx   # Gráfico de fenologia
│   │   └── TileSelector.jsx     # Seletor de tiles
│   ├── api/                # Integração com APIs
│   │   └── geeApi.js           # API do Google Earth Engine
│   ├── data/               # Dados estáticos
│   │   └── phenologyDatabase.json # Base de dados fenológica
│   ├── utils/              # Utilitários
│   │   └── phenologyProcessor.js  # Processamento de dados fenológicos
│   ├── App.jsx             # Componente principal
│   └── main.jsx            # Ponto de entrada
├── public/                 # Arquivos estáticos
├── dist/                   # Build de produção
└── config files           # Configurações (Vite, Tailwind, ESLint)
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js (versão 18 ou superior)
- npm ou yarn

### Instalação
```bash
# Clone o repositório
git clone <url-do-repositorio>
cd sistema-safa

# Instale as dependências
npm install

# Execute em modo de desenvolvimento
npm run dev
```

### Scripts Disponíveis
- `npm run dev` - Servidor de desenvolvimento com hot reload
- `npm run build` - Build de produção
- `npm run preview` - Preview do build de produção
- `npm run lint` - Verificação de linting

## 🌐 Configuração da API

O sistema se conecta a uma API externa para processamento de dados de satélite:

- **Desenvolvimento**: `/api` (proxy para `https://map.silasogis.com`)
- **Produção**: `https://map.silasogis.com`

### Endpoints Utilizados
- `POST /ndvi_composite` - Análise de NDVI por períodos
- `POST /climate_stats` - Dados climáticos por períodos

## 📊 Base de Dados Fenológica

O sistema inclui uma base de dados abrangente com informações sobre:

### Culturas Suportadas
- **Soja** (Glycine max) - Escala Fehr & Caviness
- **Milho 1ª Safra** (Zea mays) - Escala Ritchie, Hanway & Benson
- **Milho Safrinha** (Zea mays) - Escala Ritchie, Hanway & Benson
- **Trigo** (Triticum aestivum) - Escala Zadoks
- **Arroz Irrigado** (Oryza sativa) - Estágios V e R
- **Fumo** (Nicotiana tabacum) - Dados hipotéticos
- **Maçã** (Malus domestica) - Estágios sazonais
- **Uva** (Vitis vinifera) - Escala BBCH

### Informações por Estágio
- Código e descrição do estágio
- Período de desenvolvimento (dias após semeadura ou meses)
- Faixas esperadas de NDVI (mínimo e máximo)
- Notas técnicas e observações

## 🎯 Como Usar

1. **Selecione a área**: Use as ferramentas de desenho no mapa para delimitar o talhão
2. **Preencha os dados**: Informe o nome do talhão, cultura e data de plantio
3. **Gere o diagnóstico**: Clique em "Gerar Diagnóstico" para processar os dados
4. **Analise os resultados**: Visualize gráficos, tabelas e tiles de satélite
5. **Interprete os dados**: Compare NDVI observado com valores esperados

## 🔧 Configurações Avançadas

### Proxy de Desenvolvimento
O Vite está configurado com proxy para redirecionar requisições `/api` para a API de produção durante o desenvolvimento.

### Build de Produção
O sistema está configurado para deploy no GitHub Pages com base URL `/Sistema-de-Analise-Fenologica-Automatizada-SAFA/`.

## 📈 Monitoramento e Diagnóstico

O sistema fornece:
- **Status de vigor**: Normal, Atenção, Vigor Baixo, Vigor Excepcional
- **Comparação temporal**: NDVI observado vs. esperado por estágio
- **Dados climáticos**: Temperatura e precipitação por período
- **Visualização espacial**: Tiles de satélite sobrepostos no mapa

## 🤝 Contribuição

Para contribuir com o projeto:
1. Faça um fork do repositório
2. Crie uma branch para sua feature
3. Implemente as mudanças
4. Execute os testes e linting
5. Submeta um pull request

## 📄 Licença

Este projeto está sob licença [especificar licença].

## 📞 Suporte

Para dúvidas ou suporte, entre em contato através de soliveira795@gmail.com.