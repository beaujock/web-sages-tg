import { jwtVerify } from 'jose';

export const API_BASE_URL = process.env.NEXT_PUBLIC_SAGES_BASE_URL as string;
export const JWT_SECRET = process.env.JWT_SECRET as string;

type ResourceCombo = {
  type_resource: string;
  resource_id: string;
};

export type SagesMenuItem = {
    display_name    : string;
    icon_name       : string|null;
    end_route       : string;
    active          : boolean;
}

type UserInfos = {
  id: string;
  user_name: string;
  full_name: string;
  email: string;
  roles: string[];
  resources: ResourceCombo[];
  menu_items : SagesMenuItem[];
}


export interface DecodedJwtToken {
    user_id            : string;
    effective_date     : Date;
    expiry_date        : Date;
    user_ip_address    : string | null;
    user_agent         : string | null;
    host               : string | null;
}

/*
export interface AuthState {
  clientCode: string;
  clientId: string;
  isFirstLogin: boolean;
  cookieName: string;
  token: string;
  decodedToken: DecodedJwtToken;
}
*/

// Helper function to retrieve a cookie by its name
export function getCookie (name: string)  {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return null;
};

export async function decodeToken(token: string): Promise<DecodedJwtToken> {

  try {
    // jose requires the secret to be encoded as a Uint8Array
    const secretKey = new TextEncoder().encode(JWT_SECRET);
    console.log("Secret encoded =  ", secretKey);

    const { payload } = await jwtVerify(token, secretKey, {
      clockTolerance: 60, // 60 seconds tolerance
    });

    console.log("Verified token : ", payload);

    return payload as unknown as DecodedJwtToken;
  } catch (error) {
    console.error("JWT verification failed:", error);
    throw new Error('Echec Connection. Vérifier vos information d\'identification.');
  }
}

export function setClientCookie(cookieName: string, token: string, expiryDate?: string) {
  const expires = expiryDate ? `; expires=${new Date(expiryDate).toUTCString()}` : '';
  document.cookie = `${cookieName}=${token}; path=/${expires}; SameSite=Lax; Secure`;
}

export async function callDecodeToken(token: string): Promise<DecodedJwtToken | null> {
  try {
          const resDecode = await fetch(`${API_BASE_URL}/decodetoken`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              connectionToken : token,
            }),
          });

          if (!resDecode.ok) {
            return null
          }
          return await resDecode.json() as DecodedJwtToken;

      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      catch (error) {
        return null;
      }
}

export async function callGetUserConnectionInfos(clientCode:string, userId:string): Promise<UserInfos | null> {
  try {
          const resGetUserConnection = await fetch(`${API_BASE_URL}/${clientCode}/${userId}/connectioninfos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId : userId,
            }),
          });
          if (!resGetUserConnection.ok) {
            return null;
          }
          const detauilResponse = await resGetUserConnection.json();
          return detauilResponse.userInfos as UserInfos;
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      catch (error) {
        return null;
      }
}