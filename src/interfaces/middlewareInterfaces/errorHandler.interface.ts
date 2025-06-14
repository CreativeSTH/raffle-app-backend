export interface CustomError extends Error {
  statusCode?: number;
  details?: any;
}
