export async function getUsers() {
  const res = await fetch("/api/users")
  if (!res.ok) throw new Error("Error al obtener sectores")
  return res.json()
}