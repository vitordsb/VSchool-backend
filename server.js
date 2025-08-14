const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

require('dotenv').config();

const app = express();
// Middleware
app.use(cors());
app.use(express.json());

// Conectar ao MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/roadmap-saas')
  .then(() => console.log('Conectado ao MongoDB'))
  .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Rotas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/roadmaps', require('./routes/roadmaps'));
app.use('/api/modules', require('./routes/modules'));
app.use('/api/progress', require('./routes/progress'));

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'API do Roadmap SaaS funcionando!' });
});

const PORT = 5000;

// Configuração para produção
if ("development" === 'production') {
  app.use(express.static('public'));
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

