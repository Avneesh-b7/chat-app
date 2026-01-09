import bcrypt from "bcrypt";

/* ----------------------------- TYPES ----------------------------- */
type HashPasswordParams = {
  password: string;
};

type HashPasswordResult = {
  hashedPassword: string;
};

/* -------------------------- HASH PASSWORD -------------------------- */
export async function hashPassword(
  params: HashPasswordParams
): Promise<HashPasswordResult> {
  const { password } = params;

  /* ----------------------------- VALIDATION ----------------------------- */
  if (!password || typeof password !== "string") {
    throw new Error("Invalid password input");
  }

  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters long");
  }

  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

  /* ----------------------------- HASHING ----------------------------- */
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    return { hashedPassword };
  } catch (error: any) {
    throw new Error("Failed to hash password");
  }
}
