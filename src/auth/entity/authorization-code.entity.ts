import { v4 as uuidv4 } from 'uuid';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Client } from '../../client/entity/client.entity';
import { User } from '../../user/entity/user.entity';

@Entity()
export class AuthorizationCode {
  @PrimaryGeneratedColumn('uuid')
  id: string = uuidv4();

  @Column({ unique: true })
  code: string;

  @ManyToOne(() => Client)
  client: Client;

  @ManyToOne(() => User)
  user: User;

  @Column()
  redirectUri: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  expiresAt: Date;
}
