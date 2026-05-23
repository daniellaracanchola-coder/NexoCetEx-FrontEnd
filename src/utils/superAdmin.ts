export const SUPER_ADMIN_USERNAME = 'SuperAdmin';

export function esSuperAdmin(usuario: { username?: string } | null | undefined): boolean {
  return usuario?.username === SUPER_ADMIN_USERNAME;
}
