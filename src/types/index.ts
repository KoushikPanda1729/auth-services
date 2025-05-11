import { Request } from "express";
export interface IUserData {
  firstName: string;
  lastName: string;
  gmail: string;
  password: string;
  role: string;
  tenantId: number;
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

export interface ILimitedUserData {
  firstName: string;
  lastName: string;
  role: string;
  gmail: string;
  tenantId: number;
}
export interface IUpdateUserRequest extends Request {
  body: ILimitedUserData;
}
export interface TenantQueryParams {
  q: string;
  perPage: number;
  currentPage: number;
}
export interface UserQueryParams {
  q: string;
  perPage: number;
  currentPage: number;
  role: string;
}
