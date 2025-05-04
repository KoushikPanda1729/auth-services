import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./User";

@Entity({ name: "refreshTokens" })
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  expireAt: Date;
  @ManyToOne(() => User)
  user: User;
  @UpdateDateColumn()
  updatedAt: number;
  @CreateDateColumn()
  createdAt: number;
}
