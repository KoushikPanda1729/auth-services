import { Request } from "express";
export interface IUserData {
  firstName: string;
  lastName: string;
  gmail: string;
  password: string;
}

export interface IRequestBody extends Request {
  body: IUserData;
}
