# WordPress content-upgrade box: Writer's Word Bank

A styled inline box to drop into the word-list and vocabulary posts on
becomeawritertoday.com. It offers the free Writer's Word Bank in exchange for an
email, using the Kit form built per `kit-form-spec.md`.

## Where to place it

Put the box on the vocabulary / word-list posts, the ones that pull the residual
search traffic this magnet is matched to. These include (and any post like them):

- good-words-to-rhyme-with
- words-for-poets
- list-of-random-words
- deep-words-for-love
- descriptive-words-list
- emotion-words-list
- list-of-conjunction-words
- sensory-words / sensory-language posts
- action-verbs / strong-verbs posts

Place it once per post, ideally after the first list or about a third of the way
down, where the reader has seen the article deliver and is most likely to want
more. Do not stack it with another opt-in in the same post.

## How to install it

Two options:

1. **Snippet plugin (recommended for a quick rollout):** paste the HTML below into
   a reusable block or a shortcode via a snippet plugin (for example WPCode or a
   Reusable Block), then insert that block into each target post. One place to
   edit later.
2. **Post template / theme:** if the word-list posts share a category, the box can
   be added to that category's template so it appears automatically. Only do this
   if the category is clean (word-list posts only), or it will show on unrelated
   posts.

## The two ways to wire the form

### Option A (preferred): embed the Kit form directly

Replace the button link in the HTML below with the Kit inline form embed that Kit
gives you (Kit > your form > Embed > either the JavaScript snippet or the HTML
form action). That keeps the reader on the page and captures the email inline.
Kit's embed code drops in where the `<!-- KIT FORM EMBED GOES HERE -->` comment
is.

### Option B (fastest): link to the hosted Kit form

If you would rather not paste embed code into every post, keep the button and
point it at the Kit-hosted form URL (Kit gives each form a shareable URL). Set the
button `href` to that URL. Less seamless, but zero embed maintenance.

## The HTML box

```html
<div style="background:#f6f4ef;border:1px solid #e3ddd2;border-left:4px solid #b23a48;border-radius:10px;padding:22px 24px;margin:28px 0;font-family:Georgia,'Times New Roman',Times,serif;color:#2b2b2b">
  <p style="font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:#b23a48;font-weight:700;margin:0 0 8px">Free download</p>
  <h3 style="font-size:22px;line-height:1.15;margin:0 0 10px;color:#2b2b2b">Want the complete Writer's Word Bank?</h3>
  <p style="font-size:16px;line-height:1.6;color:#555;margin:0 0 16px;max-width:60ch">
    Get more than 900 vivid words by category, free. Descriptive, sensory, emotion, action,
    love, nature, connectors, and words for poets, all in one printable page. Keep it open beside your draft.
  </p>

  <!-- KIT FORM EMBED GOES HERE (Option A). Or use the button below (Option B). -->

  <a href="REPLACE_WITH_KIT_FORM_URL"
     style="display:inline-block;background:#b23a48;color:#fff;font-weight:700;font-size:16px;text-decoration:none;padding:11px 22px;border-radius:8px">
    Send me the free word bank
  </a>
</div>
```

## Notes

- Colours match the asset and the site: cream `#f6f4ef`, red `#b23a48`, serif type.
- No em dashes in the copy, in line with BAWT content style.
- The box promises the free word bank. The upsell to the $12 Prompt and Word-Bank
  Pack lives inside the delivered asset and the confirmation email, not here, so
  the opt-in stays a clean free offer.
- If you go with Option B, the Kit form URL comes from Kit after the form is
  created; the direct asset URL (https://tools.becomeawritertoday.com/writers-word-bank.html)
  should never be the button target, or readers skip the opt-in.
