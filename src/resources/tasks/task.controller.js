const dateFormat = require("dateformat");
const fetch = require("node-fetch");
const catchErrors = require("../../common/catchErrors");
const { API_URL } = require("../../common/config");
const Task = require("./task.model");

const FILE_EXTENSIONS = { rss: "json", custom: "json", md: "md" };

exports.import = catchErrors(async (req, res) => {
  const {
    files: { file },
  } = req;

  const { authorId } = req.body;
  let { type } = req.query;

  type = ["rss", "custom", "md"].includes(type) ? type : "rss"; // rss | custom | md

  const transformToImport = {
    rss: Task.toImportTypeRSS,
    custom: Task.toImportTypeCUSTOM,
    md: Task.toImportTypeMD,
  };

  if (type === "md") {
    const rawData = file.data.toString("utf8");
    const task = transformToImport[type](rawData, authorId);

    res.status(200).json(task);
  } else {
    let items = JSON.parse(file.data);

    if (!Array.isArray(items)) items = [items];

    const tasks = items.map((task) => transformToImport[type](task, authorId));

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
  }
});

exports.exportById = catchErrors(async (req, res) => {
  let response;

  const { taskId } = req.params;
  let { type } = req.query;

  type = ["rss", "custom", "md"].includes(type) ? type : "rss"; // rss | custom | md

  response = await fetch(`${API_URL}/tasks/${taskId}`);
  const task = await response.json();

  const transformToExport = {
    rss: Task.toExportTypeRSS,
    md: Task.toExportTypeMD,
    custom: Task.toExportTypeCUSTOM,
  };

  const result = transformToExport[type](task);

  res.writeHead(200, {
    "Content-Type": "application/" + FILE_EXTENSIONS[type] + "-attachment",
    "content-disposition":
      'attachment; filename="' +
      task.slug +
      "-" +
      dateFormat(new Date(), "yyyy-mm-dd_hh-MM-ss") +
      "." +
      FILE_EXTENSIONS[type] +
      '"',
  });

  if (type === "md") {
    res.end(result);
  } else {
    res.end(JSON.stringify(result));
  }
});

exports.exportAll = catchErrors(async (req, res) => {
  let response;
  let { authorId, type } = req.query;
  type = ["rss", "custom"].includes(type) ? type : "rss"; // rss | custom

  response = await fetch(`${API_URL}/tasks?authorId=${authorId}`);
  const tasks = await response.json();

  const transformToExport = {
    rss: Task.toExportTypeRSS,
    custom: Task.toExportTypeCUSTOM,
  };

  try {
    const result = tasks.map((task) => transformToExport[type](task));

    res.writeHead(200, {
      "Content-Type": "application/json-my-attachment",
      "content-disposition":
        'attachment; filename="export-tasks-' +
        dateFormat(new Date(), "yyyy-mm-dd_hh-MM-ss") +
        '.json"',
    });

    res.end(JSON.stringify(result));
  } catch (error) {
    res.sendStatus(500);
  }
});
