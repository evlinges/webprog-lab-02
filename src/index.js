// Точка входу: запуск HTTP-сервера та коректне завершення роботи.
const app = require('./app');
const config = require('./config/env');
const prisma = require('./models/prisma');

const server = app.listen(config.port, () => {
  console.log(`🚀 Сервер Rezanok API запущено: http://localhost:${config.port}`);
  console.log(`   Середовище: ${config.nodeEnv}`);
});

// Коректне закриття зʼєднань із БД при зупинці процесу.
async function shutdown(signal) {
  console.log(`\n${signal} отримано — завершую роботу...`);
  server.close(async () => {
    await prisma.$disconnect();
    console.log('Зʼєднання з базою закрито. Бувай!');
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

module.exports = server;
