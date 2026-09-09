const getPagination = (query) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 10;
  
  // Cap limit to 100 max
  const safeLimit = Math.min(limit, 100);
  
  const skip = (page - 1) * safeLimit;
  const sort = query.sort || '-createdAt';

  return { skip, limit: safeLimit, sort, page };
};

module.exports = {
  getPagination,
};
