import { v4 as uuidv4 } from 'uuid';
import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../../user/entity/user.entity';

@Entity()
export class Client {
  @PrimaryColumn('uuid')
  id: string = uuidv4();

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  clientId: string;

  @Column()
  clientSecret: string;

  @Column('simple-array', { nullable: true })
  redirectUris: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, { nullable: false })
  user: User;
}
