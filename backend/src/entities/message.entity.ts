import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  room_id: number; // should be @ManyToOne(() => Room) with proper relation

  @Column()
  user_id: number; // should be @ManyToOne(() => User) with proper relation

  @Column('text')
  content: string;

  @Column({ nullable: true })
  senderName: string; // camelCase mixed with snake_case above

  @CreateDateColumn()
  createdAt: Date;
}
