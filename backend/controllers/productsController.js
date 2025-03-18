const productModel = require("../models/Products");
const fs = require("fs");
const path = require("path");
const { ActivityLog, createEmbed } = require("../models/Logger");
const asyncHandler = require("express-async-handler");

// MIME type mapping
const mimeTypes = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".ppt": "application/vnd.ms-powerpoint",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".txt": "text/plain",
  ".zip": "application/zip",
  ".rar": "application/x-rar-compressed",
  ".7z": "application/x-7z-compressed",
  ".tar": "application/x-tar",
  ".gz": "application/gzip",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
  ".mkv": "video/x-matroska",
  ".avi": "video/x-msvideo",
  ".jar": "application/java-archive",
};

// Get all products
const getProducts = asyncHandler(async (req, res) => {
  const products = await productModel.find();
  res.status(200).json(products);
});

// Download file
const download = asyncHandler(async (req, res) => {
  const { name, version } = req.params;

  if (!name || !version) {
    return res.status(400).json({ message: "Invalid parameters." });
  }

  const product = await productModel.findOne({ name });
  if (!product) {
    return res.status(404).json({ message: "Product not found." });
  }

  if (!product.versions.includes(version)) {
    return res.status(404).json({ message: "Version not found." });
  }

  const uploadDir = "./uploads";
  if (!fs.existsSync(uploadDir)) {
    return res.status(500).json({ message: "Uploads directory not found." });
  }

  const files = fs.readdirSync(uploadDir);
  const file = files.find((f) => f.startsWith(`${name}-${version}`));

  if (!file) {
    return res.status(404).json({ message: "File not found." });
  }

  const filePath = path.join(uploadDir, file);
  const ext = path.extname(filePath);
  const mimeType = mimeTypes[ext] || "application/octet-stream";

  // Set headers for file download
  res.setHeader("Content-Disposition", `attachment; filename="${file}"`);
  res.setHeader("Content-Type", mimeType);

  // Log the download action
  await logActivity(req, "download", { name, version });

  // Stream the file
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);

  fileStream.on("error", (error) => {
    console.error("Error reading the file:", error);
    res.status(500).json({ message: "Error downloading the file." });
  });
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

module.exports = { getProducts, download };