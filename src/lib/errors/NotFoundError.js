class NotFoundError extends Error {
  constructor(modelName, id) {
    super(`${modelName} with id ${id} not found`);
    this.name = 'NotFoundError';
  }
}

export default NotFoundError;
