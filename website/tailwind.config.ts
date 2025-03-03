import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	colors: {
  		crust: 'rgba(var(--crust))',
  		mantle: 'rgba(var(--mantle))',
  		base: 'rgba(var(--base))',
  		surface0: 'rgba(var(--surface0))',
  		surface1: 'rgba(var(--surface1))',
  		surface2: 'rgba(var(--surface2))',
  		overlay0: 'rgba(var(--overlay0))',
  		overlay1: 'rgba(var(--overlay1))',
  		overlay2: 'rgba(var(--overlay2))',
  		subtext0: 'rgba(var(--subtext0))',
  		subtext1: 'rgba(var(--subtext1))',
  		text: 'rgba(var(--text))',
  		lavender: 'rgba(var(--lavender))',
  		blue: 'rgba(var(--blue))',
  		sapphire: 'rgba(var(--sapphire))',
  		sky: 'rgba(var(--sky))',
  		teal: 'rgba(var(--teal))',
  		green: 'rgba(var(--green))',
  		yellow: 'rgba(var(--yellow))',
  		peach: 'rgba(var(--peach))',
  		maroon: 'rgba(var(--maroon))',
  		red: 'rgba(var(--red))',
  		mauve: 'rgba(var(--mauve))',
  		pink: 'rgba(var(--pink))',
  		flamingo: 'rgba(var(--flamingo))',
  		rosewater: 'rgba(var(--rosewater))',
  		white: 'rgba(var(--white))',
  		black: 'rgba(var(--black))',
  		github: 'rgba(var(--github))',
  		google: 'rgba(var(--google))',
  		gitlab: 'rgba(var(--gitlab))',
  		shadow: 'rgba(var(--shadow))',
  		title: 'rgba(var(--title))'
  	},
  	extend: {
  		keyframes: {
  			loading: {
  				from: {
  					transfrom: 'rotate(0)'
  				},
  				to: {
  					transform: 'rotate(360deg)'
  				}
  			},
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			loading: 'loading 3s linear Infinite',
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
