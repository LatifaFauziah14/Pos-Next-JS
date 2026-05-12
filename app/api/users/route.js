import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { userPayloadSchema, userUpdateSchema } from "@/lib/validations";
import { UserService } from "@/services/user-service";

export async function GET() {
  const { response } = await assertAdmin();
  if (response) return response;

  const service = new UserService();
  const data = await service.listUsers();
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
      response: forbiddenResponse("Hanya admin yang dapat mengelola pengguna.", 403),
    };
  }

  return { session, response: null };
}

export async function POST(request) {
  const { response } = await assertAdmin();
  if (response) return response;

  const payload = await request.json();
  const parsed = userPayloadSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Data pengguna belum valid.",
        errors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    const service = new UserService();
    const data = await service.createUser(parsed.data);
    return NextResponse.json({ data, message: "Pengguna berhasil ditambahkan." });
  } catch (error) {
    return NextResponse.json(
      { message: safeErrorMessage(error, "Gagal menambahkan pengguna.") },
      { status: 400 },
    );
  }
}

export async function PATCH(request) {
  const { response } = await assertAdmin();
  if (response) return response;

  const payload = await request.json();
  const parsed = userUpdateSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Perubahan pengguna belum valid.",
        errors: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const normalized = {
    ...parsed.data,
    password: parsed.data.password?.trim() || undefined,
  };

  if (normalized.password && normalized.password.length < 6) {
    return NextResponse.json(
      {
        message: "Password baru minimal 6 karakter.",
        errors: {
          password: ["Password baru minimal 6 karakter."],
        },
      },
      { status: 400 },
    );
  }

  try {
    const service = new UserService();
    const data = await service.updateUser(normalized.id, normalized);
    return NextResponse.json({ data, message: "Pengguna berhasil diperbarui." });
  } catch (error) {
    return NextResponse.json(
      { message: safeErrorMessage(error, "Gagal memperbarui pengguna.") },
      { status: 400 },
    );
  }
}

export async function DELETE(request) {
  const { session, response } = await assertAdmin();
  if (response) return response;

  const payload = await request.json();
  const id = Number(payload?.id);

  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ message: "ID pengguna tidak valid." }, { status: 400 });
  }

  if (session.id === id) {
    return NextResponse.json(
      { message: "Akun yang sedang dipakai tidak bisa dihapus." },
      { status: 400 },
    );
  }

  try {
    const service = new UserService();
    await service.deleteUser(id);
    return NextResponse.json({ message: "Pengguna berhasil dihapus." });
  } catch (error) {
    return NextResponse.json(
      { message: safeErrorMessage(error, "Gagal menghapus pengguna.") },
      { status: 400 },
    );
  }
}
