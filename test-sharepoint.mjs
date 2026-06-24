// Diagnóstico de acceso a SharePoint con permisos de APLICACIÓN
// (replica exactamente lo que hace tu app en Vercel, NO lo que hace Graph Explorer).
//
// Ejecutar (Node 20.6+):
//   node --env-file=.env test-sharepoint.mjs
// o si tienes las variables ya en el entorno:
//   node test-sharepoint.mjs

const TENANT = process.env.MICROSOFT_TENANT_ID;
const CLIENT_ID = process.env.MICROSOFT_CLIENT_ID;
const CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET;

// Site ID del sitio NUEVO (Financiero y Contabilidad)
const SITE_ID =
  "fintegra2001.sharepoint.com,d49fb16d-756a-4169-a09a-b1d353760e77,cb90855b-590b-4046-bde3-5b9a5aa76822";

async function main() {
  if (!TENANT || !CLIENT_ID || !CLIENT_SECRET) {
    console.error("❌ Faltan variables: MICROSOFT_TENANT_ID / CLIENT_ID / CLIENT_SECRET");
    process.exit(1);
  }

  // 1) Token de aplicación (client credentials) — igual que en Vercel
  const tokenRes = await fetch(
    `https://login.microsoftonline.com/${TENANT}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        scope: "https://graph.microsoft.com/.default",
        grant_type: "client_credentials",
      }),
    }
  );
  const token = await tokenRes.json();
  if (!token.access_token) {
    console.error("❌ No se pudo obtener el token de aplicación:", token);
    process.exit(1);
  }
  console.log("✅ Token de aplicación obtenido\n");

  // 2) Listar las bibliotecas de documentos (drives) del sitio nuevo
  const drivesRes = await fetch(
    `https://graph.microsoft.com/v1.0/sites/${SITE_ID}/drives`,
    { headers: { Authorization: `Bearer ${token.access_token}` } }
  );
  const drives = await drivesRes.json();

  if (drives.error) {
    console.error("❌ La APP NO tiene acceso al sitio nuevo:");
    console.error(JSON.stringify(drives.error, null, 2));
    console.error(
      "\n→ Si ves accessDenied AQUÍ, es un problema real de permisos (Azure/IT), no de tu código."
    );
    process.exit(1);
  }

  console.log("✅ La APP SÍ accede al sitio nuevo. Bibliotecas disponibles:\n");
  for (const d of drives.value) {
    console.log(`   • "${d.name}"`);
    console.log(`        driveId: ${d.id}`);
    console.log(`        webUrl:  ${d.webUrl}\n`);
  }
  console.log(
    'Apunta el driveId de la biblioteca "Contabilidad": es el que necesitas en el código.'
  );
}

main().catch((e) => {
  console.error("❌ Error inesperado:", e);
  process.exit(1);
});
