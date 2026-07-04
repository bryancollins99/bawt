/* exit-intent.js - sitewide genre-picker opt-in modal.
 *
 * Shows once per visitor (localStorage flag) when the pointer leaves the top of
 * the viewport. Dismissible. Respects prefers-reduced-motion. Never fires inside
 * an embedded tool iframe. Posts to /.netlify/functions/subscribe with
 * source_surface="exit-intent". No em dashes in any copy. Self-contained: no
 * dependencies, injects its own styles and markup.
 */
(function () {
  'use strict';

  // Do not run inside an embedded tool (iframe or ?embed= URLs).
  try {
    if (window.top !== window.self) return;
  } catch (e) {
    return; // cross-origin framing -> definitely embedded
  }
  if (/[?&]embed=/.test(location.search)) return;

  var FLAG = 'bawt_exit_intent_shown';
  try {
    if (localStorage.getItem(FLAG)) return;
  } catch (e) {
    // localStorage blocked (private mode): fall through, show at most this load.
  }

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var shown = false;

  function markShown() {
    try {
      localStorage.setItem(FLAG, String(Date.now()));
    } catch (e) {
      /* ignore */
    }
  }

  function buildModal() {
    var overlay = document.createElement('div');
    overlay.id = 'bawt-ei-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'bawt-ei-title');

    var style = document.createElement('style');
    style.textContent =
      '#bawt-ei-overlay{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(28,36,48,.55)}' +
      '#bawt-ei-card{max-width:440px;width:100%;background:#fdfcfa;border:1px solid #e5e3dc;border-radius:14px;padding:28px 24px;font-family:Georgia,"Times New Roman",serif;color:#1c2430;box-shadow:0 18px 50px rgba(0,0,0,.25);position:relative}' +
      (reduce ? '' : '#bawt-ei-card{animation:bawtEiIn .18s ease-out}@keyframes bawtEiIn{from{transform:translateY(10px);opacity:0}to{transform:translateY(0);opacity:1}}') +
      '#bawt-ei-close{position:absolute;top:10px;right:12px;border:none;background:none;font-size:26px;line-height:1;color:#8a93a0;cursor:pointer;padding:4px}' +
      '#bawt-ei-close:hover{color:#1c2430}' +
      '#bawt-ei-title{font-size:23px;color:#b23a48;margin:0 6px 8px 0;line-height:1.2}' +
      '#bawt-ei-overlay p.bawt-ei-lede{font-size:15px;line-height:1.55;color:#5a6472;margin:0 0 16px}' +
      '#bawt-ei-overlay label{display:block;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;color:#5a6472;margin-bottom:4px}' +
      '#bawt-ei-overlay select,#bawt-ei-overlay input{width:100%;font-family:inherit;font-size:15px;padding:9px 11px;border:1px solid #d9cdbf;border-radius:7px;background:#fff;color:#1c2430;margin-bottom:12px}' +
      '#bawt-ei-submit{width:100%;font-size:16px;font-weight:700;padding:12px;border:none;border-radius:9px;background:#b23a48;color:#fff;cursor:pointer;font-family:inherit}' +
      '#bawt-ei-submit:hover{background:#8f2c39}' +
      '#bawt-ei-msg{font-size:14px;margin:10px 0 0;min-height:1.2em;color:#5a6472}' +
      '#bawt-ei-fine{font-size:12px;color:#8a93a0;margin:12px 0 0;line-height:1.5}';

    overlay.innerHTML =
      '<div id="bawt-ei-card">' +
      '<button id="bawt-ei-close" type="button" aria-label="Close">&times;</button>' +
      '<h2 id="bawt-ei-title">Before you go, get the deadlines</h2>' +
      '<p class="bawt-ei-lede">Pick what you write and we will email you the writing contests and grants worth entering, plus the weekly Deadline Digest.</p>' +
      '<form id="bawt-ei-form">' +
      '<label for="bawt-ei-genre">I write</label>' +
      '<select id="bawt-ei-genre">' +
      '<option value="fiction">Fiction</option>' +
      '<option value="poetry">Poetry</option>' +
      '<option value="nonfiction">Nonfiction</option>' +
      '<option value="all" selected>Everything</option>' +
      '</select>' +
      '<label for="bawt-ei-email">Email</label>' +
      '<input type="email" id="bawt-ei-email" required placeholder="you@example.com">' +
      '<button id="bawt-ei-submit" type="submit">Email me the deadlines</button>' +
      '</form>' +
      '<p id="bawt-ei-msg" role="status"></p>' +
      '<p id="bawt-ei-fine">Double opt-in, so you confirm by email first. No spam, unsubscribe any time.</p>' +
      '</div>';

    overlay.appendChild(style);
    return overlay;
  }

  function close(overlay) {
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    document.removeEventListener('keydown', onKey);
  }

  var current = null;
  function onKey(e) {
    if (e.key === 'Escape') close(current);
  }

  function show() {
    if (shown) return;
    shown = true;
    markShown();

    var overlay = buildModal();
    current = overlay;
    document.body.appendChild(overlay);

    var closeBtn = overlay.querySelector('#bawt-ei-close');
    var form = overlay.querySelector('#bawt-ei-form');
    var email = overlay.querySelector('#bawt-ei-email');
    var genre = overlay.querySelector('#bawt-ei-genre');
    var submit = overlay.querySelector('#bawt-ei-submit');
    var msg = overlay.querySelector('#bawt-ei-msg');

    closeBtn.addEventListener('click', function () {
      close(overlay);
    });
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) close(overlay);
    });
    document.addEventListener('keydown', onKey);
    if (email) email.focus();

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var value = email.value.trim();
      if (!value) return;
      submit.disabled = true;
      msg.style.color = '#5a6472';
      msg.textContent = 'Sending your confirmation email...';
      fetch('/.netlify/functions/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: value, genre: genre.value, source_surface: 'exit-intent' }),
      })
        .then(function (r) {
          return r
            .json()
            .catch(function () {
              return {};
            })
            .then(function (j) {
              return { ok: r.ok, j: j };
            });
        })
        .then(function (res) {
          if (res.ok) {
            form.style.display = 'none';
            msg.style.color = '#2e7d32';
            msg.textContent = 'Almost there. Check your inbox and click the link to confirm.';
          } else {
            submit.disabled = false;
            msg.style.color = '#b3261e';
            msg.textContent = (res.j && res.j.error) || 'Something went wrong. Please try again.';
          }
        })
        .catch(function () {
          submit.disabled = false;
          msg.style.color = '#b3261e';
          msg.textContent = 'Network error. Please try again.';
        });
    });
  }

  // Trigger: pointer leaves through the top edge of the viewport.
  function onMouseOut(e) {
    if (shown) return;
    if (e.clientY > 0) return; // only the top edge
    if (e.relatedTarget || e.toElement) return; // still inside the document
    show();
  }

  function arm() {
    document.addEventListener('mouseout', onMouseOut);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', arm);
  } else {
    arm();
  }
})();
