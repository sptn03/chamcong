import { Token, CreateTokenInput } from '../entities';

export interface ITokenRepository {
  findById(id: number): Promise<Token | null>;
  findByToken(token: string): Promise<Token | null>;
  findByUserId(userId: number): Promise<Token[]>;
  create(input: CreateTokenInput): Promise<Token>;
  deactivate(id: number): Promise<void>;
  deactivateAllForUser(userId: number): Promise<void>;
}
