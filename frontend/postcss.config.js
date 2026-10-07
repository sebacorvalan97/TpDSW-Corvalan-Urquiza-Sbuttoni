// Le dice a Vite que procese los estilos con Tailwind CSS (versión 4).
// Sin este archivo, las clases como "flex", "p-6" o "bg-white" no hacen nada.
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
