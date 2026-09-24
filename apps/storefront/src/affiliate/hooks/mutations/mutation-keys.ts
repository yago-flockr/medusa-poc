export const mutationKeys = {
  auth: {
    postAuthAffiliateEmailpass: ["postAuthAffiliateEmailpass"] as const,
  },
  products: {
    postAffiliatesProducts: ["postAffiliatesProducts"] as const,
    deleteAffiliatesProduct: ["deleteAffiliatesProduct"] as const,
  },
  profile: {
    patchAffiliatesMe: ["patchAffiliatesMe"] as const,
  },
}
