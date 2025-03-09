export const handleDBError = (err) => {
  // Preserve existing status if already set
  if (err.statusCode) return err;

  const error = new Error(err.message);
  error.originalError = err;

  // Handle common PostgreSQL error codes
  switch (err.code) {
    case '23505': // Unique violation
      error.statusCode = 409;
      error.message = 'Resource already exists';
      error.meta = { conflictField: err.constraint };
      break;

    case '23503': // Foreign key violation
      error.statusCode = 400;
      error.message = 'Invalid reference';
      break;

    case '22P02': // Invalid text representation
      error.statusCode = 400;
      error.message = 'Invalid data type';
      break;

    default:
      error.statusCode = 500;
      error.message = 'Database operation failed';
  }

  return error;
};