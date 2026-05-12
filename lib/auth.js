import { cookies } from "next/headers";
import { createHmac } from "node:crypto";

const COOKIE_NAME = "pos_session";

function getSecret() {
  return process.env.AUTH_SECRET || "dev-secret-pos";
}

function sign(payload) {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

export async function createSession(user) {
  const payload = Buffer.from(
    JSON.stringify({
      id: user.id,
      username: user.username,
      roleName: user.roleName,
      branchId: user.branchId,
      branchName: user.branchName,
      roleId: user.roleId,
    }),
  ).toString("base64url");
  const signature = sign(payload);

  const store = await cookies();
  store.set(COOKIE_NAME, `${payload}.${signature}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

export async function getSession() {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return null;

  const [payload, signature] = raw.split(".");
  if (!payload || !signature) return null;
  if (sign(payload) !== signature) return null;

  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
