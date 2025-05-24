import { v4 as uuidv4 } from 'uuid';
import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../../user/entity/user.entity';
import { Client } from '../../client/entity/client.entity';

@Entity()
export class Url {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column()
  originalUrl: string;

  @Column({ unique: true })
  shortCode: string;

  @ManyToOne(() => User, { nullable: true })
  user: User;

  @ManyToOne(() => Client, { nullable: true })
  client: Client;

  @CreateDateColumn()
  createdAt: Date;
}
