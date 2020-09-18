const router = require("express").Router();
const TaskController = require("./task.controller");

router.route("/import").post(TaskController.import);
router.route("/export").get(TaskController.exportAll);
router.route("/:taskId/export").get(TaskController.exportById);

module.exports = router;
