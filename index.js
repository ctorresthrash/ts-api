const Glue = require('glue');
const Path = require('path');
const apiV1Routes = require('./api/v1/routes/index');
const models = require('./models/index');
require('dotenv').config();

const manifest = {
  "server": {},
  "connections": [
    {
      "port": 1337,
      "host": "127.0.0.1"
    }
  ],
  "registrations": [
    {
      plugin: {
        register: 'good',
        options: {
          ops: {
            interval: 1000
          },
          reporters: {
            consoleReporter: [
              {
                module: 'good-squeeze',
                name: 'Squeeze',
                args: [
                  {
                    log: '*',
                    response: '*'
                  }
                ]
              }, {
                module: 'good-console'
              },
              'stdout'
            ]
          }
        }
      }
    }, {
      plugin: {
        register: "blipp",
        options: {
          showAuth: true
        }
      }
    }, {
      plugin: {
        register: "hapi-swagger"
      }
    }, {
      plugin: {
        register: "inert"
      }
    }, {
      plugin: {
        register: "vision"
      }
    }, {
      plugin: {
        register: 'hapi-auth-jwt2'
      }
    }, {
      plugin: {
        register: './api/v1/routes/index.js',
        routes: {
          prefix: '/api/v1'
        }
      }
    },
    /* , {
      plugin: {
        register: "poop",
        options: {
          heapdumpFolder: Path.join(__dirname, "heapdumps"),
          logPath: Path.join(__dirname, "logs/poop.log"),
          writeStreamOptions: {
            flags: 'w',
            encoding: null,
            fd: null,
            mode: 0666
          }
        }
      }
    } */
  ]
};

const getServer = async function () {
  try {
    const server = await Glue.compose(manifest, {relativeTo: __dirname});
    return server;
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

async function startServer() {
  await models.sequelize.sync();
  let server = await getServer();
  await server.start();
  console.log(`Server running at ${server.info.uri}`);
};

startServer();

module.exports = getServer;