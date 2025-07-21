import { HttpException, HttpStatus } from "@nestjs/common";

export class CustomUnauthorizedException extends HttpException {
  constructor(message: string, statusCode = HttpStatus.OK) {
    super(
      {
      status : false,
      message,
    },
      statusCode,
    );
  }
}
