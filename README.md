# Roadmap SaaS Backend

Backend da plataforma SaaS para ensino de programação com roadmaps personalizados.

## Tecnologias

- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT para autenticação
- bcryptjs para hash de senhas

## Configuração

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente no arquivo `.env`:
```
PORT=5000
MONGODB_URI=sua_string_de_conexao_mongodb
JWT_SECRET=sua_chave_secreta_jwt
NODE_ENV=development
```

3. Execute o servidor:
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## Estrutura do Banco de Dados

### Coleções:
- `users`: Usuários (admin e estudantes)
- `roadmaps`: Roadmaps de estudo
- `modules`: Módulos de cada roadmap
- `studentprogresses`: Progresso dos estudantes

## Endpoints da API

### Autenticação
- `POST /api/auth/login` - Login do usuário
- `GET /api/auth/verify` - Verificar token

### Usuários (apenas admin)
- `POST /api/users` - Criar usuário
- `GET /api/users` - Listar usuários
- `GET /api/users/:id` - Obter usuário específico
- `DELETE /api/users/:id` - Deletar usuário

### Roadmaps
- `POST /api/roadmaps` - Criar roadmap
- `GET /api/roadmaps` - Listar roadmaps do usuário
- `GET /api/roadmaps/:id` - Obter roadmap específico
- `GET /api/roadmaps/shared/:sharedUrl` - Obter roadmap por URL compartilhada
- `PUT /api/roadmaps/:id` - Atualizar roadmap
- `DELETE /api/roadmaps/:id` - Deletar roadmap

### Módulos
- `POST /api/modules` - Criar módulo
- `GET /api/modules/roadmap/:roadmapId` - Listar módulos de um roadmap
- `GET /api/modules/:id` - Obter módulo específico
- `PUT /api/modules/:id` - Atualizar módulo
- `DELETE /api/modules/:id` - Deletar módulo

### Progresso
- `POST /api/progress` - Atualizar progresso de um módulo
- `GET /api/progress/roadmap/:roadmapId` - Obter progresso de um roadmap
- `GET /api/progress/module/:moduleId` - Obter progresso de um módulo
- `GET /api/progress/stats/:roadmapId` - Obter estatísticas (apenas admin)

## Deploy no Render

1. Conecte seu repositório GitHub ao Render
2. Configure as variáveis de ambiente no painel do Render
3. O Render detectará automaticamente que é um projeto Node.js
4. Use o comando de build: `npm install`
5. Use o comando de start: `npm start`

