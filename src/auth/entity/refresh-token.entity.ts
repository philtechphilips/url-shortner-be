import { v4 as uuidv4 } from 'uuid';
import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Client } from '../../client/entity/client.entity';
import { User } from '../../user/entity/user.entity';

@Entity()
export class RefreshToken {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ unique: true })
  token: string;

  @ManyToOne(() => Client)
  client: Client;

  @ManyToOne(() => User)
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  expiresAt: Date;
}
