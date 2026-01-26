export const getPagination = (page = 1, limit = 20) => {
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  
  return {
    skip: (pageNum - 1) * limitNum,
    take: limitNum,
    page: pageNum,
    limit: limitNum
  };
};

export const buildPaginatedResponse = (data, total, page, limit) => {
  return {
    items: data,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    }
  };
};