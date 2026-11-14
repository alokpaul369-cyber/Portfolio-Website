import ApiError from '../utils/ApiError.js';

/** Forwards requests that matched no route to the error handler as a 404. */
export default function notFound(req, _res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}
