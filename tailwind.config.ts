import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
          "Apple Color Emoji",
          "Segoe UI Emoji",
          "Segoe UI Symbol",
          "Noto Color Emoji",
        ],
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'spin-elegant': 'spin 2s ease-in-out infinite',
        'spin-reverse': 'spin-reverse 3s ease-in-out infinite',
        'spin-smooth': 'spin 1.5s linear infinite',
        'spin-reverse-smooth': 'spin-reverse 2s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out infinite 2s',
        'float-slow': 'float 8s ease-in-out infinite 1s',
        'float-minimal': 'float-minimal 4s ease-in-out infinite',
        'float-delayed-minimal': 'float-minimal 4s ease-in-out infinite 1s',
        'float-slow-minimal': 'float-minimal 5s ease-in-out infinite 2s',
        'shimmer': 'shimmer 2s linear infinite',
        'bounce-gentle': 'bounce-gentle 2s ease-in-out infinite',
        'bounce-minimal': 'bounce-minimal 1s ease-in-out infinite',
        'pulse-gentle': 'pulse-gentle 3s ease-in-out infinite',
        'pulse-minimal': 'pulse-minimal 2s ease-in-out infinite',
        'pulse-offset': 'pulse-offset 2s ease-in-out infinite',
        'pulse-text': 'pulse-text 3s ease-in-out infinite',
        'typewriter': 'typewriter 2s ease-in-out infinite',
        'fade-text': 'fade-text 2s ease-in-out infinite',
        'loading-bar': 'loading-bar 2s ease-in-out infinite',
        'expand-bar': 'expand-bar 3s ease-in-out infinite',
        'wave': 'wave 1.5s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(180deg)' },
        },
        'float-minimal': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'bounce-gentle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'bounce-minimal': {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-6px) scale(1.1)' },
        },
        'spin-reverse': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(-360deg)' },
        },
        'pulse-gentle': {
          '0%, 100%': { opacity: '0.8', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        'pulse-minimal': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(0.95)' },
        },
        'pulse-offset': {
          '0%, 100%': { opacity: '0.6', transform: 'scale(0.8)' },
          '50%': { opacity: '1', transform: 'scale(1.2)' },
        },
        'pulse-text': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        typewriter: {
          '0%': { opacity: '0.7' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0.7' },
        },
        'fade-text': {
          '0%, 100%': { opacity: '0.8' },
          '50%': { opacity: '1' },
        },
        'loading-bar': {
          '0%': { width: '0%', opacity: '0' },
          '50%': { width: '100%', opacity: '1' },
          '100%': { width: '100%', opacity: '0' },
        },
        'expand-bar': {
          '0%': { width: '0%' },
          '50%': { width: '100%' },
          '100%': { width: '0%' },
        },
        wave: {
          '0%, 100%': { transform: 'translateY(0) scale(1)', opacity: '0.7' },
          '50%': { transform: 'translateY(-8px) scale(1.2)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
