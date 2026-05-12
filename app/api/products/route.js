import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  productPayloadSchema,
  productRestockSchema,
  productUpdateSchema,
} from "@/lib/validations";
import { ProductService } from "@/services/product-service";

export async function GET() {
  const service = new ProductService();
  const data = await service.listForTable();
  return NextResponse.json({ data });
}

function forbiddenResponse(message, status = 403) {
  return NextResponse.json({ message }, { status });
}

function safeErrorMessage(error, fallback) {
  const message = error?.message || "";

  if (message.includes("Failed query") || message.includes("Table ") || message.includes("Unknown column")) {
    return fallback;
  }

  return message || fallback;
}

async function assertAdmin() {
  const session = await getSession();

  if (!session) {
    return {
      session: null,
      response: forbiddenResponse("Silakan login terlebih dahulu.", 401),
    };
  }

  if (session.roleName !== "admin" && session.roleId !== 1) {
    return {
      session,
      response: forbiddenResponse("Hanya admin yang dapat mengelola produk.", 403),
    };
  }

  return { session, response: null };
}

export async function POST(request) {
  const { response } = await assertAdmin();
  if (response) return response;

  const payload = await request.json();
  const isRestock = payload?.action === "restock";
  const parsed = isRestock
    ? productRestockSchema.safeParse(payload)
    : productPayloadSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: isRestock ? "Data restok belum valid." : "Data produk belum valid.",
        errors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    const service = new ProductService();
    const data = isRestock
      ? await service.restockProduct(parsed.data.productId, parsed.data.additionalStock)
      : await service.createProduct(parsed.data);

    return NextResponse.json({
      data,
      message: isRestock
        ? "Stok produk berhasil ditambahkan."
        : "Produk berhasil ditambahkan.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: safeErrorMessage(
          error,
          isRestock ? "Gagal restok produk." : "Gagal menambahkan produk.",
        ),
      },
      { status: 400 },
    );
  }
}

export async function PATCH(request) {
  const { response } = await assertAdmin();
  if (response) return response;

  const payload = await request.json();
  const parsed = productUpdateSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Perubahan produk belum valid.",
        errors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    const service = new ProductService();
    const data = await service.updateProduct(parsed.data.id, parsed.data);
    return NextResponse.json({ data, message: "Produk berhasil diperbarui." });
  } catch (error) {
    return NextResponse.json(
      { message: safeErrorMessage(error, "Gagal memperbarui produk.") },
      { status: 400 },
    );
  }
}

export async function DELETE(request) {
  const { response } = await assertAdmin();
  if (response) return response;

  const payload = await request.json();
  const id = Number(payload?.id);

  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ message: "ID produk tidak valid." }, { status: 400 });
  }

  try {
    const service = new ProductService();
    await service.deleteProduct(id);
    return NextResponse.json({ message: "Produk berhasil dihapus." });
  } catch (error) {
    return NextResponse.json(
      { message: safeErrorMessage(error, "Gagal menghapus produk.") },
      { status: 400 },
    );
  }
}
