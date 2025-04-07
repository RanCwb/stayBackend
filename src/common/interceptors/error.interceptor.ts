import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, throwError } from 'rxjs';
import { Observable } from 'rxjs';
import { HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) => {
        const status =
          err instanceof HttpException ? err.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

        const message =
          err instanceof HttpException
            ? err.getResponse()
            : 'Unexpected server error';

        return throwError(() => new HttpException({
          success: false,
          statusCode: status,
          message,
          timestamp: new Date().toISOString(),
        }, status));
      }),
    );
  }
}
