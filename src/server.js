const app = require('./app');

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    const server = app.listen(PORT, () =>
      console.log(`App is running on http://localhost:${PORT}`)
    );

    process.on('uncaughtException', err => {
        console.error(err);
        server.close(() => {
            process.exit(1);
        });
    });

    process.on('unhandledRejection', reason => {
        console.error(reason);
        server.close(() => {
            process.exit(1);
        });
    });
  } catch (err) {
    console.error(err);
  }
}

start();