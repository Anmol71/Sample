import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    // const token = this.extractTokenFromHeader(request);
    const token: { access_token: string } = request.cookies.Authorization;
    console.log('Token', token);
    if (!token) {
      throw new UnauthorizedException();
    }
    const payload = await this.jwtService.decode(token.access_token, {
      json: true,
    });
    // 💡 We're assigning the payload to the request object here
    // so that we can access it in our route handlers
    console.log(payload);
    request.user = payload.user_id;
    // request['user'] = payload;
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
