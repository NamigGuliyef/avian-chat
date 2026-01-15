import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) { }
  canActivate(
    context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {

    const request = context.switchToHttp().getRequest();
    // Burada autentifikasiya və avtorizasiya məntiqini əlavə edin
    const token = request.headers['authorization']?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Token tapılmadı');
    }
    try {
      // Tokeni yoxlayın və istifadəçi məlumatlarını əldə edin
      const decodedToken = this.jwtService.verify<any>(token, { secret: process.env.JWT_SECRET });
      request.user = decodedToken; // İstifadəçi məlumatlarını sorğuya əlavə edin
    } catch (error) {
      throw new UnauthorizedException('Token etibarsızdır');
    }

    return true; // Əgər autentifikasiya uğurludursa, icazə verin

  }
}
