/**
 * Diccionario y normalizador para mapear nombres de países a banderas emoji.
 */
const COUNTRY_FLAGS: Record<string, string> = {
  argentina: '🇦🇷',
  italia: '🇮🇹',
  espana: '🇪🇸',
  mexico: '🇲🇽',
  francia: '🇫🇷',
  japon: '🇯🇵',
  peru: '🇵🇪',
  brasil: '🇧🇷',
  china: '🇨🇳',
  grecia: '🇬🇷',
  'estados unidos': '🇺🇸',
  eeuu: '🇺🇸',
  usa: '🇺🇸',
  alemania: '🇩🇪',
  'reino unido': '🇬🇧',
  inglaterra: '🇬🇧',
  india: '🇮🇳',
  colombia: '🇨🇴',
  chile: '🇨🇱',
  uruguay: '🇺🇾',
  venezuela: '🇻🇪',
  cuba: '🇨🇺',
  tailandia: '🇹🇭',
  vietnam: '🇻🇳',
  turquia: '🇹🇷',
  libano: '🇱🇧',
  marruecos: '🇲🇦',
  paraguay: '🇵🇾',
  bolivia: '🇧🇴',
  ecuador: '🇪🇨',
};

export function getCountryFlag(countryName?: string | null): string {
  if (!countryName) return '🌍';
  const clean = countryName
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  for (const [key, flag] of Object.entries(COUNTRY_FLAGS)) {
    if (clean.includes(key)) {
      return flag;
    }
  }
  return '🌍';
}
