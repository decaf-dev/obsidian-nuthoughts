# NuThoughts

## About

This is an Obsidian plugin that runs a Bun.sh server. It allows a [NuThoughts app](https://github.com/trey-wallis/nuthoughts) to send data to an Obsidian vault.

## Installation

### From release

1. Install the plugin using [Obsidian BRAT](https://github.com/TfTHacker/obsidian42-brat)
2. Enable the plugin

### From clone

1. Clone the github repository
2. Install [bun](https://bun.sh)
3. Build the project `bun run build`
4. Add a symbolic link to your vault's plugin folder

-   `ln -s /obsidian-nuthoughts/dist /.obsidian/plugins/obsidian-nuthoughts`

5. Enable the plugin

## Usage

When you open Obsidian, the server will be running.

There is also a manual run server command if you disable run on start up.

## Roadmap

Bun updates

-   [ ] Remove Babel once Bun supports CommonJS

## Developer

### Debugging

Check if a child process is running

```bash
lsof -i tcp:<port>
```

Kill the process

```bash
kill -9 <pid>
```
