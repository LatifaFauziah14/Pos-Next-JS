import bcrypt from "bcrypt";

export async function hashPassword(username, password) {
  return bcrypt.hash(`${username}${password}`, 10);
}

export async function verifyPassword(username, password, hashedPassword) {
  if (!username || !password || !hashedPassword) {
    return false;
  }

  return bcrypt.compare(`${username}${password}`, hashedPassword);
}
