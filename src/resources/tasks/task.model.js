const slug = require("slug");
const uuid = require("uuid").v4;
const dateFormat = require("dateformat");

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
    return task;
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

  static toImportTypeCUSTOM(task, authorId) {
    return task;
  }
}

module.exports = Task;
