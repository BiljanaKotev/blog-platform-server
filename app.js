require('dotenv').config();

require('./db');

const express = require('express');

const { isAuthenticated } = require('./middleware/jwt.middleware');
const app = express();
const cors = require('cors');

// 👇 Configure CORS

// const whitelist = ['http://localhost:3000', 'https://travelhub-blog-platform.netlify.app'];
// const corsOptions = {
//   origin: function (origin, callback) {
//     if (whitelist.indexOf(origin) !== -1 || !origin) {
//       // !origin allows requests without a set "origin" like Postman or mobile browsers.
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
// };

// app.use(cors(corsOptions));

app.use(
  cors({
    origin: 'https://travelhub-blog-platform.netlify.app',
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

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
