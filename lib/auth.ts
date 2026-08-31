import { jwtVerify } from 'jose';

export const API_BASE_URL = process.env.NEXT_PUBLIC_SAGES_BASE_URL as string;
//export const JWT_SECRET = process.env.JWT_SECRET;

const secret = process.env.JWT_SECRET;

// 1. Check if it is completely missing (undefined)
if (typeof secret === 'undefined') {
  throw new Error("JWT_SECRET is completely missing from the environment.");
}

// 2. Check if it was found, but left blank
if (secret === '') {
  throw new Error("JWT_SECRET was found, but the value is an empty string.");
}

// Now you can safely use `secret` as a string!
export const JWT_SECRET = secret;

type resourceCombo = {
  type_resource: string;
  resource_id: string;
};

type MenuItem = {
    display_name    : string;
    icon_name       : string|null;
    end_route       : string;
    active          : boolean;
}

type UserInfos = {
  id: string;
  user_name: string;
  email: string;
  roles: string[];
  resources: resourceCombo[];
  menu_items : MenuItem[];
};

export interface DecodedJwtToken {
  firstLogin: boolean;
  user: UserInfos;
}

export interface AuthState {
  clientCode: string;
  clientId: string;
  isFirstLogin: boolean;
  cookieName: string;
  token: string;
  decodedToken: DecodedJwtToken;
}

export async function decodeToken(token: string): Promise<DecodedJwtToken> {
  //const JWT_SECRET = process.env.JWT_SECRET || '';
  console.log("Entering decodeToken with token: ", token);
  console.log("Secret =  ", JWT_SECRET);

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