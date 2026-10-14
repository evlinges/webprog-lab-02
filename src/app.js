// Складання Express-застосунку: middleware безпеки, парсери, логування,
// документація Swagger, маршрути API та обробники помилок. Створення сервера
// винесене в index.js.
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

const config = require('./config/env');
const apiRoutes = require('./routes');
const swaggerSpec = require('./config/swagger');
const { apiLimiter } = require('./middleware/rateLimit');
const { notFound, errorHandler } = require('./utils/errorHandler');

const app = express();

// Безпекові заголовки
app.use(helmet());

// CORS: * або список джерел через кому
app.use(
  cors({
    origin: config.corsOrigin === '*' ? '*' : config.corsOrigin.split(',').map((s) => s.trim()),
  })
);

// Парсинг тіла запиту
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Логування запитів (окрім тестового середовища)
if (config.nodeEnv !== 'test') app.use(morgan('dev'));

// Інтерактивна документація API (Swagger UI) та «сира» специфікація OpenAPI.
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api/docs.json', (req, res) => res.json(swaggerSpec));

// Обмеження частоти запитів для всього API (окрім тестів, щоб не заважати).
if (config.nodeEnv !== 'test') app.use('/api', apiLimiter);

// Кореневий маршрут — коротка довідка
app.get('/', (req, res) => {
  res.json({
    name: 'Rezanok API',
    description:
      'Backend системи обліку замовлень майстерні нагород (ЛР2, «Вебпрограмування»): ' +
      'аутентифікація, авторизація, файли, пошук і пагінація',
    version: '2.0.0',
    docs: '/api/docs',
    endpoints: [
      'GET  /api/health',
      'POST /api/auth/register | login | refresh | logout | change-password',
      'GET  /api/auth/me',
      'CRUD /api/files (+ /bulk, /:id/download)',
      'CRUD /api/clients',
      'CRUD /api/employees',
      'CRUD /api/stock-items',
      'CRUD /api/orders',
      'CRUD /api/order-items',
      'CRUD /api/production-stages',
      'CRUD /api/payments',
      'CRUD /api/shipments',
    ],
  });
});

// Маршрути API
app.use('/api', apiRoutes);

// 404 та централізована обробка помилок (реєструються останніми)
app.use(notFound);
app.use(errorHandler);

module.exports = app;
