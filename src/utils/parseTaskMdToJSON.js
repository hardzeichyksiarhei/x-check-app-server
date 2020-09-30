exports.parseTaskMdToJSON = (json) => {
  let haveTaskName = false;
  let haveTaskDiscription = false;
  let haveGradeCriterion = false;
  let currentCategory = "";
  let currentCategoryIndex = -1;

  const separationDiscription = (str) => {
    let score = "";
    let stoper = false;
    const disrition = [...str]
      .reverse()
      .reduce((a, e) => {
        if (e === ">") stoper = true;
        score += !stoper ? e : "";
        return stoper ? a + e : a;
      }, "")
      .split("")
      .reverse()
      .join("");
    score = score.split("").reverse().join("").trim();
    return { score, disrition };
  };

  const reducer = (a, e, i, legasy) => {
    let reternedData = {};

    switch (true) {
      case !haveTaskName: {
        reternedData = e.type === "inline" ? { title: e.content } : a;
        haveTaskName = reternedData.title;
        break;
      }
      case !haveTaskDiscription: {
        reternedData =
          e.tag !== ""
            ? {
                disription: a.disription
                  ? a.disription +
                    `<${e.type.includes("close") ? "/" : ""}${e.tag}>`
                  : `<${e.type.includes("close") ? "/" : ""}${e.tag}>`,
              }
            : {
                disription: a.disription ? a.disription + e.content : e.content,
              };
        haveTaskDiscription = legasy[i + 1].content === "Критерии оценки:";
        break;
      }

      case !haveGradeCriterion: {
        reternedData = {};
        if (e.level === 3) {
          const isContent = e.content !== "";
          currentCategoryIndex +=
            isContent && e.content !== currentCategory ? 1 : 0;
          currentCategory = isContent ? e.content : currentCategory;
          if (isContent)
            reternedData = {
              categories: a.categories
                ? [...a.categories].concat([{ title: currentCategory }])
                : [{ title: currentCategory }],
            };
        }
        if (e.level === 5) {
          const isContent = e.content !== "";
          reternedData = a;
          if (isContent)
            if (!reternedData["categories"][currentCategoryIndex]["criteria"])
              reternedData["categories"][currentCategoryIndex]["criteria"] = [];
          reternedData["categories"][currentCategoryIndex]["criteria"].push({
            text: separationDiscription(e.content).disrition,
            score: separationDiscription(e.content).score,
          });
        }
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
