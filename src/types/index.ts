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
    id?: string;
  };
}

export interface IAuthCookie {
  accessToken: string;
  refreshToken: string;
}
export interface IRefreshTokePayload {
  id: string;
}

export interface ITenant {
  name: string;
  address: string;
}

export interface ICreateTenantReqest extends Request {
  body: ITenant;
}
