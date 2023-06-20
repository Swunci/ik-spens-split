class CustomError extends Error {
  status?: number;

  info?: Object;
}

export default CustomError;
