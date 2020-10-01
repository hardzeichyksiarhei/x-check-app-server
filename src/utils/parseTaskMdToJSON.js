exports.parseTaskMdToJSON = (json) => {
  let haveTaskName = false;
  let haveTaskDescription = false;
  let haveGradeCriterion = false;
  let currentCategory = "";
  let currentCategoryIndex = -1;

  const separationDescription = (str) => {
    const score = str.match(/([\+?\-?0-9]+)/g).pop();
    const description =
      str.slice(0, str.lastIndexOf(score)) +
      str.slice(str.lastIndexOf(score) + score.length);

    return { score: Number(score), description };
  };

  const reducer = (a, e, i, legacy) => {
    let reternedData = {};

    switch (true) {
      case !haveTaskName: {
        reternedData = e.type === "inline" ? { title: e.content } : a;
        haveTaskName = reternedData.title;
        break;
      }
      case !haveTaskDescription: {
        reternedData =
          e.tag !== ""
            ? {
                description: a.description
                  ? a.description +
                    `<${e.type.includes("close") ? "/" : ""}${e.tag}>`
                  : `<${e.type.includes("close") ? "/" : ""}${e.tag}>`,
              }
            : {
                description: a.description
                  ? a.description + e.content
                  : e.content,
              };
        haveTaskDescription =
          legacy[i + 1] && legacy[i + 1].content === "Критерии оценки:";
        break;
      }

      case !haveGradeCriterion: {
        reternedData = {};
        let next = false;
        if (e.level === 3) {
          const isContent = e.content !== "";
          currentCategoryIndex +=
            isContent && e.content !== currentCategory ? 1 : 0;
          currentCategory = isContent
            ? e.content.split("*").join("")
            : currentCategory;
          if (isContent)
            reternedData = {
              categories: a.categories
                ? [...a.categories].concat([
                    {
                      title: separationDescription(currentCategory).description,
                    },
                  ])
                : [
                    {
                      title: separationDescription(currentCategory).description,
                    },
                  ],
            };
          next = true;
        }
        if (e.level === 5) {
          const isContent = e.content !== "";
          reternedData = a;
          if (isContent)
            if (!reternedData["categories"][currentCategoryIndex]["criteria"])
              reternedData["categories"][currentCategoryIndex]["criteria"] = [];
          reternedData["categories"][currentCategoryIndex]["criteria"].push({
            text: separationDescription(e.content).description,
            score: separationDescription(e.content).score,
            availability: [],
          });
          next = true;
        }

        if (!next && e.tag === "h3") {
          haveTaskDescription = !haveTaskDescription;
          reternedData = a;
        }
        next = false;
        break;
      }
      default:
        reternedData = a;
    }

    return { ...a, ...reternedData };
  };

  const newJSON = json.reduce(reducer, {});
  return newJSON;
};
