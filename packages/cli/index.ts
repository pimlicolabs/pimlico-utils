#!/usr/bin/env node

import { createServer, IncomingMessage, ServerResponse } from "http"
import * as fs from "fs"
import * as path from "path"
import { execSync } from "child_process"
import yargs from "yargs"
import { hideBin } from "yargs/helpers"

// Parse CLI arguments using yargs to provide robust help for LLMs (and humans!)
const argv = yargs(hideBin(process.argv))
    .scriptName("@pimlico/cli")
    .usage(
        "$0 [options]",
        [
            "Starts a temporary local HTTP server, opens the Pimlico Dashboard",
            "setup page in your browser, waits for the generated API key, and",
            "saves it to a .env file. Can set up the passkey server for the project."].join(" \n")
    )
    .option("site-name", {
        alias: ["name", "n"],
        type: "string",
        description: "Human-readable name of your dApp / site (used in the passkey server)",
        default: "My dApp"
    })
    .option("origin", {
        alias: ["o"],
        type: "string",
        description: "The origin (protocol + host) your dApp will run on (used in the passkey server)",
        default: "http://localhost"
    })
    .option("no-open", {
        alias: ["x"],
        type: "boolean",
        description: "Skip automatically opening the browser window",
        default: false
    })
    .option("key-var", {
        alias: ["k"],
        type: "string",
        description: "Environment variable name to store the Pimlico API key",
        default: "PIMLICO_API_KEY"
    })
    .option("env-path", {
        alias: ["f", "env-file"],
        type: "string",
        description: "Path to the .env file to update (relative or absolute)",
        default: ".env"
    })
    .option("setup-passkey-server", {
        alias: ["p"],
        type: "boolean",
        description: "Also set up a passkey server for the project",
        default: false
    })
    .option("dashboard-base-url", {
        alias: ["d", "dashboard-url"],
        type: "string",
        description: "Pimlico Dashboard base URL (protocol + host)",
        default: "https://dashboard.pimlico.io"
    })
    .example(
        "$0 --site-name 'Awesome dApp' --origin https://example.com",
        "Generates an API key for https://example.com titled 'Awesome dApp'."
    )
    .epilog("For full documentation visit https://docs.pimlico.io")
    .help()
    .strict()
    .parseSync()

// Generate a link to the dashboard setup page
function generateSetupLink(options: { port: number; siteName: string; origin: string; setupPasskey: boolean; baseUrl: string }) {
    const callbackUrl = encodeURIComponent(`http://localhost:${options.port}/callback`)
    const name = encodeURIComponent(options.siteName)
    const origin = encodeURIComponent(options.origin)
    const baseUrl = options.baseUrl
    const params = [`callback=${callbackUrl}`, `name=${name}`, `origin=${origin}`]
    if (options.setupPasskey) params.push("passkey=1")
    return `${baseUrl}/cli-setup?${params.join("&")}`
}

function updateEnvFile(envPathInput: string, envVar: string, apiKeyId: string) {
    const envPath = path.isAbsolute(envPathInput)
        ? envPathInput
        : path.resolve(process.cwd(), envPathInput)

    let content = ""
    if (fs.existsSync(envPath)) {
        content = fs.readFileSync(envPath, { encoding: "utf8" })
        // Remove any previously set key
        content = content
            .split("\n")
            .filter((line) => !line.startsWith(`${envVar}=`))
            .join("\n")
            .trim()
    }

    if (content.length > 0 && !content.endsWith("\n")) {
        content += "\n"
    }

    content += `${envVar}=${apiKeyId}\n`
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
    const siteName = argv["site-name"]
    const origin = argv["origin"]
    const envVar = argv["key-var"]
    const envPath = argv["env-path"]
    const setupPasskey = argv["setup-passkey-server"]
    const dashboardBaseUrl = argv["dashboard-base-url"]

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
                updateEnvFile(envPath, envVar, apiKey)
                console.log(`${envPath} updated with ${envVar}`)
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
            const link = generateSetupLink({ port, siteName, origin, setupPasskey, baseUrl: dashboardBaseUrl })
            console.log("👉  Open the following link in your browser to complete setup:\n")
            console.log(link)
            console.log("\nWaiting for the dashboard to finish setup…")
            if (!argv["no-open"]) {
                openBrowser(link)
            }
        }
    })
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
}) 