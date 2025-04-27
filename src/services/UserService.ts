import { Repository } from "typeorm";
import { User } from "../entity/User";
import { IUserData } from "../types";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";

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
}
