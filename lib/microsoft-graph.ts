// lib/microsoft-graph.ts
import { Client } from "@microsoft/microsoft-graph-client";
import "isomorphic-fetch";

interface GraphAuthProvider {
  getAccessToken(): Promise<string>;
}

class ClientCredentialsAuthProvider implements GraphAuthProvider {
  private tenantId: string;
  private clientId: string;
  private clientSecret: string;

  constructor(tenantId: string, clientId: string, clientSecret: string) {
    this.tenantId = tenantId;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  async getAccessToken(): Promise<string> {
    const tokenEndpoint = `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`;
    const params = new URLSearchParams({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      scope: "https://graph.microsoft.com/.default",
      grant_type: "client_credentials",
    });

    const response = await fetch(tokenEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get access token: ${error}`);
    }

    const data = await response.json();
    return data.access_token;
  }
}

export function getGraphClient(): Client {
  const tenantId = process.env.MICROSOFT_TENANT_ID;
  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error("Missing Microsoft Graph API credentials in environment variables");
  }

  const authProvider = new ClientCredentialsAuthProvider(tenantId, clientId, clientSecret);

  return Client.init({
    authProvider: async (done) => {
      try {
        const token = await authProvider.getAccessToken();
        done(null, token);
      } catch (error) {
        done(error as Error, null);
      }
    },
  });
}

// --- NUEVO: resolver el drive de la biblioteca correcta ---
let cachedDriveId: string | null = null;

async function getDriveId(client: Client, siteId: string): Promise<string> {
  if (cachedDriveId) return cachedDriveId;

  const libraryName = process.env.SHAREPOINT_LIBRARY_NAME;

  // Sin nombre de biblioteca => usa la biblioteca por defecto del sitio
  if (!libraryName) {
    const drive = await client.api(`/sites/${siteId}/drive`).get();
    cachedDriveId = drive.id;
    return drive.id;
  }

  const drives = await client.api(`/sites/${siteId}/drives`).get();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const match = drives.value.find((d: any) => d.name === libraryName);

  if (!match) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const disponibles = drives.value.map((d: any) => d.name).join(", ");
    throw new Error(
      `No se encontró la biblioteca "${libraryName}". Disponibles: ${disponibles}`
    );
  }

  cachedDriveId = match.id;
  return match.id;
}

function getBasePath(): string {
  // Ruta RELATIVA a la raíz de la biblioteca (NO el path /sites/...)
  // Ej: "/Facturas General/Año 2026/TICKETS VIAJES"
  return process.env.SHAREPOINT_FOLDER_PATH || "/TICKETS_CLOUDINARY";
}

export async function uploadFileToSharePoint(
  fileName: string,
  fileBuffer: Buffer,
  folderPath: string
): Promise<string> {
  const client = getGraphClient();
  const siteId = process.env.MICROSOFT_SITE_ID;
  if (!siteId) throw new Error("MICROSOFT_SITE_ID not found in environment variables");

  const driveId = await getDriveId(client, siteId);
  const basePath = getBasePath();
  const fullPath = `${basePath}/${folderPath}/${fileName}`;

  try {
    const uploadResponse = await client
      .api(`/drives/${driveId}/root:${fullPath}:/content`)
      .put(fileBuffer);
    return uploadResponse.webUrl;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.statusCode === 404) {
      await createFolderPath(folderPath);
      const uploadResponse = await client
        .api(`/drives/${driveId}/root:${fullPath}:/content`)
        .put(fileBuffer);
      return uploadResponse.webUrl;
    }
    throw error;
  }
}

async function createFolderPath(folderPath: string): Promise<void> {
  const client = getGraphClient();
  const siteId = process.env.MICROSOFT_SITE_ID!;
  const driveId = await getDriveId(client, siteId);
  const basePath = getBasePath();

  const parts = folderPath.split("/");
  let currentPath = basePath;

  for (const part of parts) {
    try {
      await client
        .api(`/drives/${driveId}/root:${currentPath}:/children`)
        .post({
          name: part,
          folder: {},
          "@microsoft.graph.conflictBehavior": "fail",
        });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.statusCode !== 409) throw error;
    }
    currentPath += `/${part}`;
  }
}

export async function checkSharePointConnection(): Promise<boolean> {
  try {
    const client = getGraphClient();
    const siteId = process.env.MICROSOFT_SITE_ID;
    if (!siteId) return false;
    const driveId = await getDriveId(client, siteId);
    await client.api(`/drives/${driveId}/root`).get();
    return true;
  } catch (error) {
    console.error("SharePoint connection failed:", error);
    return false;
  }
}