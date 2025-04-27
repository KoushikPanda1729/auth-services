import bcrypt from "bcrypt";
export class CredentialsService {
  async comparePassword(userPassword: string, hashedPassword: string) {
    const isPasswordCorrect = await bcrypt.compare(
      userPassword,
      hashedPassword
    );
    return isPasswordCorrect;
  }
}
