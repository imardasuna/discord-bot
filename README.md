# discord-bot

Discord sohbet müzik botu. Sunucundaki ses kanalında çalar, sohbetten `!play` veya `/play` ile yönetilir. Spotify hesabını bağlayınca beğenilen şarkılar ve listeler kuyruğa alınabilir.

> Önemli: Spotify, ses akışını üçüncü parti botlara lisanslamaz. Bot Spotify'dan **parça / liste bilgisini** alır, sesi YouTube veya SoundCloud üzerinden çalar. Discord'un kendi "Listen Along" özelliği ise herkesin kendi Spotify Premium hesabını kullanır; o resmi yol bottan bağımsızdır.

Repo: https://github.com/imardasuna/discord-bot

## Ne yapar

- YouTube, Spotify linki, SoundCloud, düz metin arama
- Kuyruk, skip, pause, volume, loop, shuffle
- Slash komutlar (`/play`) ve sohbet öneki (`!play`)
- `/spotify login` ile kendi hesabını OAuth ile bağlama
- `/spotify liked`, `/spotify playlists`, `/spotify recent`

## Gereksinimler

- Node.js 18.17+
- FFmpeg (`ffmpeg-static` paketle gelir; sistemde FFmpeg olması daha sağlamlı)
- Discord bot uygulaması
- Spotify Developer uygulaması (liste/hesap özellikleri için)

## 1. Discord botu oluştur

1. [Discord Developer Portal](https://discord.com/developers/applications) → **New Application**
2. **Bot** sekmesi → Add Bot → token'i kopyala
3. Privileged Gateway Intents:
   - **Message Content Intent** aç (`!play` sohbet komutları için şart)
   - Server Members Intent gerekmez
4. OAuth2 → URL Generator:
   - Scopes: `bot`, `applications.commands`
   - Bot Permissions: `Connect`, `Speak`, `Send Messages`, `Embed Links`, `Read Message History`, `Use Voice Activity`
5. Üretilen linkle botu sunucuna ekle

## 2. Spotify uygulaması

1. [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) → **Create app**
2. Redirect URI olarak **aynen** şunu ekle:
   `http://127.0.0.1:8888/callback`
3. Client ID ve Client Secret'i kopyala
4. Web API'yi seç

Botu VPS'te çalıştırıyorsan redirect URI'yi genel adresin yap (örn. `https://alanadin.com/callback`) ve `.env` içindeki `SPOTIFY_REDIRECT_URI` ile `src/spotify/oauth.js` dinleme adresini ona göre güncelle.

## 3. Projeyi çalıştır

```bash
git clone https://github.com/imardasuna/discord-bot.git
cd discord-bot
cp .env.example .env
npm install
```

`.env` doldur:

```env
DISCORD_TOKEN=
DISCORD_CLIENT_ID=
DISCORD_GUILD_ID=
PREFIX=!
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
SPOTIFY_REDIRECT_URI=http://127.0.0.1:8888/callback
SPOTIFY_OAUTH_PORT=8888
```

`DISCORD_GUILD_ID` test sunucunun ID'si. Discord'da Ayarlar → Geliştirici Modu aç, sunucuya sağ tık → **ID'yi Kopyala**.

```bash
npm run deploy
npm start
```

Ses kanalına gir, sohbette:

```
!play drex atlanta
!play https://open.spotify.com/track/...
/spotify login
```

`/spotify login` linkini **botun çalıştığı makinede** aç (localhost callback yüzünden). Bağlantı token'ları `data/spotify-tokens.json` içine yazılır, git'e gitmez.

## Komutlar

| Sohbet | Slash | Ne işe yarar |
| --- | --- | --- |
| `!play <sorgu>` | `/play` | Çal / kuyruğa ekle |
| `!pause` `!resume` | `/pause` `/resume` | Duraklat / devam |
| `!skip` | `/skip` | Sonraki |
| `!stop` | `/stop` | Durdur, kanaldan çık |
| `!queue` | `/queue` | Kuyruk |
| `!np` | `/nowplaying` | Şu an çalan |
| `!volume 80` | `/volume` | Ses 0–150 |
| `!shuffle` | `/shuffle` | Karıştır |
| `!loop song` | `/loop` | `off` / `song` / `queue` |
| `!help` | `/help` | Yardım |
| `!sp login` | `/spotify login` | Hesap bağla |
| | `/spotify liked` | Beğenilenler |
| | `/spotify playlists` | Listeler |
| | `/spotify recent` | Son dinlenenler |

## Sık sorunlar

- **Bot sese giremiyor:** Connect + Speak izni ve ses kanalına senin de girmiş olman gerekir.
- **Slash komut yok:** `npm run deploy` çalıştır, `DISCORD_GUILD_ID` doğru olsun.
- **`!play` tepki vermiyor:** Message Content Intent kapalıdır.
- **Spotify login sayfası hata:** Redirect URI Dashboard ile `.env` birebir aynı olmalı (`http` vs `https`, `127.0.0.1` vs `localhost`).
- **YouTube "Sign in to confirm you are not a bot":** YouTube sık sık extractor'ları kırar. `npm update @distube/yt-dlp distube` dene veya Lavalink'e geç.
- **Token'i GitHub'a koyma.** Sadece `.env` kullan.

## Mimari

```
src/
  index.js              bot girişi, slash + önek
  deploy-commands.js    slash kaydı
  commands/             play, pause, spotify...
  music/distube.js      kuyruk + YouTube/Spotify eklentileri
  spotify/              OAuth, token saklama, Web API
```
