const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    console.error("Caught in asyncHandler:", error);

    // Use error.statusCode if it exists, else fallback to 500
    const statusCode =
      typeof error.statusCode === "number" ? error.statusCode : 500;

    res.status(statusCode).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export { asyncHandler };
