import { Repository } from "typeorm";
import { User } from "../entity/User";
import { IUserData } from "../types";
import createHttpError from "http-errors";

export class UserService {
  public userRepository: Repository<User>;
  constructor(userRepository: Repository<User>) {
    this.userRepository = userRepository;
  }
  async create({ firstName, lastName, gmail, password, role }: IUserData) {
    try {
      const user = await this.userRepository.save({
        firstName,
        lastName,
        gmail,
        password,
        role,
      });
      return user;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      const err = createHttpError(500, "failed to store data in database");
      throw err;
    }
  }
}
