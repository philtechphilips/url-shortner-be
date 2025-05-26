import { Injectable, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entity/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createUser(username: string, firstName: string, lastName: string, email: string, password: string): Promise<User> {
    try {
      const hashed = await bcrypt.hash(password, 10);
      const user = this.userRepository.create({ username, firstName, lastName, email, password: hashed });
      console.log(user)
      return await this.userRepository.save(user);
    } catch (error) {
      console.error('Error creating user:', error);
      throw new BadRequestException('Failed to create user.');
    }
  }

  async findByUsername(username: string): Promise<User> {
    try {
      const user = await this.userRepository.findOne({ where: { username } });
      if (!user) {
        throw new NotFoundException('User not found.');
      }
      return user;
    } catch (error) {
      throw error instanceof NotFoundException ? error : new BadRequestException('Failed to find user by username.');
    }
  }

  async findByEmail(email: string): Promise<User> {
    try {
      const user = await this.userRepository.findOne({ where: { email } });
      return user;
    } catch (error) {
      throw error instanceof NotFoundException ? error : new BadRequestException('Failed to find user by email.');
    }
  }

  async validateUser(username: string, password: string): Promise<User> {
    try {
      const user = await this.userRepository.findOne({ where: { username } });
      if (!user) {
        throw new UnauthorizedException('Invalid username or password.');
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new UnauthorizedException('Invalid username or password.');
      }
      return user;
    } catch (error) {
      throw error instanceof UnauthorizedException ? error : new BadRequestException('Failed to validate user.');
    }
  }

  async validateUserByEmail(email: string, password: string): Promise<User> {
    try {
      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) {
        throw new UnauthorizedException('Invalid email or password.');
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new UnauthorizedException('Invalid email or password.');
      }
      return user;
    } catch (error) {
      throw error instanceof UnauthorizedException ? error : new BadRequestException('Failed to validate user by email.');
    }
  }

  async findById(id: string): Promise<User> {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        throw new NotFoundException('User not found.');
      }
      return user;
    } catch (error) {
      throw error instanceof NotFoundException ? error : new BadRequestException('Failed to find user by id.');
    }
  }
}
