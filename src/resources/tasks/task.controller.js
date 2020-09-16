const dateFormat = require("dateformat");
const fetch = require("node-fetch");
const catchErrors = require("../../common/catchErrors");

exports.exportAll = catchErrors(async (req, res) => {
  res.writeHead(200, {
    "Content-Type": "application/json-my-attachment",
    "content-disposition":
      'attachment; filename="export-tasks-' +
      dateFormat(new Date(), "yyyy-mm-dd-hh-mm-ss") +
      '.json"',
  });

  const response = await fetch(
    `https://x-check-app-rest-server.herokuapp.com/tasks`
  );
  const tasks = await response.json();

  res.end(JSON.stringify(tasks));
});
