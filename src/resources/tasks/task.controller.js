const dateFormat = require("dateformat");
const fetch = require("node-fetch");
const catchErrors = require("../../common/catchErrors");
const { API_URL } = require("../../common/config");
const Task = require("./task.model");

exports.importTasks = catchErrors(async (req, res) => {
  const {
    files: { file },
  } = req;

  const { authorId } = req.body;

  let items = JSON.parse(file.data);

  if (!Array.isArray(items)) items = [items];

  const tasks = items.map((task) => Task.toImport(task, authorId));

  const promises = [];
  tasks.forEach((task) =>
    promises.push(
      fetch(`${API_URL}/tasks`, {
        method: "POST",
        body: JSON.stringify(task),
        headers: { "Content-Type": "application/json" },
      })
    )
  );

  Promise.all(promises)
    .then(() => {
      res.sendStatus(200);
    })
    .catch(() => {
      res.sendStatus(500);
    });
});

exports.exportById = catchErrors(async (req, res) => {
  let response;

  const { taskId } = req.params;

  response = await fetch(`${API_URL}/tasks/${taskId}`);
  const task = await response.json();

  res.writeHead(200, {
    "Content-Type": "application/json-my-attachment",
    "content-disposition":
      'attachment; filename="' +
      task.slug +
      "-" +
      dateFormat(new Date(), "yyyy-mm-dd_hh-MM-ss") +
      '.json"',
  });

  const result = Task.toExport(task);

  res.end(JSON.stringify(result));
});

exports.exportAll = catchErrors(async (req, res) => {
  let response;

  res.writeHead(200, {
    "Content-Type": "application/json-my-attachment",
    "content-disposition":
      'attachment; filename="export-tasks-' +
      dateFormat(new Date(), "yyyy-mm-dd_hh-MM-ss") +
      '.json"',
  });

  response = await fetch(`${API_URL}/tasks`);
  const tasks = await response.json();

  const result = tasks.map((task) => Task.toExport(task));

  res.end(JSON.stringify(result));
});
