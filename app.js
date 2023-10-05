require('dotenv').config();

require('./db');

const express = require('express');

const { isAuthenticated } = require('./middleware/jwt.middleware');
const app = express();
const cors = require('cors');

// 👇 Configure CORS
const corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

require('./config')(app);

// 👇 Start handling routes here
const indexRoutes = require('./routes/index.routes');
app.use('/api', indexRoutes);

const authRoutes = require('./routes/auth.routes');
app.use('/auth', authRoutes);

const postRoutes = require('./routes/post.routes');
app.use('/api', isAuthenticated, postRoutes);

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require('./error-handling')(app);

app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res.status(401).send('Invalid token...');
  } else {
    next(err);
  }
});

module.exports = app;

