export function sincronizarUsuarioLocal(perfil: {
  id?: number;
  username?: string;
  rol?: string;
  grado?: number | null;
  grupo?: string | null;
}) {
  try {
    const actual = JSON.parse(localStorage.getItem('usuario') || '{}');
    localStorage.setItem(
      'usuario',
      JSON.stringify({
        ...actual,
        ...perfil,
      })
    );
  } catch {
    /* ignore */
  }
}

export function usuarioVeAviso(
  usuario: {
    rol?: string;
    username?: string;
    grado?: number | string | null;
    grupo?: string | null;
  } | null,
  aviso: {
    rolDes?: string;
    autor?: string;
    grado_des?: number | null;
    grupo_des?: string | null;
  }
): boolean {
  if (!usuario) return false;
  if (usuario.rol === 'admin') return true;
  if (aviso.rolDes === 'todos') return true;
  if (usuario.username === aviso.autor) return true;
  if (aviso.rolDes !== usuario.rol) return false;

  if (aviso.rolDes === 'alumno') {
    if (
      aviso.grado_des != null &&
      Number(usuario.grado) !== Number(aviso.grado_des)
    ) {
      return false;
    }
    if (
      aviso.grupo_des &&
      usuario.grupo !== aviso.grupo_des
    ) {
      return false;
    }
  }

  return true;
}
