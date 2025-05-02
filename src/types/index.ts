import { Request } from "express";
export interface IUserData {
  firstName: string;
  lastName: string;
  gmail: string;
  password: string;
  role: string;
}

export interface IRequestBody extends Request {
  body: IUserData;
}

export interface IAuthRequest extends Request {
  auth: {
    sub: string;
    role: string;
  };
}

export interface IAuthCookie {
  accessToken: string;
  refreshToke: string;
}
export interface IRefreshTokePayload {
  id: string;
}
