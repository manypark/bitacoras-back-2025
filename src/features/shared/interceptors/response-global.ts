import { HttpStatus } from "@nestjs/common";

export class ResponseService {

  success( message: string, data?: any, statusCode = HttpStatus.OK) {
    return {
      status: true,
      statusCode,
      message,
      data
    };
  }

  error(message: string, data?: any, statusCode = HttpStatus.BAD_REQUEST) {
    return {
      status: false,
      statusCode,
      message,
      data : data ?? null
    };
  }
}
