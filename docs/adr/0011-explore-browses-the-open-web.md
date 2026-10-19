# Explore browses the open web

Explore started as a YouTube-only browser: the view loaded YouTube and Google's
sign-in pages, a link anywhere else opened in the system browser, and only
YouTube downloads could use the Explore session. That made Explore useless for
the other sites yt-dlp supports, where signing in matters just as much
(members-only posts, age gates, private uploads). Explore now loads any web
page, in the view, whether clicked, typed or redirected to. Non-web schemes are
still blocked and never handed to another program, a popup still needs the
user's click, and Google's sign-in and consent pages are still reached by
clicking a site's own Sign in, never typed.

The hard part is which cookies a download from another site gets. Three
options were weighed. The site's own domain only is the tightest, but many
sites keep their sign-in on another domain or serve the media from a player
on one, so it fails exactly the downloads escalation is for. The whole session
is what `--cookies-from-browser` does, and yt-dlp sends each cookie only to the
hosts it belongs to anyway, but it would write the Google account's cookies,
which open Gmail and every other Google service, into a file on every
escalation from any site. The choice is the whole session minus the account
cookies of the sites Explore knows (Google's and YouTube's): another site's jar
works across its own domains and never carries the Google account. YouTube
keeps its youtube.com-only jar.

Escalation stays as ADR 0008 decided: anonymous first, the Explore session only
after a failure an account can fix. For another site there is no sign-in rule
to check, so the session counts as signed in there when it holds any cookie
that site would be sent, and a sign-in check by loading the site answers
"cannot tell".

A run on another site also sends Explore's user agent with the jar. Sites
behind Cloudflare tie its clearance cookie to the browser that passed the
check, so the same cookies under yt-dlp's own user agent are challenged again
(a 403). YouTube runs keep yt-dlp's own client headers.

## Consequences

A download from a Google property other than YouTube (Drive, Photos) never gets
the Google account, so account-gated media there is out of reach. Adding it
would mean a site with its own Explore capability, not a wider web jar.

Because any cookie counts as signed in on another site, a tracking or consent
cookie can trigger one signed-in retry that does not help. It costs one extra
run on a download that had already failed.

The signed-in badge, the "Sign in with Explore" guidance and its automatic
retry still follow YouTube's sign-in only.

A page in the view can phish like any web page, and it shares the partition
with the Google sign-in. Cookies stay domain-scoped, so another site cannot
read Google's; the partition's permission lockdown, the bland user agent and
the popup rule are unchanged.
