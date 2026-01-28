// Consistent API response helper
const sendResponse = (res, statusCode, data, message = null) => {
  const response = {
    success: statusCode >= 200 && statusCode < 300,
    ...(message && { message }),
    ...data
  };
  return res.status(statusCode).json(response);
};

// Success responses
const sendSuccess = (res, data, message = null, statusCode = 200) => {
  return sendResponse(res, statusCode, data, message);
};

// Error responses (for use in controllers before throwing to error handler)
const sendError = (res, message, statusCode = 400) => {
  return sendResponse(res, statusCode, { error: message });
};

module.exports = {
  sendResponse,
  sendSuccess,
  sendError
};
