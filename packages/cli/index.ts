#!/usr/bin/env node

import { execSync } from "node:child_process"
import * as fs from "node:fs"
import {
    type IncomingMessage,
    type ServerResponse,
    createServer
} from "node:http"
import * as path from "node:path"
import { Command } from "commander"

// Parse CLI arguments using Commander (more tolerant with URLs containing "://")
const program = new Command()
    .name("@pimlico/cli")
    .usage("[options]")
    .addHelpText(
        "before",
        [
            "Starts a temporary local HTTP server, opens the Pimlico Dashboard",
            "setup page in your browser, waits for the generated API key, and",
            "saves it to a .env file. Can set up the passkey server for the project.",
            ""
        ].join("\n")
    )
    .option(
        "-n, --site-name <string>",
        "Human-readable name of your dApp / site (used in the passkey server)",
        "My dApp"
    )
    .option(
        "-o, --origin <string>",
        "The origin (protocol + host) your dApp will run on (used in the passkey server)",
        "http://localhost"
    )
    .option("-x, --no-open", "Skip automatically opening the browser window")
    .option(
        "-k, --key-var <string>",
        "Environment variable name to store the Pimlico API key",
        "PIMLICO_API_KEY"
    )
    .option(
        "-f, --env-path <string>",
        "Path to the .env file to update (relative or absolute)",
        ".env"
    )
    .option(
        "-p, --setup-passkey-server",
        "Also set up a passkey server for the project"
    )
    .option(
        "-d, --dashboard-base-url <string>",
        "Pimlico Dashboard base URL (protocol + host)",
        "https://dashboard.pimlico.io"
    )
    .addHelpText(
        "after",
        "\nFor full documentation visit https://docs.pimlico.io"
    )
    .allowUnknownOption(false)

program.parse(process.argv)

type CliOptions = {
    siteName: string
    origin: string
    keyVar: string
    envPath: string
    setupPasskeyServer: boolean
    dashboardBaseUrl: string
    open: boolean
}

// Commander camel-cases option names automatically (e.g. --site-name -> siteName)
const argv = program.opts<CliOptions>()

// Generate a link to the dashboard setup page
function generateSetupLink(options: {
    port: number
    siteName: string
    origin: string
    setupPasskey: boolean
    baseUrl: string
}) {
    const callbackUrl = encodeURIComponent(
        `http://localhost:${options.port}/callback`
    )
    const name = encodeURIComponent(options.siteName)
    const origin = encodeURIComponent(options.origin)
    const baseUrl = options.baseUrl
    const params = [
        `callback=${callbackUrl}`,
        `name=${name}`,
        `origin=${origin}`
    ]
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
        const startCmd =
            process.platform === "darwin"
                ? "open"
                : process.platform === "win32"
                  ? "start"
                  : "xdg-open"
        execSync(`${startCmd} "${url}"`, { stdio: "ignore" })
    } catch {
        // If the command fails just ignore – the user still has the link printed
    }
}

async function main() {
    const siteName = argv.siteName
    const origin = argv.origin
    const envVar = argv.keyVar
    const envPath = argv.envPath
    const setupPasskey = argv.setupPasskeyServer
    const dashboardBaseUrl = argv.dashboardBaseUrl

    const server = createServer(
        (req: IncomingMessage, res: ServerResponse): void => {
            if (!req.url) {
                res.statusCode = 400
                res.end("Invalid request")
                return
            }

            if (req.url.startsWith("/callback")) {
                const url = new URL(req.url, "http://localhost")
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
        }
    )

    server.listen(0, "127.0.0.1", () => {
        const addressInfo = server.address()
        if (addressInfo && typeof addressInfo === "object") {
            const port = addressInfo.port
            const link = generateSetupLink({
                port,
                siteName,
                origin,
                setupPasskey,
                baseUrl: dashboardBaseUrl
            })
            console.log(
                "👉  Open the following link in your browser to complete setup:\n"
            )
            console.log(link)
            console.log("\nWaiting for the dashboard to finish setup…")
            if (argv.open !== false) {
                openBrowser(link)
            }
        }
    })
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})
