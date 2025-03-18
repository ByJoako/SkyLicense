const { ActivityLog } = require("../models/Logger");
const requestLogModel = require("../models/Request");
const asyncHandler = require("express-async-handler");

// Get general activity logs
const getGeneral = asyncHandler(async (req, res) => {
  const generalLog = await ActivityLog.find().sort({ timestamp: -1 });
  res.status(200).json(generalLog);
});

// Get request logs
const getRequest = asyncHandler(async (req, res) => {
  const requestLog = await requestLogModel.find().sort({ timestamp: -1 });
  res.status(200).json(requestLog);
});

module.exports = { getGeneral, getRequest };