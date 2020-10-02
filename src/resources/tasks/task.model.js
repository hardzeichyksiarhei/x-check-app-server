const slug = require("slug");
const uuid = require("uuid").v4;
const dateFormat = require("dateformat");
const json2md = require("json2md");
const MarkdownIt = require("markdown-it");
const { parseTaskMdToJSON } = require("../../utils/parseTaskMdToJSON");

class Task {
  static toExportTypeRSS(task) {
    return {
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
    };
  }

  static toExportTypeMD(task) {
    const result = [
      { h1: task.title },
      { p: task.description },
      { h2: "Критерии оценки:" },
    ];

    task.categories.forEach((category) => {
      result.push({
        ul: [
          `${category.title}`,
          {
            ul: category.criteria.map(
              (criterion) =>
                `${criterion.text} ${
                  Number(criterion.score) > 0
                    ? "+" + criterion.score
                    : criterion.score
                }`
            ),
          },
        ],
      });
    });

    return json2md(result);
  }

  static toExportTypeCUSTOM(task) {
    return task;
  }

  static toImportTypeRSS(task, authorId) {
    const tempTask = {
      authorId: Number(authorId),
      title: task.taskName,
      description: "",
      slug: slug(task.taskName),
      state: "PUBLISHED",
      created_at: dateFormat(new Date(), "yyyy-mm-dd hh:MM:ss"),
      updated_at: null,
    };

    const categories = [];
    let category = null;
    for (let i = 0; i < task.criteria.length; i++) {
      if (task.criteria[i].type === "title") {
        if (category) categories.push(category);
        category = {
          id: uuid(),
          title: task.criteria[i].title,
          slug: slug(task.criteria[i].title),
          description: "",
          criteria: [],
          created_at: dateFormat(new Date(), "yyyy-mm-dd hh:MM:ss"),
          update_at: null,
        };
      }
      if (category && ["subtitle", "penalty"].includes(task.criteria[i].type)) {
        category.criteria.push({
          text: task.criteria[i].text,
          score: task.criteria[i].max,
        });
      }

      if (task.criteria[i].type !== "title" && i === task.criteria.length - 1) {
        categories.push(category);
      }
    }

    return {
      ...tempTask,
      categories,
    };
  }

  static toImportTypeCUSTOM({ id, ...task }, authorId) {
    // TODO: remove id & replace id in categories (criteria)
    return task;
  }

  static toImportTypeMD(task, authorId) {
    const md = new MarkdownIt({
      html: true,
      linkify: true,
    });
    const parsed = md.parse(task, {});
    const result = parseTaskMdToJSON(parsed);
    return {
      ...result,
      state: "PUBLISHED",
      slug: slug(result.title),
      created_at: dateFormat(new Date(), "yyyy-mm-dd hh:MM:ss"),
      updated_at: null,
      startDate: null,
      endDate: null,
      authorId: Number(authorId),
    };
  }
}

module.exports = Task;
