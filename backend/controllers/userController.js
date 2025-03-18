const userModel = require("../models/User");
const { ActivityLog, createEmbed } = require("../models/Logger");
const asyncHandler = require("express-async-handler");

// Get all users
const getUsers = asyncHandler(async (req, res) => {
  const users = await userModel.find();
  res.status(200).json(users);
});

// Update user role (Owner cannot lose their role)
const updateRole = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { newRole } = req.body;

  // Check if user exists
  const user = await userModel.findById(userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  if (req.user.role !== "Owner") {
    return res.status(403).json({ error: "You do not have permission to update roles" });
  }

  // Prevent Owner from losing role
  const firstUser = await userModel.findOne().sort({ _id: 1 });
  if (firstUser._id.toString() === userId && user.role === "Owner") {
    return res.status(400).json({ error: "The first user cannot lose the Owner role" });
  }

  // Update role and save
  const oldRole = user.role;
  user.role = newRole;
  await user.save();

  // Log the role update
  await logActivity(req, "update_user", `Updated role of ${user.username} from ${oldRole} to ${newRole}`);

  res.json({ message: "Role updated successfully", user });
});

// Ban or unban a user
const updateBan = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Check if user exists
  const user = await userModel.findById(userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  // Toggle ban status
  const oldBanStatus = user.isBanned ? "banned" : "not banned";
  user.isBanned = !user.isBanned;
  await user.save();

  // Log the ban/unban action
  const banStatus = user.isBanned ? "banned" : "unbanned";
  await logActivity(req, "update_user", `User ${user.username} was ${banStatus} (previously ${oldBanStatus})`);

  res.json({ message: `User ${banStatus} successfully`, user });
});

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

module.exports = { getUsers, updateRole, updateBan };