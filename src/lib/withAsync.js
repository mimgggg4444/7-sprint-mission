export function withAsync(handler) {
  return async function (req, res, next) {
    try {
      await handler(req, res);
    } catch (e) {
      next(e);
    }
  };
}
