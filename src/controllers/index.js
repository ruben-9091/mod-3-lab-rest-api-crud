const { Router } = require("express");
const probeController = require("./probe.controller");
const contactsController = require("./contacts.controller");

const router = Router();

router.get("/status", probeController.status);
router.get("/contacts", contactsController.list);
router.post("/contacts", contactsController.create);
router.get("/contacts/:id", contactsController.detail);
router.patch("/contacts/:id", contactsController.update);
router.delete("/contacts/:id", contactsController.remove);

module.exports = router;
