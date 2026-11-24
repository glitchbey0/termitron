# Termitron

**[English](README.md) | [Türkçe](README.tr.md)** | **Canlı Demo:** https://termitron.tenix.tr

**Termitron**; SSH sunucularını, SFTP dosyalarını, Docker konteynerlerini, noVNC uzak masaüstlerini ve WireGuard VPN tünellerini tek bir tarayıcı arayüzünden yönetmek için geliştirilmiş, Node.js tabanlı bağımsız bir web çalışma alanıdır.

## Özellikler

- **Çok Sekmeli SSH Terminali**: Özelleştirilebilir bölünmüş ekran düzeni, hızlı bağlan (`user@host:port`) ve oturum koruma özellikli `xterm.js` tabanlı tarayıcı terminali.
- **SFTP Dosya Gezgini ve Düzenleyici**: Dizinlerde gezinme, dosya yükleme/indirme, satır içi metin düzenleme (`Ctrl+S`), resim/video/ses önizleme ve `sudo` (root) modu desteği.
- **Docker Yönetimi**: Konteyner, imaj, volume ve ağları görüntüleme; anlık CPU/RAM kullanımını izleme; başlatma/durdurma/yeniden başlatma; logları inceleme; kaynak limitlerini güncelleme ve çalışan konteynerlerin içine doğrudan etkileşimli terminal açma.
- **noVNC Uzak Masaüstü**: SSH tüneli üzerinden güvenli noVNC uzak masaüstü bağlantısı.
- **VPN ve Proxy Yönlendirme**: Dahili `wireproxy` (WireGuard SOCKS5) tünel desteği, sunucu bazlı SOCKS5 proxy zincirleme ve yönetici kill-switch politikaları.
- **Sunucu Paylaşımı ve Çoklu Kullanıcı**: Kişisel erişim anahtarları (`trm_...`), paylaşım bazlı detaylı izinler (`terminal`, `files_read`, `files_write`, `docker`, `vnc`, `edit_host`, `show_address`, `sudo`) ve AES-256-GCM şifreli yerel veri depolama.
- **MCP Entegrasyonu**: Yapay zeka istemcileri için dahili Model Context Protocol (`/mcp` SSE/HTTP ve `mcp_stdio.js`) desteği.
- **Yönetici Paneli (`/admin`)**: Anlık trafik izleme (RX/TX), aktif oturum yönetimi, WireGuard `.conf` yapılandırması ve kullanıcı yönetimi.

## Hızlı Kurulum ve Başlatma

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

Oluşturulan **Erişim Token'ı** ve **Admin Key** bilgilerini konteyner loglarından görüntülemek için:

```bash
docker logs termitron
```

### Node.js

```bash
cd termitron
npm install
node server.js
```

Varsayılan olarak sunucu `http://127.0.0.1:8080` adresinde başlar ve oluşturulan erişim token'ı ile yönetici anahtarını konsola yazdırır.

## Yapılandırma (CLI ve Ortam Değişkenleri)

| Parametre / Ortam Değişkeni | Açıklama | Varsayılan |
| --- | --- | --- |
| `--bind` / `TERM_BIND` | Dinlenecek IP ve port | `127.0.0.1:8080` |
| `--token` / `TERM_WEB_TOKEN` | Özel erişim anahtarı | Rastgele hex |
| `--no-auth` / `TERM_NO_AUTH=1` | Giriş doğrulamasını devre dışı bırakır | `false` |
| `TERM_DATA_DIR` | Şifreli verilerin saklanacağı klasör | `./data` |
| `TERM_MASTER_KEY` | Ana şifreleme parolası | Otomatik `.master.key` |
| `TERM_ADMIN_KEY` | Özel Yönetici Paneli anahtarı | Otomatik `adm_...` |

## Emeği Geçenler

- **Geliştirici:** Yusuf Ziya Hop
- **Yayınlayan:** [@glitchbey0](https://github.com/glitchbey0)
- **Geliştirme Desteği:** Gemini 4 Hydrogen modeli ile geliştirilmiştir.

## Lisans

Bu proje [MIT Lisansı](LICENSE) ile lisanslanmıştır.
