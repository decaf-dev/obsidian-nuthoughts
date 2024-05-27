# NuThoughts

NuThoughts is an Obsidian plugin that runs an Express.JS server. It allows a [NuThoughts app](https://github.com/decaf-dev/nuthoughts) to send data to an Obsidian vault.

## About

-   [Installation](#installation)
-   [Certificate authority](#certificate-authority)
-   [Usage](#usage)
-   [Development](#development)

## Installation

1. Install the [Obsidian BRAT](https://github.com/TfTHacker/obsidian42-brat) plugin from Obsidian community plugin store
2. Enable the plugin
3. Open the plugin settings
4. Click **Add beta plugin**
5. Enter the repository url: **https://github.com/decaf_dev/obsidian-nuthoughts**
6. Click **Add plugin**

## Certificate authority

NuThoughts uses a self-signed TLS certificate that is issued by a local certificate authority.

1. Open the Obsidian settings
2. Navigate to **Obsidian NuThoughts**
3. Under certificate authority click **Generate**
4. Restart Obsidian
5. Upload the certificate authority to the device that is running the NuThoughts app
6. Go to the settings in the app
7. Click "Certificate authority"
8. Navigate to the file and click it
9. Success. Your app is now configured to accept certificates issued from the certificate authority.

## Usage

When you open first Obsidian, the server will automatically be running.

There is also a manual run server command if you disable run on start up.

## Development

### By clone

1. Clone the github repository
2. Install [bun](https://bun.sh)
3. Build the project `bun run build`
4. Add a symbolic link to your vault's plugin folder

-   `ln -s /obsidian-nuthoughts/dist /.obsidian/plugins/obsidian-nuthoughts`

5. Enable the plugin
