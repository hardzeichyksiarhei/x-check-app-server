const router = require("express").Router();
const TaskController = require("./task.controller");

router.route("/export").get(TaskController.exportAll);

module.exports = router;
