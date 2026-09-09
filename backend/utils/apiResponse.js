/**
 * Standardized API response helpers
 * Support two calling patterns:
 * 1. success(res, data, message, statusCode) - sends response directly
 * 2. success(message, data) - returns response object (for use with res.json())
 */

const success = (resOrMessage, dataOrNothing = null, message = 'Success', statusCode = 200) => {
  // Pattern 2: called as success('message', data) - returns plain object
  if (typeof resOrMessage === 'string') {
    return {
      success: true,
      message: resOrMessage,
      data: dataOrNothing,
    };
  }
  // Pattern 1: called as success(res, data, message, statusCode)
  const res = resOrMessage;
  return res.status(statusCode).json({
    success: true,
    message: message,
    data: dataOrNothing,
  });
};

const error = (resOrMessage, messageOrStatusCode = 500, statusCodeOrErrors = null, errorsOrNothing = null) => {
  // Pattern 2: called as error('message') - returns plain object
  if (typeof resOrMessage === 'string') {
    const response = { success: false, message: resOrMessage };
    if (messageOrStatusCode && typeof messageOrStatusCode !== 'number') {
      response.errors = messageOrStatusCode;
    }
    return response;
  }
  // Pattern 1: called as error(res, message, statusCode, errors)
  const res = resOrMessage;
  const msg = typeof messageOrStatusCode === 'string' ? messageOrStatusCode : 'Internal Server Error';
  const code = typeof statusCodeOrErrors === 'number' ? statusCodeOrErrors : (typeof messageOrStatusCode === 'number' ? messageOrStatusCode : 500);
  const response = { success: false, message: msg };
  if (errorsOrNothing) response.errors = errorsOrNothing;
  return res.status(code).json(response);
};

const paginated = (resOrMessage, dataOrArray, pageOrMeta, limitOrNothing, total, message = 'Success') => {
  // Pattern 2: called as paginated('message', data, { page, limit, total, totalPages })
  if (typeof resOrMessage === 'string') {
    return {
      success: true,
      message: resOrMessage,
      data: dataOrArray,
      pagination: pageOrMeta,
    };
  }
  // Pattern 1: called as paginated(res, data, page, limit, total, message)
  const res = resOrMessage;
  return res.status(200).json({
    success: true,
    message: message,
    data: dataOrArray,
    pagination: {
      page: parseInt(pageOrMeta, 10),
      limit: parseInt(limitOrNothing, 10),
      total,
      totalPages: Math.ceil(total / limitOrNothing),
    },
  });
};

module.exports = { success, error, paginated };
