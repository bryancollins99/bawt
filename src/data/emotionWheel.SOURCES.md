# Emotion / Feelings Wheel — data sources

`emotionWheel.json` is a faithful transcription of a published three-tier feelings
wheel. **No emotion words were invented or LLM-generated.** Every word below was
copied verbatim from the source taxonomy; only the ordering of the six core
emotions and per-core display colours were added for presentation.

## Source

- **Origin:** Dr. Gloria Willcox, *"The Feeling Wheel: A Tool for Expanding
  Awareness of Emotions and Increasing Spontaneity and Intimacy"*,
  *Transactional Analysis Journal*, 12(4), 1982.
- **Three-tier arrangement:** the widely-circulated core → secondary → tertiary
  layout popularised by the Junto Institute and by Geoffrey Roberts' *Emotion
  Word Wheel* — the same 6-core structure reproduced across the public domain.
- **Machine-readable transcription used:** `jrosebr1/pyemotionwheel`
  (`pyemotionwheel/data/emotion_wheel_tree.json`, MIT-licensed), which encodes the
  Willcox wheel as a core → secondary → tertiary tree.
  https://github.com/jrosebr1/pyemotionwheel

## Taxonomy shipped (verbatim)

6 core emotions · 34 secondary · 68 tertiary (108 feeling words total):

- **Joy** — Content, Happy, Cheerful, Proud, Optimistic, Enthusiastic, Elation, Enthralled
- **Love** — Affectionate, Longing, Desire, Tenderness, Peaceful
- **Surprise** — Stunned, Confused, Amazed, Overcome, Moved
- **Fear** — Scared, Terror, Insecure, Nervous, Horror
- **Anger** — Rage, Exasperated, Irritable, Envy, Disgust
- **Sadness** — Suffering, Despondent, Disappointed, Shameful, Neglected, Despair

## Note on the 8-core Plutchik variant

The build brief's illustrative core list (joy, sadness, anger, fear, surprise,
disgust, love/trust, anticipation) is Plutchik's 8 primary emotions, which is a
*different* model from the 3-tier feelings wheel and does not carry a published
secondary/tertiary word breakdown for `trust` and `anticipation`. Per BAWT's
data-honesty rule, we reproduce ONE coherent published wheel (Willcox, 6 cores)
faithfully rather than fabricate tertiary words to force an 8th and 7th core.
In this wheel `Disgust` appears as a secondary of `Anger` (its published home).
