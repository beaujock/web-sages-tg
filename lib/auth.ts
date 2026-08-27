import jwt from 'jsonwebtoken';

export const API_BASE_URL = process.env.NEXT_PUBLIC_SAGES_BASE_URL || '';
export const JWT_SECRET = process.env.JWT_SECRET || '';

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
  const verified = jwt.verify(token, JWT_SECRET);
  if (!verified || typeof verified === 'string') {
      throw new Error('Echec Connection. Vérifier vos information d\'identification.');
    }
  return verified as unknown as DecodedJwtToken;
}

export function setClientCookie(cookieName: string, token: string, expiryDate?: string) {
  const expires = expiryDate ? `; expires=${new Date(expiryDate).toUTCString()}` : '';
  document.cookie = `${cookieName}=${token}; path=/${expires}; SameSite=Lax; Secure`;
}