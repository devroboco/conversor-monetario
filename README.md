# Conversor Monetário API
 
API REST desenvolvida em Node.js e TypeScript para conversão de moedas em tempo real, utilizando a AwesomeAPI como provedora de cotações externas. O projeto implementa validações defensivas de entrada, tratamento de exceções, autenticação por API Key e estratégia de cache distribuído com Redis para otimização de requisições.
 
## Tecnologias e Ferramentas
 
- Linguagem e Runtime: Node.js, TypeScript
- Framework Web: Express
- Cliente HTTP: Axios
- Cache Distribuído: Redis (via ioredis)
- Containerização: Docker, Docker Compose
- Qualidade de Código: ESLint, tsx
- Configuração: Dotenv

## Requisitos do Desafio Implementados

- Validação de Entrada: Tratamento defensivo para moedas inválidas/inexistentes e valores negativos ou nulos (```400 Bad Request```).
- Resiliência a Falhas Externas: Tratamento de indisponibilidade da API de cotação externa com retorno padronizado (```503 Service Unavailable```).
- Autenticação: Middleware dedicado para validação de chave de acesso via Header (```401 Unauthorized```).
- Cache Distribuído (Bônus): Cache com TTL de 2 minutos via Redis para evitar requisições redundantes à API externa, sinalizando a origem dos dados (```api``` ou ```cache```) no corpo da resposta.
- Containerização (Bônus): API e Redis orquestrados via Docker Compose, com build em múltiplas etapas para produção.
- Qualidade de Código: Arquitetura dividida em camadas semânticas, tipagem estrita com TypeScript e análise estática configurada via ESLint.

## Estrutura do Projeto

```
conversor-api/
├── src/
│   ├── config/          # Variáveis de ambiente e conexão com Redis
│   ├── controllers/     # Regras de orquestração HTTP (Request/Response)
│   ├── middlewares/     # Middleware de autenticação por API Key
│   ├── routes/          # Mapeamento e registro de rotas da aplicação
│   ├── services/        # Integração com a API externa e gerenciamento de cache
│   ├── types/           # Definições de interfaces e contratos TypeScript
│   ├── utils/           # Funções utilitárias e validações de esquema
│   └── index.ts         # Inicialização do servidor Express
├── docker-compose.yml   # Orquestração da API e do Redis
├── Dockerfile           # Build em múltiplas etapas da API
├── .dockerignore
├── insomnia_collection.json  # Coleção de testes pronta para importar
├── .env.example
├── eslint.config.js
├── tsconfig.json
└── package.json
```

## Instruções de Instalação e Execução

### Pré-requisitos
- Node.js (versão 18.x ou superior) e npm/yarn, **ou**
- Docker e Docker Compose (não requer Node.js nem Redis instalados localmente)

### 1. Clonar o repositório
```
git clone https://github.com/devroboco/conversor-monetario
cd conversor-monetario
```

### 2. Configurar variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto com base no arquivo `.env.example`:
```
PORT=3000
API_KEY=sua_chave_secreta_aqui
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 3a. Execução via Docker (recomendado)

Sobe a API e o Redis juntos, na rede interna do Docker Compose:
```
docker compose up --build
```
A API fica disponível em `http://localhost:3000`. Para derrubar os containers:
```
docker compose down
```
Para derrubar incluindo o volume de dados do Redis (reseta o cache persistido):
```
docker compose down -v
```

### 3b. Execução local (alternativa sem Docker)

Requer um Redis rodando localmente na porta configurada em `REDIS_HOST`/`REDIS_PORT`.

Instalar dependências:
```
npm install
```

Desenvolvimento:
```
npm run dev
```

Compilação e execução em produção:
```
npm run build
npm start
```

### 4. Análise Estática (Lint)
```
npm run lint
```

## Documentação da API

### Autenticação
Todas as requisições para endpoints protegidos exigem o envio da chave configurada através do cabeçalho HTTP `x-api-key`.

`POST /api/convert` (Realiza a conversão monetária entre duas moedas).

### Exemplo de Requisição (Headers):
```
Content-Type: application/json
x-api-key: sua_chave_secreta_aqui
```

### Exemplo de Requisição (Body):
```json
{
  "from": "USD",
  "to": "BRL",
  "amount": 100
}
```

### Resposta de Sucesso (200 OK - Consulta na API Externa):
```json
{
  "from": "USD",
  "to": "BRL",
  "amount": 100,
  "rate": 5.0785,
  "convertedAmount": 507.85,
  "source": "api"
}
```

### Resposta de Sucesso (200 OK - Recuperado do Cache):
```json
{
  "from": "USD",
  "to": "BRL",
  "amount": 100,
  "rate": 5.0785,
  "convertedAmount": 507.85,
  "source": "cache"
}
```

### Respostas de Erro Mapeadas:

- 401 Unauthorized (Chave de API ausente ou incorreta):
```json
{ "error": "API key ausente ou inválida" }
```

- 400 Bad Request (Parâmetro inválido):
```json
{ "error": "Campo \"amount\" deve ser um número positivo" }
```

- 400 Bad Request (Moeda/Par não encontrado):
```json
{ "error": "Par de moedas USD-XYZ não encontrado" }
```

- 503 Service Unavailable (Falha no provedor de cotação):
```json
{ "error": "Serviço de cotação externo indisponível" }
```

## Testando a API

### Opção 1: Importar coleção pronta (Insomnia/Postman)

Importe o arquivo `insomnia_collection.json` (dentro da pasta docs) — já vem com quatro requisições prontas: conversão bem-sucedida, moeda inválida, amount inválido e requisição sem autenticação.

Após importar, edite o header `x-api-key` em cada requisição para o mesmo valor definido no seu `.env`.

### Opção 2: CURL
```bash
curl -X POST http://localhost:3000/api/convert \
  -H "Content-Type: application/json" \
  -H "x-api-key: sua_chave_secreta_aqui" \
  -d '{"from": "USD", "to": "BRL", "amount": 100}'
```
