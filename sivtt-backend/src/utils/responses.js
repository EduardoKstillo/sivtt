export const successResponse = (data, message = null) => {
  return {
    success: true,
    data,
    ...(message && { message })
  };
};

export const errorResponse = (message, code = 'ERROR', details = null) => {
  return {
    success: false,
    error: {
      code,
      message,
      ...(details && { details })
    }
  };
};

export const paginationResponse = (data, total, page, limit) => {
  return {
    success: true,
    data: {
      [Array.isArray(data) ? data : Object.keys(data)[0]]: Array.isArray(data) ? data : data,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    }
  };
};