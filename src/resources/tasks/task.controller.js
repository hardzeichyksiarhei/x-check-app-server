const dateFormat = require("dateformat");
const fetch = require("node-fetch");
const slug = require("slug");
const uuid = require("uuid").v4;
const catchErrors = require("../../common/catchErrors");
const { API_URL } = require("../../common/config");

exports.importTasks = catchErrors(async (req, res) => {
  const {
    files: { file },
  } = req;

  const { authorId } = req.body;

  const items = JSON.parse(file.data);

  const tasks = items.map((item) => {
    const task = {
      authorId: Number(authorId),
      title: item.taskName,
      description: "",
      slug: slug(item.taskName),
      state: "PUBLISHED",
      created_at: dateFormat(new Date(), "yyyy-mm-dd hh:MM:ss"),
      updated_at: null,
    };

    const categories = [];
    let category = null;
    for (let i = 0; i < item.criteria.length; i++) {
      if (item.criteria[i].type === "title") {
        if (category) categories.push(category);
        category = {
          id: uuid(),
          title: item.criteria[i].title,
          slug: slug(item.criteria[i].title),
          description: "",
          criteria: [],
          created_at: dateFormat(new Date(), "yyyy-mm-dd hh:MM:ss"),
          update_at: null,
        };
      }
      if (category && ["subtitle", "penalty"].includes(item.criteria[i].type)) {
        category.criteria.push({
          text: item.criteria[i].text,
          score: item.criteria[i].max,
        });
      }

      if (item.criteria[i].type !== "title" && i === item.criteria.length - 1) {
        categories.push(category);
      }
    }

    return {
      ...task,
      categories,
    };
  });

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

  const result = tasks.map((task) => ({
    taskName: task.title,
    criteria: task.categories
      .map((category) =>
        [
          {
            type: "title",
            title: category.title,
          },
        ].concat(
          category.criteria.map((criterion) => ({
            type: Number(criterion.score) > 0 ? "subtitle" : "penalty",
            text: criterion.text,
            max: Number(criterion.score),
          }))
        )
      )
      .flat(),
  }));

  console.log(result);

  res.end(JSON.stringify(result));
});
