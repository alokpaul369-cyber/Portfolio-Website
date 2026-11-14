import ApiError from '../utils/ApiError.js';

/**
 * Validates request data against zod schemas.
 *
 * Usage: router.post('/', validate({ body: createSchema }), handler)
 *
 * Parsed values (with defaults, coercion and trimming applied) are stored on
 * `req.validated.body`, `req.validated.query` and `req.validated.params`.
 * Express 5 makes `req.query` read-only, so handlers read from `req.validated`.
 *
 * @param {{ body?: import('zod').ZodType, query?: import('zod').ZodType, params?: import('zod').ZodType }} schemas
 */
export default function validate(schemas) {
  return (req, _res, next) => {
    req.validated ??= {};
    const details = [];

    for (const [source, schema] of Object.entries(schemas)) {
      const result = schema.safeParse(req[source] ?? {});
      if (result.success) {
        req.validated[source] = result.data;
      } else {
        for (const issue of result.error.issues) {
          details.push({
            field: issue.path.join('.') || source,
            message: issue.message,
          });
        }
      }
    }

    if (details.length > 0) {
      return next(ApiError.badRequest('Validation failed', details));
    }
    return next();
  };
}
