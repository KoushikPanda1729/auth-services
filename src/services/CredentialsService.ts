import bcrypt from "bcryptjs";
export class CredentialsService {
  async comparePassword(userPassword: string, hashedPassword: string) {
    const isPasswordCorrect = await bcrypt.compare(
      userPassword,
      hashedPassword
    );
    return isPasswordCorrect;
  }
}
