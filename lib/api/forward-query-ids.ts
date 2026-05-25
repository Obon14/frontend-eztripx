/** Forward repeated id query params to upstream URLSearchParams. */
export function forwardIdListParams(
  searchParams: URLSearchParams,
  qs: URLSearchParams,
  singularKey: string,
  pluralKey: string,
) {
  const plural = searchParams.getAll(pluralKey);
  if (plural.length > 0) {
    for (const v of plural) {
      for (const part of v.split(",")) {
        const trimmed = part.trim();
        if (trimmed) qs.append(pluralKey, trimmed);
      }
    }
    return;
  }
  const single = searchParams.get(singularKey);
  if (single) qs.append(pluralKey, single);
}
