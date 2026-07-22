import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import { Response } from 'express';
import * as bcrypt from 'bcrypt';
import { Admin } from './models/admin.model';
import { AdminCreateDto } from './dto/admin-create.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import { ADminUpdateDto } from './dto/admin-update.dto';
import { Background } from 'src/background/models/background.model';
import { Category } from 'src/category/models/category.model';

const BCRYPT_ROUNDS = 10;
const REFRESH_COOKIE_MAX_AGE = 15 * 24 * 60 * 60 * 1000; // 15 kun

@Injectable()
export class AdminService {
  private readonly logger = new Logger('AdminAuth');

  constructor(
    @InjectModel(Admin) private repo: typeof Admin,
    @InjectModel(Background) private BackgroundRepo: typeof Background,
    @InjectModel(Category) private CategoryRepo: typeof Category,
    private readonly jwtService: JwtService,
  ) {}

  async create(createDto: AdminCreateDto, res: Response, ip: string) {
    const user = await this.repo.findOne({ where: { phone: createDto.phone } });
    if (user) {
      this.logger.warn(
        `Admin CREATE FAILED (phone exists) - phone: ${createDto.phone} - ip: ${ip}`,
      );
      throw new BadRequestException('Phone number already exists!');
    }

    const hashed_password = await bcrypt.hash(
      createDto.password,
      BCRYPT_ROUNDS,
    );

    const newAdmin = {
      ...createDto,
      hashed_password,
      role: 'ADMIN',
    };

    const newConfirmAdmin = await this.repo.create({ ...newAdmin });

    const tokens = await this.getTokens(newConfirmAdmin);
    const hashed_refresh_token = await bcrypt.hash(
      tokens.refresh_token,
      BCRYPT_ROUNDS,
    );

    const updatedAdmin = await this.repo.update(
      { hashed_refresh_token },
      { where: { id: newConfirmAdmin.id }, returning: true },
    );

    this.setRefreshCookie(res, tokens.refresh_token);

    this.logger.log(
      `Admin CREATED - id: ${newConfirmAdmin.id} - phone: ${createDto.phone} - role: ADMIN - ip: ${ip}`,
    );

    return {
      message: 'Admin created',
      admin: updatedAdmin[1][0],
      tokens,
    };
  }

  async login(loginDto: AdminLoginDto, res: Response, ip: string) {
    const { phone, password } = loginDto;
    const admin = await this.repo.findOne({ where: { phone } });

    if (!admin) {
      this.logger.warn(
        `Login FAILED (no such admin) - phone: ${phone} - ip: ${ip}`,
      );
      throw new UnauthorizedException('Admin not created');
    }

    const isMatchPass = await bcrypt.compare(password, admin.hashed_password);
    if (!isMatchPass) {
      this.logger.warn(
        `Login FAILED (wrong password) - id: ${admin.id} - phone: ${phone} - ip: ${ip}`,
      );
      throw new UnauthorizedException('Password error');
    }

    const tokens = await this.getTokens(admin);
    const hashed_refresh_token = await bcrypt.hash(
      tokens.refresh_token,
      BCRYPT_ROUNDS,
    );

    const updatedAdmin = await this.repo.update(
      { hashed_refresh_token },
      { where: { id: admin.id }, returning: true },
    );

    this.setRefreshCookie(res, tokens.refresh_token);

    this.logger.log(
      `Login SUCCESS - id: ${admin.id} - phone: ${phone} - role: ${admin.role} - ip: ${ip}`,
    );

    const background = await this.BackgroundRepo.findAll({
      include: { all: true },
    });
    const categories = await this.CategoryRepo.findAll({
      include: { all: true },
    });

    function sortWithZeroAtEnd(a, b) {
      const sortA = a.sort !== undefined ? a.sort : 0;
      const sortB = b.sort !== undefined ? b.sort : 0;
      if (sortA === 0 && sortB === 0) return 0;
      if (sortA === 0) return 1;
      if (sortB === 0) return -1;
      return sortA - sortB;
    }

    categories.sort(sortWithZeroAtEnd);
    categories.forEach((category) => {
      if (category.menu && Array.isArray(category.menu)) {
        category.menu.sort(sortWithZeroAtEnd);
      }
    });

    return {
      message: 'Admin logged in',
      admin: updatedAdmin[1][0],
      tokens,
      background,
      category: categories,
    };
  }

