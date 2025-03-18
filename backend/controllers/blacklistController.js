const blacklistModel = require("../models/Blacklist");
const { ActivityLog, createEmbed } = require("../models/Logger");
const asyncHandler = require("express-async-handler");

// Function to validate if a string is a valid IP address
const isValidIP = (ip) => {
  return /^(25[0-5]|2[0-4][0-9]|1?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|1?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|1?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|1?[0-9][0-9]?)$/.test(ip);
};

// Get the blacklist
const getList = asyncHandler(async (req, res) => {
  const blacklist = await blacklistModel.find();
  res.status(200).json(blacklist);
});

// Add an entry to the blacklist
const add = asyncHandler(async (req, res) => {
  const { value } = req.body;
  if (!value) {
    return res.status(400).json({ message: "Missing required data" });
  }

  // Check if the value already exists
  if (await blacklistModel.findOne({ value })) {
    return res.status(400).json({ message: "This item is already in the blacklist" });
  }

  const addedBy = req.user.username;
  const type = isValidIP(value) ? "IP" : "HWID";
  let country = "Unknown";

  // If it's an IP, try to fetch the country
  if (type === "IP") {
    try {
      const response = await fetch(`http://ip-api.com/json/${value}`);
      if (response.ok) {
        const data = await response.json();
        country = data?.country || "Unknown";
      }
    } catch (error) {
      console.warn("Failed to retrieve IP country:", error);
    }
  }

  // Create and save the new blacklist entry
  const newEntry = await blacklistModel.create({ value, type, country, added_by: addedBy });

  // Log the action
  const activityLog = await ActivityLog.create({
    user: {
      id: req.user.discordId,
      username: req.user.username,
      avatar: req.user.avatar,
    },
    action: "add_blacklist",
    details: value,
  });

  createEmbed(activityLog);
  res.status(201).json({ message: "Item added to the blacklist", data: newEntry });
});

// Remove an entry from the blacklist
const remove = asyncHandler(async (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ message: "An ID is required to delete an entry" });
  }

  const deletedItem = await blacklistModel.findByIdAndDelete(id);
  if (!deletedItem) {
    return res.status(404).json({ message: "Item not found" });
  }

  // Log the removal action
  const activityLog = await ActivityLog.create({
    user: {
      id: req.user.discordId,
      username: req.user.username,
      avatar: req.user.avatar,
    },
    action: "remove_blacklist",
    details: id,
  });

  createEmbed(activityLog);
  res.status(200).json({ message: "Item removed from the blacklist", data: deletedItem });
});

module.exports = { getList, add, remove };