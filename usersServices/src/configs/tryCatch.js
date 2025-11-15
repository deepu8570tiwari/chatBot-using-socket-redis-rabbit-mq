export const tryCatch = (controllerFn) => {
  return async (req, res, next) => {
    try {
      await controllerFn(req, res, next);
    } catch (error) {
      console.error("Error:", error.message);
      const statusCode = error.statusCode || 500;

      res.status(statusCode).json({
        message: error.message || "Internal Server Error",
      });
    }
  };
};
