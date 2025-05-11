import bcrypt from "bcrypt";
import createHttpError from "http-errors";
import { Brackets, Repository } from "typeorm";
import { User } from "../entity/User";
import { ILimitedUserData, IUserData, UserQueryParams } from "../types";

export class UserService {
  public userRepository: Repository<User>;
  constructor(userRepository: Repository<User>) {
    this.userRepository = userRepository;
  }
  async create({ firstName, lastName, gmail, password, role }: IUserData) {
    const user = await this.userRepository.findOne({ where: { gmail: gmail } });
    if (user) {
      const error = createHttpError(400, "User is already exists ! ");
      throw error;
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    try {
      const user = await this.userRepository.save({
        firstName,
        lastName,
        gmail,
        password: hashedPassword,
        role,
      });
      return user;
    } catch {
      const err = createHttpError(500, "failed to store data in database");
      throw err;
    }
  }

  async findByEmail(gmail: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { gmail: gmail },
      });
      return user;
    } catch {
      const err = createHttpError(500, "failed to store data in database");
      throw err;
    }
  }
  async findById(id: number) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: id },
      });
      return user;
    } catch {
      const err = createHttpError(500, "failed to store data in database");
      throw err;
    }
  }

  async update(
    id: number,
    { firstName, lastName, role, gmail, tenantId }: ILimitedUserData
  ) {
    try {
      return await this.userRepository.update(id, {
        firstName,
        lastName,
        role,
        gmail,
        tenant: tenantId ? { id: tenantId } : undefined,
      });
    } catch {
      const error = createHttpError(500, "Failed to update data in data base");
      throw error;
    }
  }
  async getUserById(userId: number) {
    try {
      return await this.userRepository.findOne({ where: { id: userId } });
    } catch {
      const error = createHttpError(
        500,
        "Failed to get user data in data base"
      );
      throw error;
    }
  }
  async deleteUserById(userId: number) {
    try {
      return await this.userRepository.delete(userId);
    } catch {
      const error = createHttpError(
        500,
        "Failed to delete user data in data base"
      );
      throw error;
    }
  }
  async deleteAllUser() {
    try {
      const allUser = await this.userRepository.find();
      return await this.userRepository.remove(allUser);
    } catch {
      const error = createHttpError(
        500,
        "Failed to delete all user data in data base"
      );
      throw error;
    }
  }
  async getAlluser(validatedQuery: UserQueryParams) {
    const queryBuilder = this.userRepository.createQueryBuilder("user");

    if (validatedQuery.q) {
      const searchTerm = `%${validatedQuery.q}%`;
      queryBuilder.where(
        new Brackets((qb) => {
          qb.where("CONCAT(user.firstName, ' ', user.lastName) ILike :q", {
            q: searchTerm,
          }).orWhere("user.email ILike :q", { q: searchTerm });
        })
      );
    }

    if (validatedQuery.role) {
      queryBuilder.andWhere("user.role = :role", {
        role: validatedQuery.role,
      });
    }
    const result = await queryBuilder
      .leftJoinAndSelect("user.tenant", "tenant")
      .skip((validatedQuery.currentPage - 1) * validatedQuery.perPage)
      .take(validatedQuery.perPage)
      .orderBy("user.id", "DESC")
      .getManyAndCount();
    return result;
  }
}
