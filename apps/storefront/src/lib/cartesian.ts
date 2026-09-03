/**
 * Every combination of one value from each named group, e.g.
 * cartesian({ Size: ["S", "M"], Color: ["Red"] }) ->
 * [{ Size: "S", Color: "Red" }, { Size: "M", Color: "Red" }]
 */
export function cartesian<T>(
  groups: Record<string, T[]>,
): Record<string, T>[] {
  return Object.entries(groups).reduce<Record<string, T>[]>(
    (combinations, [key, values]) =>
      combinations.flatMap((combination) =>
        values.map((value) => ({ ...combination, [key]: value })),
      ),
    [{}],
  )
}
