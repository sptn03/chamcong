/**
 * Helper xây dựng SET clause cho UPDATE query.
 * Giảm boilerplate dynamic field building ở tất cả repositories.
 *
 * @example
 *   const { setClauses, values } = buildUpdateSet([
 *     ['name', input.name],
 *     ['code', input.code],
 *     ['timezone', input.timezone],
 *   ]);
 *   // setClauses = ['name = $1', 'code = $2'] (bỏ qua undefined)
 *   // values = ['Acme', 'ACME']
 */
export function buildUpdateSet(
  fields: Array<[string, unknown | undefined]>,
): { setClauses: string[]; values: unknown[] } {
  const setClauses: string[] = [];
  const values: unknown[] = [];

  for (const [column, value] of fields) {
    if (value !== undefined) {
      setClauses.push(`${column} = $${values.length + 1}`);
      values.push(value);
    }
  }

  return { setClauses, values };
}
