import jwt from 'jsonwebtoken';

export const API_BASE_URL = process.env.API_BASE_URL;

type resourceCombo = {
  type_resource : string,
  resource_id : string
};

type UserInfos = {
  id: string;
  user_name: string;
  email: string;
  roles: string[];
  resources: resourceCombo[];
}

export interface DecodedJwtToken {
  firstLogin: boolean;
  user : UserInfos;
}

export interface AuthState {
  clientCode: string;
  clientId: string;
  isFirstLogin: boolean;
  cookieName: string;
  token: string;
  decodedToken: DecodedJwtToken;
}

export function decodeToken(token: string): DecodedJwtToken {
  // jsonwebtoken's decode function decodes the payload without verifying the signature client-side
  const decoded = jwt.decode(token);
  
  if (!decoded || typeof decoded === 'string') {
    throw new Error('Invalid JWT token structure');
  }

  return decoded as DecodedJwtToken;
}

export function setClientCookie(cookieName: string, token: string, expiryDate?: string) {
  const expires = expiryDate ? `; expires=${new Date(expiryDate).toUTCString()}` : '';
  document.cookie = `${cookieName}=${token}; path=/${expires}; SameSite=Lax; Secure`;
}