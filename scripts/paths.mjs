export const LEGAL_ROUTES = {
  imprint: { en: "/imprint/", de: "/de/impressum/" },
  privacy: { en: "/privacy/", de: "/de/datenschutz/" },
};

export function legalPaths(locale) {
  return {
    imprintPath: LEGAL_ROUTES.imprint[locale],
    privacyPath: LEGAL_ROUTES.privacy[locale],
  };
}
