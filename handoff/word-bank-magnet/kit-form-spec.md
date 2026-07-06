# Kit form spec: Writer's Word Bank

This is the exact spec for the Kit form Bryan creates in the Kit UI. Kit forms
cannot be created through the API or MCP (there is no `create_form` tool), so the
form itself is built by hand in Kit. Everything below is the settings to enter.

## Hosted asset (the thing the form delivers)

- File in this repo: `public/writers-word-bank.html`
- Public download URL once deployed: **https://tools.becomeawritertoday.com/writers-word-bank.html**
- It is a free, static, printable HTML page (no login, no paywall). The URL is
  only handed out inside the Kit confirmation email below, so it stays tied to
  the opt-in even though the file itself is public.

## Form settings

| Setting | Value |
|---|---|
| Form name | `Writer's Word Bank` |
| Format | Inline (so it can be embedded in the word-list posts) |
| Opt-in | Double opt-in ON (matches the rest of the BAWT list) |
| Success action | Show a message: "Check your inbox and click the link to confirm. Your word bank is on the way." |
| Tag to apply | `word-bank` |
| Sequence / automation | Add confirmed subscribers to sequence id **2816569** ("BAWT Welcome + Craft") |

### Wiring the tag and sequence

In Kit, add an automation (Automations > Visual automations, or the form's own
"Settings > Incentive" plus a rule):

1. Trigger: subscriber confirms via the `Writer's Word Bank` form.
2. Action: add tag `word-bank`.
3. Action: subscribe to sequence `2816569` (BAWT Welcome + Craft).

The `word-bank` tag is what lets Bryan later segment everyone who came in through
this magnet (for a targeted paid-pack push, for example).

## Incentive / confirmation email copy

Set this as the form's incentive email (the email Kit sends after someone
confirms, the one that actually carries the download link). Plain BAWT voice, no
em dashes.

**Subject:** Your Writer's Word Bank is here

**Body:**

Hi there,

Thanks for confirming. Here is your free Writer's Word Bank.

Get it here: https://tools.becomeawritertoday.com/writers-word-bank.html

It is more than 900 vivid words grouped the way writers actually reach for them:
descriptive words, sensory words, emotion words, action verbs, words for love and
romance, words of light and nature, connectors and transitions, and a set of
uncommon words for poets. Bookmark it, or print it and pin it above your desk.

Here is the one thing that makes a word bank work: do not shop for words while you
are drafting. Draft first, get the scene down badly, then skim a list when a
sentence feels flat and swap in something sharper. The word bank is for the
rewrite, not the blank page.

Over the next week or two I will send you a few short notes on the craft of
writing. If they are not for you, there is an unsubscribe link at the bottom of
every one and no hard feelings.

Keep writing,
Bryan

P.S. If you want the expanded version, there is a Prompt and Word-Bank Pack with
the full word list plus 275 writing prompts by genre. It is $12 here:
https://buy.stripe.com/3cIaEY4zZ7mj34281GbZe0A

## Notes

- No live sends are set up as part of this handoff. Bryan builds the form and
  pastes the copy in Kit himself.
- If the tools subdomain path ever changes, update the download URL in the
  incentive email above and in the WordPress embed box (`wordpress-embed.md`).
