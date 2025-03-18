const licensesModel = require("../models/Licenses");
const { ActivityLog, createEmbed } = require("../models/Logger");
const asyncHandler = require("express-async-handler");

// Get user licenses
const getLicenses = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const licenses = await licensesModel.find({ client_id: userId });
  res.status(200).json(licenses);
});

// Reset a license key
const resetKey = asyncHandler(async (req, res) => {
  const { license_key } = req.params;
  const userId = req.user.id;

  const license = await licensesModel.findOne({ license_key, client_id: userId });
  if (!license) {
    return res.status(404).json({ message: "License not found" });
  }

  // Generate a new unique key
  let newKey;
  do {
    newKey = generateNewLicenseKey();
  } while (await licensesModel.findOne({ license_key: newKey }));

  license.license_key = newKey;
  await license.save();

  // Log the action
  await logActivity(req, "reset_key", license_key);

  res.status(200).json({ message: "License key reset successfully", license });
});

// Clear IP from a license
const clearIp = asyncHandler(async (req, res) => {
  await clearLicenseField(req, res, "ip", "IP cleared successfully", "clear_ip");
});

// Clear HWID from a license
const clearHWID = asyncHandler(async (req, res) => {
  await clearLicenseField(req, res, "hwid", "HWID cleared successfully", "clear_hwid");
});

// Helper function to clear a license field
const clearLicenseField = async (req, res, field, successMessage, action) => {
  const { license_key } = req.params;
  const userId = req.user.id;

  const license = await licensesModel.findOne({ license_key, client_id: userId });
  if (!license) {
    return res.status(404).json({ message: "License not found" });
  }

  license[field] = null;
  await license.save();

  // Log the action
  await logActivity(req, action, license_key);

  res.status(200).json({ message: successMessage, license });
};

// Helper function to log activity
const logActivity = async (req, action, details) => {
  const activityLog = await ActivityLog.create({
    user: {
      id: req.user.discordId,
      username: req.user.username,
      avatar: req.user.avatar,
    },
    action,
    details,
  });

  createEmbed(activityLog);
};

// Helper function to generate a new license key
const generateNewLicenseKey = () => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};

module.exports = { getLicenses, resetKey, clearIp, clearHWID };