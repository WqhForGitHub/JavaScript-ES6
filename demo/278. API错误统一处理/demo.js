// 278. API错误统一处理

function normalizeApiError(error) {
  return {
    message: error.message || '未知错误',
    code: error.code || 'UNKNOWN',
    retryable: error.status >= 500,
  };
}
console.log(normalizeApiError({ message: 'Server Error', status: 500 }));
