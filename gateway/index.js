const express = require('express');
const app = express();
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const rfs = require('rotating-file-stream');
const path = require('path');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const routes = require('./app/routes');

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "auth-token"]
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use(limiter);

const accessLogStream = rfs.createStream('access.log', {
  interval: '1d',
  path: path.join(__dirname, 'log')
});

morgan.token('auth', (req) => {
  return req.headers['auth-token'];
});

morgan.token('body', (req) => {
  return JSON.stringify(req.body);
})

app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :auth :body ":referrer" ":user-agent"', {stream: accessLogStream}));

// log only 4xx and 5xx responses to console
app.use(morgan('dev', {
  skip: function (req, res) { return res.statusCode < 400 }
}))

app.use(express.json());
app.use(helmet());

dotenv.config();

app.use("/", routes);

// start server
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});