  async logout(refreshToken: string, res: Response, ip: string) {
    let user: any;
    try {
      user = this.jwtService.verify(refreshToken, {
        secret: process.env.REFRESH_TOKEN_KEY,
      });
    } catch (error) {
      this.logger.warn(`Logout FAILED (invalid token) - ip: ${ip}`);
      throw new ForbiddenException('Invalid token');
    }

    if (user.type !== 'refresh') {
      this.logger.warn(
        `Logout FAILED (wrong token type) - id: ${user.id} - ip: ${ip}`,
      );
      throw new ForbiddenException('Invalid token type');
    }

    const updatedAdmin = await this.repo.update(
      { hashed_refresh_token: null },
      { where: { id: user.id }, returning: true },
    );

    res.clearCookie('refresh_token');

    this.logger.log(`Logout - id: ${user.id} - ip: ${ip}`);

    return {
      message: 'Admin logged out',
      user: updatedAdmin[1][0],
    };
  }

  async getAll() {
    return this.repo.findAll({ include: { all: true } });
  }

  async getOne(id: number): Promise<Admin> {
    return this.repo.findByPk(id);
  }

  async delete(id: number) {
    await this.repo.destroy({ where: { id } });
    return { message: 'Admin delete' };
  }

  async update(id: number, updateDto: ADminUpdateDto) {
    const admin = await this.repo.update(updateDto, { where: { id } });
    return { message: 'Admin updated', admin };
  }

  async refreshToken(
    admin_id: number,
    refreshToken: string,
    res: Response,
    ip: string,
  ) {
    let decodedToken: any;
    try {
      decodedToken = this.jwtService.verify(refreshToken, {
        secret: process.env.REFRESH_TOKEN_KEY,
      });
    } catch (error) {
      this.logger.warn(
        `Refresh FAILED (invalid token) - admin_id: ${admin_id} - ip: ${ip}`,
      );
      throw new ForbiddenException('Invalid token');
    }

    if (decodedToken.type !== 'refresh') {
      this.logger.warn(
        `Refresh FAILED (wrong token type) - admin_id: ${admin_id} - ip: ${ip}`,
      );
      throw new ForbiddenException('Invalid token type');
    }

    if (admin_id != decodedToken.id) {
      this.logger.warn(
        `Refresh FAILED (id mismatch) - claimed: ${admin_id} - token: ${decodedToken.id} - ip: ${ip}`,
      );
      throw new BadRequestException('Admin not found!');
    }

    const admin = await this.repo.findOne({ where: { id: admin_id } });
    if (!admin || !admin.hashed_refresh_token) {
      this.logger.warn(
        `Refresh FAILED (no admin/token) - admin_id: ${admin_id} - ip: ${ip}`,
      );
      throw new BadRequestException('Admin not found!');
    }

    const tokenMatch = await bcrypt.compare(
      refreshToken,
      admin.hashed_refresh_token,
    );
    if (!tokenMatch) {
      this.logger.warn(
        `Refresh FAILED (token mismatch, possible reuse) - admin_id: ${admin_id} - ip: ${ip}`,
      );
      throw new ForbiddenException('Forbidden');
    }

    const tokens = await this.getTokens(admin);
    const hashed_refresh_token = await bcrypt.hash(
      tokens.refresh_token,
      BCRYPT_ROUNDS,
    );

    const updatedAdmin = await this.repo.update(
      { hashed_refresh_token },
      { where: { id: admin.id }, returning: true },
    );

    this.setRefreshCookie(res, tokens.refresh_token);

    this.logger.log(`Token refreshed - id: ${admin.id} - ip: ${ip}`);

    return {
      message: 'Admin logged in',
      admin: updatedAdmin[1][0],
      tokens,
    };
  }

  async getTokens(admin: Admin) {
    const basePayload = {
      id: admin.id,
      phone: admin.phone,
      role: admin.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { ...basePayload, type: 'access' },
        {
          secret: process.env.ACCESS_TOKEN_KEY,
          expiresIn: process.env.ACCESS_TOKEN_TIME,
        },
      ),
      this.jwtService.signAsync(
        { ...basePayload, type: 'refresh' },
        {
          secret: process.env.REFRESH_TOKEN_KEY,
          expiresIn: process.env.REFRESH_TOKEN_TIME,
        },
      ),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  private setRefreshCookie(res: Response, refreshToken: string) {
    res.cookie('refresh_token', refreshToken, {
      maxAge: REFRESH_COOKIE_MAX_AGE,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
  }
}
