var express = require('express')
  , router = express.Router();

router.use("/", require("./controllers/main"));

router.use("/mariomaker", require("./controllers/mariomaker"));

router.use("/holidaybullshit", require("./controllers/holidaybullshit"));

router.use("/holidaybullshit_admins", require("./controllers/holidaybullshit_admins"));

module.exports = router;