export interface HttpExceptionDto {
  error: string;
  extendedMessage?: string[];
  message: string;
  method?: string;
  path?: string;
  statusCode: number;
  timestamp: string;
}
