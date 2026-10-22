# Warmup reports go to their own Counterscale site

The first launch depends on the network (ADR 0010): the splash waits while warmup fetches yt-dlp and the FFmpeg package, and every daily user fetches again whenever the binary manifest moves. The heartbeat cannot show whether that works. It goes out before the window opens, so before warmup starts, and it counts installs, not outcomes. A user who gives up on the splash looks the same as one who tried the app and left.

A warmup that has to fetch a managed binary therefore sends a **warmup report**: `started` at its first download, then one outcome (`ok`, `failed`, `stopped`, or `quit` when the app closes mid-download). The reports go to the heartbeat's collector under a second site id, `arroxy-warmup`, with their own nine dashboard slots. Started minus outcomes counts the setups that were abandoned, with no identifier.

## Considered options

- **Add the outcome to the heartbeat.** It leaves before the outcome exists, all nine slots are in use, and extra hits on site `arroxy` would inflate its Visitors, which stand for daily active installs. The dashboard cannot filter them back out.
- **Carry the outcome in the next day's heartbeat.** Only users who come back would report, which leaves out exactly the ones who gave up.
- **Hold back the first heartbeat until warmup settles.** A user who quits during setup would send nothing, so the install count, today's one reliable number, would also start to miss people.
- **Ask the user to send a report** (a button or a prompt on trouble). Rejected: Arroxy does not interrupt users for this.

## Consequences

- Nothing changes on the collector or Cloudflare. Counterscale accepts any site id at `/collect`, and its site picker lists every site with data in the last 90 days.
- Installed apps keep sending to `arroxy-warmup` for as long as they are in use, so renaming the site or moving it to another collector strands old versions.
- Warmup reports share the heartbeat's opt-out and its environment rules (`ARROXY_HEARTBEAT_URL`), and stay off in release builds behind the `warmupReport` release flag until the public wording says Arroxy sends them.
- The Counterscale server tracker keeps one global client, so warmup reports are a plain GET built to the same query format. That GET also returns a status code, so each report is kept until the collector takes it, and what a quit or a dead link left behind is sent once at the next launch.
