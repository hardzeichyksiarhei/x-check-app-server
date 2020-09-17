const router = require("express").Router();
const TaskController = require("./task.controller");

router.route("/import").post(TaskController.importTasks);
router.route("/export").get(TaskController.exportAll);

module.exports = router;
