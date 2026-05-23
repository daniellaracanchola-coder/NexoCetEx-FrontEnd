export const GRADOS_OPCIONES = ['1', '2', '3', '4', '5', '6', '7', '8'] as const;

export const GRUPOS_OPCIONES = ['A', 'B', 'C', 'D', 'E', 'S'] as const;

export function etiquetaDestinoAviso(anuncio: {
  rolDes?: string;
  grado_des?: number | null;
  grupo_des?: string | null;
}): string | null {
  if (anuncio.rolDes !== 'alumno') return null;
  const partes: string[] = [];
  if (anuncio.grado_des != null) {
    partes.push(`Grado ${anuncio.grado_des}`);
  }
  if (anuncio.grupo_des) {
    partes.push(`Grupo ${anuncio.grupo_des}`);
  }
  if (!partes.length) return 'Todos los alumnos';
  return partes.join(' · ');
}
