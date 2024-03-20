const createError = require('http-errors');
const debug = require('debug')('lab:server');
const express = require("express")
const http = require('http')

const cors = require('cors')
const path = require('path');
const session = require("express-session")
const cookieParser = require('cookie-parser');
const dotenv = require("dotenv")
const hbs = require("express-handlebars");
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app);
const indexRouter = require('./routes/index');

dotenv.config()

const port = normalizePort(process.env.http_port || '3000');
const io = require("./bin/socket")

/* ----------------- Setup engine & middleware ----------------- */
app.engine("hbs", hbs.engine({ extname: ".hbs", defaultLayout: 'main.hbs' }));
app.set('view engine', 'hbs');


app.use(cors())
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// Use the session middleware
const sessionMiddleware =session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
})
app.use(sessionMiddleware);
/* ----------------- Setup engine & middleware ----------------- */

/* ----------------- Socket.io ----------------- */

io(server, sessionMiddleware)

/* ----------------- Socket.io ----------------- */

/* ----------------- Router ----------------- */
app.use('/', indexRouter);
/* ----------------- Router ----------------- */

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  console.log(err.message)
  // render the error page
  res.status(err.status || 500);
  res.render('error',{errorMessage: err.message });
});
  
//Server listen
server.listen(port, ()=>{
  console.log("Website started at port: "+port)
} );


  function normalizePort(val) {
    const port = parseInt(val, 10);
  
    if (isNaN(port)) {
      // named pipe
      return val;
    }
  
    if (port >= 0) {
      // port number
      return port;
    }
  
    return false;
  }
