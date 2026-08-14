export const optionalField = <T>(field: T) => {
  if (field === undefined || field === null) return "-"
  return field
}
