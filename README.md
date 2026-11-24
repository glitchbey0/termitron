# Termitron

**[English](README.md) | [Türkçe](README.tr.md)** | **Live Demo:** https://termitron.tenix.tr

**Termitron** is a self-hosted, Node.js-based web workspace for managing SSH servers, SFTP files, Docker containers, noVNC remote desktops, and WireGuard VPN tunnels from a single browser interface.

## Features

- **Multi-Tab SSH Terminal**: Browser-based `xterm.js` terminal with customizable split-pane layouts, quick connect (`user@host:port`), and session persistence.
- **SFTP File Explorer & Editor**: Browse directories, upload/download files, edit text files inline (`Ctrl+S`), preview images/video/audio, and toggle `sudo` (root) mode.
- **Docker Management**: View containers, images, volumes, and networks; monitor live CPU/RAM usage; start/stop/restart containers; inspect logs; adjust resource limits; and open an interactive shell directly inside any running container.
- **noVNC Remote Desktop**: Connect to remote VNC servers securely tunneled over SSH.
- **VPN & Proxy Routing**: Built-in `wireproxy` (WireGuard SOCKS5) tunnel support with per-host SOCKS5 proxy chaining and admin kill-switch policies.
- **Server Sharing & Multi-User**: Personal access keys (`trm_...`), granular per-share permissions (`terminal`, `files_read`, `files_write`, `docker`, `vnc`, `edit_host`, `show_address`, `sudo`), and AES-256-GCM encrypted local storage.
- **MCP Integration**: Built-in Model Context Protocol (`/mcp` SSE/HTTP and `mcp_stdio.js`) for AI client integrations.
- **Admin Panel (`/admin`)**: Live traffic monitoring (RX/TX), active session control, WireGuard `.conf` management, and user management.

## Quick Start

### Docker

```bash
docker run -d \
  --name termitron \
  --restart unless-stopped \
  -p 8080:8080 \
  -e TERM_BIND=0.0.0.0:8080 \
  -v termitron_data:/app/data \
  glitchbey/termitron
```

View the generated **Access Token** and **Admin Key** in the container logs:

```bash
docker logs termitron
```

### Node.js

```bash
cd termitron
npm install
node server.js
```

By default, the server starts on `http://127.0.0.1:8080` and prints the generated access token and admin key to the console.

## Configuration (CLI & Environment Variables)

| Option / Env Var | Description | Default |
| --- | --- | --- |
| `--bind` / `TERM_BIND` | Bind address and port | `127.0.0.1:8080` |
| `--token` / `TERM_WEB_TOKEN` | Custom access token | Random hex |
| `--no-auth` / `TERM_NO_AUTH=1` | Disable login authentication | `false` |
| `TERM_DATA_DIR` | Directory for encrypted data | `./data` |
| `TERM_MASTER_KEY` | Master encryption passphrase | Auto-generated `.master.key` |
| `TERM_ADMIN_KEY` | Custom Admin Panel key | Auto-generated `adm_...` |

## Credits

- **Created by:** Yusuf Ziya Hop
- **Published by:** [@glitchbey0](https://github.com/glitchbey0)
- **Built with:** Gemini 4 Hydrogen model

## License

This project is licensed under the [MIT License](LICENSE).
