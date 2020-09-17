const dateFormat = require("dateformat");
const fetch = require("node-fetch");
const catchErrors = require("../../common/catchErrors");

exports.exportAll = catchErrors(async (req, res) => {
  let response;

  res.writeHead(200, {
    "Content-Type": "application/json-my-attachment",
    "content-disposition":
      'attachment; filename="export-tasks-' +
      dateFormat(new Date(), "yyyy-mm-dd_hh-MM-ss") +
      '.json"',
  });

  response = await fetch(`https://x-check-app-rest-server.herokuapp.com/tasks`);
  const tasks = await response.json();

  response = await fetch(
    `https://x-check-app-rest-server.herokuapp.com/categories`
  );
  const categories = await response.json();

  const result = tasks.map((task) => ({
    taskName: task.title,
    criteria: categories
      .filter((category) => category.taskId == task.id)
      .map((category) =>
        [
          {
            type: "title",
            title: category.title,
          },
        ].concat(
          category.items.map((item) => ({
            type: Number(item.score) > 0 ? "subtitle" : "penalty",
            text: item.description,
            max: Number(item.score),
          }))
        )
      )
      .flat(),
  }));

  res.end(JSON.stringify(result));
});
