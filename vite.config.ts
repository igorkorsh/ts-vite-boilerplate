import path from "path"
import glob from "fast-glob"
import { fileURLToPath } from "url"
import { defineConfig, normalizePath } from "vite"
import { SpritePlugin } from "./plugins/vite-plugin-svg-sprite"
import { viteStaticCopy } from "vite-plugin-static-copy"
import inliveSvg from "postcss-inline-svg"
import sortMediaQueries from "postcss-sort-media-queries"
import rtlcss from "postcss-rtlcss"
import autoprefixer from "autoprefixer"

const isProd = process.env.NODE_ENV === "production"

export default defineConfig({
	root: path.resolve(__dirname, "src"),
	base: "./",
	publicDir: path.resolve(__dirname, "public"),
	plugins: [
		SpritePlugin(path.resolve(__dirname, "src/sprite")),
		isProd &&
			viteStaticCopy({
				targets: [
					{
						src: normalizePath(path.resolve(__dirname, "src/images/static/*")),
						dest: normalizePath(path.resolve(__dirname, "build/images"))
					}
					// {
					// 	src: normalizePath(path.resolve(__dirname, "src/assets/*")),
					// 	dest: normalizePath(path.resolve(__dirname, "build/assets"))
					// }
				]
			}),
		isProd && {
			name: "",
			transformIndexHtml(html) {
				return html.replace(/type=\"module\" crossorigin/g, "defer").replace(/(rel=\"stylesheet\") crossorigin/g, "$1")
			}
		}
	],
	css: {
		devSourcemap: isProd ? false : true,
		preprocessorOptions: {
			scss: {
				api: "modern",
				charset: false
			}
		},
		postcss: {
			plugins: [
				inliveSvg(),
				rtlcss(),
				sortMediaQueries({
					sort: "mobile-first"
				}),
				autoprefixer()
			]
		}
	},
	server: {
		port: 3000,
		host: true
	},
	build: {
		modulePreload: false,
		outDir: path.resolve(__dirname, "build"),
		assetsInlineLimit: 0,
		emptyOutDir: true,
		rollupOptions: {
			input: Object.fromEntries(
				glob
					.sync(["src/*.html"])
					.map(file => [path.basename(file, ".html"), fileURLToPath(new URL(file, import.meta.url))])
			),
			output: {
				entryFileNames() {
					return "scripts/[name].js"
				},
				assetFileNames(assetInfo) {
					if (assetInfo.names?.some(file => file.endsWith(".css"))) {
						return "styles/[name].css"
					}

					if (assetInfo.names?.some(file => /\.(eot|otf|ttf|woff2?)$/i.test(file))) {
						return "fonts/[name].[ext]"
					}

					if (assetInfo.names?.some(file => /\.(gif|jpe?g|png|svg|webp)$/i.test(file))) {
						return "images/[name].[ext]"
					}

					return "assets/[name].[ext]"
				}
			}
		}
	},
	optimizeDeps: {
		include: [path.resolve(__dirname, "src/*.html")]
	}
})
