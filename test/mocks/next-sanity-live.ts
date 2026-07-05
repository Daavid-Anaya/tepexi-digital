interface DefineLiveResult {
  sanityFetch: (options?: unknown) => Promise<{ data: unknown }>
  SanityLive: () => null
}

export function defineLive(): DefineLiveResult {
  return {
    sanityFetch: async () => ({ data: null }),
    SanityLive: () => null,
  }
}
