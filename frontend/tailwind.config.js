/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class', // Enable class-based dark mode
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#f0f7ff',
                    100: '#e0effe',
                    200: '#bae0fd',
                    300: '#7cc7fb',
                    400: '#38a9f8',
                    500: '#0a8cf0', // Vibrant blue
                    600: '#0077b5', // LinkedIn Blue
                    700: '#005e93',
                    800: '#004f7c',
                    900: '#004268',
                    950: '#002941',
                },
            },
        },
    },
    plugins: [],
}
