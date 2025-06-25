#!/usr/bin/env node

import { createServer, IncomingMessage, ServerResponse } from "http"
import * as fs from "fs"
import * as path from "path"
import { execSync } from "child_process"

// Simple argument parser supporting flags like --site-name "My DApp" --origin https://example.com
function parseCliArgs(argv: string[]) {
    const args: Record<string, string> = {}

    for (let i = 0; i < argv.length; i++) {
        const current = argv[i]
        if (current.startsWith("--")) {
            // Support --flag=value or --flag value
            const [flag, maybeValue] = current.split("=", 2)
            const normalizedFlag = flag.replace(/^--/, "")
            if (maybeValue !== undefined) {
                args[normalizedFlag] = maybeValue
            } else {
                // take next arg as value if it does not start with --
                const next = argv[i + 1]
                if (next && !next.startsWith("--")) {
                    args[normalizedFlag] = next
                    i++
                } else {
                    // boolean flag (not expected currently)
                    args[normalizedFlag] = "true"
                }
            }
        } else {
            // Positional args: first => site-name, second => origin
            if (!args["site-name"] && !args["name"]) {
                args["site-name"] = current
            } else if (!args["origin"]) {
                args["origin"] = current
            }
        }
    }

    // aliases
    if (args["name"] && !args["site-name"]) {
        args["site-name"] = args["name"]
    }

    return args
}

// Generate a link to the dashboard setup page
function generateSetupLink(options: { port: number; siteName: string; origin: string }) {
    const callbackUrl = encodeURIComponent(`http://localhost:${options.port}/callback`)
    const name = encodeURIComponent(options.siteName)
    const origin = encodeURIComponent(options.origin)

    // By default we assume the dashboard is running locally at localhost:3000.
    // This can be overridden with the DASHBOARD_BASE_URL env variable
    const baseUrl = process.env.DASHBOARD_BASE_URL || "http://localhost:3000"
    return `${baseUrl}/cli-setup?callback=${callbackUrl}&name=${name}&origin=${origin}`
}

function updateEnvFile(apiKeyId: string) {
    const envPath = path.resolve(process.cwd(), ".env")
    let content = ""
    if (fs.existsSync(envPath)) {
        content = fs.readFileSync(envPath, { encoding: "utf8" })
        // Remove any previously set key
        content = content
            .split("\n")
            .filter((line) => !line.startsWith("PIMLICO_API_KEY="))
            .join("\n")
            .trim()
    }

    if (content.length > 0 && !content.endsWith("\n")) {
        content += "\n"
    }

    content += `PIMLICO_API_KEY=${apiKeyId}\n`
    fs.writeFileSync(envPath, content, { encoding: "utf8" })
}

function openBrowser(url: string) {
    try {
        // macOS, Linux, Windows
        const startCmd = process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open"
        execSync(`${startCmd} "${url}"`, { stdio: "ignore" })
    } catch {
        // If the command fails just ignore – the user still has the link printed
    }
}

async function main() {
    const rawArgs = process.argv.slice(2)
    const parsed = parseCliArgs(rawArgs)

    const siteName = parsed["site-name"] || "My dApp"
    const origin = parsed["origin"] || "http://localhost"

    const server = createServer((req: IncomingMessage, res: ServerResponse): void => {
        if (!req.url) {
            res.statusCode = 400
            res.end("Invalid request")
            return
        }

        if (req.url.startsWith("/callback")) {
            const url = new URL(req.url, `http://localhost`)
            const apiKey = url.searchParams.get("apikey")
            res.statusCode = 200
            res.setHeader("Content-Type", "text/plain")
            if (apiKey) {
                res.end("API key received! You can now close this tab.")
                console.log(`\n✅  Received API key id: ${apiKey}`)
                updateEnvFile(apiKey)
                console.log(".env file updated with PIMLICO_API_KEY")
                server.close()
                // Quit after a short delay to allow stdout to flush
                setTimeout(() => process.exit(0), 2000)
            } else {
                res.end("No apiKey param found in callback URL.")
            }
            return
        }

        res.statusCode = 404
        res.end()
    })

    server.listen(0, "127.0.0.1", () => {
        const addressInfo = server.address()
        if (addressInfo && typeof addressInfo === "object") {
            const port = addressInfo.port
            const link = generateSetupLink({ port, siteName, origin })
            console.log("👉  Open the following link in your browser to complete setup:\n")
            console.log(link)
            console.log("\nWaiting for the dashboard to finish setup…")
            openBrowser(link)
        }
    })
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
}) 