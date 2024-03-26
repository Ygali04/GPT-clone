require('dotenv').config();
const path = require('path');
require('module-alias')({ base: path.resolve(__dirname, '..') });
const cors = require('cors');
const axios = require('axios');
const express = require('express');
const passport = require('passport');
const mongoSanitize = require('express-mongo-sanitize');
const errorController = require('./controllers/ErrorController');
const { jwtLogin, passportLogin } = require('~/strategies');
const configureSocialLogins = require('./socialLogins');
const { connectDb, indexSync } = require('~/lib/db');
const AppService = require('./services/AppService');
const noIndex = require('./middleware/noIndex');
const { isEnabled } = require('~/server/utils');
const { logger } = require('~/config');

const routes = require('./routes');

const { PORT, HOST, ALLOW_SOCIAL_LOGIN } = process.env ?? {};

const port = Number(PORT) || 3080;
const host = HOST || 'localhost';

const startServer = async () => {
  if (typeof Bun !== 'undefined') {
    axios.defaults.headers.common['Accept-Encoding'] = 'gzip';
  }
  await connectDb();
  logger.info('Connected to MongoDB');
  await indexSync();

  const app = express();
  app.disable('x-powered-by');
  await AppService(app);

  app.get('/health', (_req, res) => res.status(200).send('OK'));

  // Middleware
  app.use(noIndex);
  app.use(errorController);
  app.use(express.json({ limit: '3mb' }));
  app.use(mongoSanitize());
  app.use(express.urlencoded({ extended: true, limit: '3mb' }));
  app.use(express.static(app.locals.paths.dist));
  app.use(express.static(app.locals.paths.publicPath));
  app.set('trust proxy', 1); // trust first proxy
  app.use(cors());

  if (!ALLOW_SOCIAL_LOGIN) {
    console.warn(
      'Social logins are disabled. Set Environment Variable "ALLOW_SOCIAL_LOGIN" to true to enable them.',
    );
  }

  // OAUTH
  app.use(passport.initialize());
  passport.use(await jwtLogin());
  passport.use(passportLogin());

  if (isEnabled(ALLOW_SOCIAL_LOGIN)) {
    configureSocialLogins(app);
  }

  app.use('/oauth', routes.oauth);
  // API Endpoints
  app.use('/api/auth', routes.auth);
  app.use('/api/keys', routes.keys);
  app.use('/api/user', routes.user);
  app.use('/api/search', routes.search);
  app.use('/api/ask', routes.ask);
  app.use('/api/edit', routes.edit);
  app.use('/api/messages', routes.messages);
  app.use('/api/convos', routes.convos);
  app.use('/api/presets', routes.presets);
  app.use('/api/prompts', routes.prompts);
  app.use('/api/tokenizer', routes.tokenizer);
  app.use('/api/endpoints', routes.endpoints);
  app.use('/api/balance', routes.balance);
  app.use('/api/models', routes.models);
  app.use('/api/plugins', routes.plugins);
  app.use('/api/config', routes.config);
  app.use('/api/assistants', routes.assistants);
  app.use('/api/files', await routes.files.initialize());

  app.use((req, res) => {
    res.status(404).sendFile(path.join(app.locals.paths.dist, 'index.html'));
  });

  app.listen(port, host, () => {
    if (host == '0.0.0.0') {
      logger.info(
        `Server listening on all interfaces at port ${port}. Use http://localhost:${port} to access it`,
      );
    } else {
      logger.info(`Server listening at http://${host == '0.0.0.0' ? 'localhost' : host}:${port}`);
    }
  });
};

startServer();

let messageCount = 0;
process.on('uncaughtException', (err) => {
  if (!err.message.includes('fetch failed')) {
    logger.error('There was an uncaught error:', err);
  }

  if (err.message.includes('fetch failed')) {
    if (messageCount === 0) {
      logger.warn('Meilisearch error, search will be disabled');
      messageCount++;
    }

    return;
  }

  if (err.message.includes('OpenAIError') || err.message.includes('ChatCompletionMessage')) {
    logger.error(
      '\n\nAn Uncaught `OpenAIError` error may be due to your reverse-proxy setup or stream configuration, or a bug in the `openai` node package.',
    );
    return;
  }

  process.exit(1);
});
