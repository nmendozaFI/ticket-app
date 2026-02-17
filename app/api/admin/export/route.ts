import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const SUBCUENTAS: Record<string, { cuenta: string; concepto: string; subconcepto: string }> = {
  Taxi: {
    cuenta: "GASTOS DE VIAJE",
    concepto: "Taxi viajes",
    subconcepto: "Taxi viajes",
  },
  Comida: {
    cuenta: "GASTOS DE VIAJE",
    concepto: "Comidas viajes",
    subconcepto: "Comidas viajes",
  },
  Hotel: {
    cuenta: "GASTOS DE VIAJE",
    concepto: "Hotel viajes",
    subconcepto: "Hotel viajes",
  },
  "Metrobus/Parking": {
    cuenta: "GASTOS DE VIAJE",
    concepto: "Parking viajes metrobus",
    subconcepto: "Parking viajes metrobus",
  },
  Gasolina: {
    cuenta: "GASTOS DE VIAJE",
    concepto: "Gasolina viajes",
    subconcepto: "Gasolina viajes",
  },
  Ave: {
    cuenta: "GASTOS DE VIAJE",
    concepto: "Ave",
    subconcepto: "Ave",
  },
  Avion: {
    cuenta: "GASTOS DE VIAJE",
    concepto: "Avion",
    subconcepto: "Avion",
  },
};

const SUBCUENTAS_CONTABILIDAD: Record<string, string> = {
  Taxi: "62900000006",
  Comida: "62900000024",
  Hotel: "62900000039",
  "Metrobus/Parking": "62900000045",
  Gasolina: "62900000031",
  Ave: "62900000025",
  Avion: "62900000038",
};

const BANCOS: Record<string, string> = {
  Tarjeta: "Santander tarj debito",
  Efectivo: "Efectivo",
  Transferencia: "Santander transferencia",
  Domiciliacion: "Santander domiciliacion",
};

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ✅ FIX: incluir trip con assignedUsers → user (ya no trip.user)
  const expenses = await prisma.expense.findMany({
    include: {
      trip: {
        include: {
          assignedUsers: {
            include: {
              user: {
                select: { id: true, name: true, email: true },
              },
            },
          },
        },
      },
    },
    orderBy: { date: "asc" },
  });

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Sheet1");

  worksheet.columns = [
    { header: "fecha",                key: "fecha",                 width: 12 },
    { header: "CUENTA",               key: "cuenta",                width: 20 },
    { header: "CONCEPTO",             key: "concepto",              width: 25 },
    { header: "SUBCONCEPTO",          key: "subconcepto",           width: 25 },
    { header: "Nª Registro",          key: "nRegistro",             width: 12 },
    { header: "EUROS",                key: "euros",                 width: 12 },
    { header: "IVA",                  key: "iva",                   width: 10 },
    { header: "IMPORTE IVA",          key: "importeIva",            width: 12 },
    { header: "IMPORTE_TOTAL",        key: "importeTotal",          width: 15 },
    { header: "subcuenta contabildad",key: "subcuentaContabilidad", width: 20 },
    { header: "PROVEEDOR",            key: "proveedor",             width: 30 },
    { header: "FACTURA",              key: "factura",               width: 20 },
    { header: "COMENTARIOS",          key: "comentarios",           width: 60 },
    { header: "MES",                  key: "mes",                   width: 8  },
    { header: "Cobro",                key: "cobro",                 width: 8  },
    { header: "mes imputacion",       key: "mesImputacion",         width: 15 },
    { header: "IMPUTACION",           key: "imputacion",            width: 12 },
    { header: "PROYECTO",             key: "proyecto",              width: 15 },
    { header: "Pagado",               key: "pagado",                width: 10 },
    { header: "Fecha Pago",           key: "fechaPago",             width: 12 },
    { header: "PERSONAL",             key: "personal",              width: 20 },
    { header: "PPTO",                 key: "ppto",                  width: 10 },
    { header: "Nº noches",            key: "nNoches",               width: 10 },
    { header: "Nº pax viajan",        key: "nPax",                  width: 12 },
    { header: "Nº trayectos",         key: "nTrayectos",            width: 12 },
    { header: "CIUDAD",               key: "ciudad",                width: 15 },
    { header: "Certificado",          key: "certificado",           width: 12 },
    { header: "Liberalidad/Donación", key: "liberalidad",           width: 20 },
    { header: "Certificado + Carta",  key: "certificadoCarta",      width: 20 },
    { header: "Banco",                key: "banco",                 width: 25 },
    { header: "Prespuesto",           key: "presupuesto",           width: 12 },
    { header: "CRM",                  key: "crm",                   width: 10 },
    { header: "CRM PROYECTO",         key: "crmProyecto",           width: 15 },
    { header: "Inventario físico",    key: "inventarioFisico",      width: 15 },
  ];

  expenses.forEach((expense) => {
    const trip = expense.trip;

    // ✅ FIX: obtener nombre del primer usuario asignado al viaje
    // (un viaje puede tener varios; usamos el primero para el Excel)
    const firstAssignment = trip.assignedUsers?.[0];
    const userName = firstAssignment?.user?.name ?? "Sin asignar";

    // ✅ Si hay varios usuarios asignados, concatenarlos para comentarios
    const allUserNames = trip.assignedUsers
      ?.map((a) => a.user?.name)
      .filter(Boolean)
      .join(", ") ?? "Sin asignar";

    const fechaGasto = new Date(expense.date);
    const mesNum    = fechaGasto.getMonth() + 1;
    const añoGasto  = fechaGasto.getFullYear();

    const categoriaInfo =
      SUBCUENTAS[expense.category ?? ""] ?? SUBCUENTAS["Taxi"];

    worksheet.addRow({
      fecha:                 formatDate(expense.date),
      cuenta:                categoriaInfo.cuenta,
      concepto:              categoriaInfo.concepto,
      subconcepto:           categoriaInfo.subconcepto,
      nRegistro:             "",
      euros:                 Number(expense.amount),
      iva:                   0,
      importeIva:            0,
      importeTotal:          Number(expense.amount),
      subcuentaContabilidad: SUBCUENTAS_CONTABILIDAD[expense.category ?? ""] ?? "",
      proveedor:             expense.vendor ?? "",
      factura:               expense.invoiceNumber ?? "",
      // ✅ Comentario con todos los usuarios asignados
      comentarios: `Gastos de viaje ${trip.city} ${formatDate(trip.startDate)}, ${formatDate(trip.endDate)} ${allUserNames}${trip.project ? ` – ${trip.project}` : ""}`,
      mes:                   mesNum,
      cobro:                 añoGasto,
      mesImputacion:         mesNum,
      imputacion:            añoGasto,
      proyecto:              trip.project ?? "",
      pagado:                "Sí",
      fechaPago:             "",
      // ✅ PERSONAL usa el primer usuario asignado
      personal:              userName,
      ppto:                  "",
      nNoches:               "",
      nPax:                  "",
      nTrayectos:            "",
      ciudad:                trip.city,
      certificado:           "",
      liberalidad:           "",
      certificadoCarta:      "",
      banco:                 BANCOS[expense.paymentMethod ?? "Tarjeta"] ?? BANCOS["Tarjeta"],
      presupuesto:           "",
      crm:                   "",
      crmProyecto:           "",
      inventarioFisico:      "",
    });
  });

  // Estilos header
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE3F2FD" },
  };

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="Hoja-de-Gastos-Viaje-${new Date().toISOString().slice(0, 10)}.xlsx"`,
    },
  });
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}