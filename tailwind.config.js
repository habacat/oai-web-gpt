/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: "class",
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}"
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    500: "#00B981",
                    600: "#059669",
                },
                'custom-purple': '#cda4de',
                'custom-gold': '#ffd700',
                'fuchsia-400': '#d946ef', // Tailwind CSS中的Fuchsia 400颜色代码
                'oaiwhite': '#f9f9f9',
                'oaigray': '#ececec',
                'oaiblack': '#171717',
                'oaidarkgray': '#212121',
                'oaidarkgray2': '#2f2f2f',
                'oaidarkgray3': '#1c1c1c',
                'oaipurple': '#9c6afa',
                'oaigray2': '#7f7f7f',
                'oaitextblack': '#0d0d0d',
                'oaitextwhite': '#ececec',
                'oaigreen': '#10a37f',
                'oaigreen2': '#549174'
            },
            boxShadow: {
                'inset': 'inset 0 0 0 150px #0000001a',
            }
        }
    },
    variants: {
        extend: {
            boxShadow: ['hover'],
        },
    },
    plugins: []
}
