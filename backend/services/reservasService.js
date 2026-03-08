export function validarReserva ({nombre, email}) {
    if(!nombre || nombre.length < 2) {
        throw new Error ("Nombre inválido");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test (email)) {
        throw new Error ("Email inválido");
    }
}

export function validarFotosExistentes(fotos) {
  if (!Array.isArray(fotos) || fotos.length === 0) {
    throw new Error("Debes seleccionar al menos una foto");
  }

  fotos.forEach(f => {
    if (!Number.isInteger(Number(f))) {
      throw new Error("Foto inválida");
    }
  });
}
// Verificar duplicado
export async function verificarReservaDuplicada(pool, email, fotos) {
  const { rows } = await pool.query(
    `
    SELECT id
    FROM reservas
    WHERE email = $1
      AND fotos = $2
      AND estado = 'pendiente'
    `,
    [email, JSON.stringify(fotos)]
  );

  return rows.length > 0;
}