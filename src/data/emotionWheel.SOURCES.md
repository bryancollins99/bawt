# Emotion / Feelings Wheel — data sources

`emotionWheel.json` is a faithful transcription of a published three-tier
hierarchical emotion classification. **No emotion words were invented or
LLM-generated.** Every word was copied verbatim from the source taxonomy; only
the ordering of the six core emotions and per-core display colours were added
for presentation.

## Source

- **Taxonomy:** W. Gerrod Parrott's tree-structured (three-level) classification
  of emotions — primary → secondary → tertiary — from *Emotions in Social
  Psychology: Essential Readings* (Psychology Press, 2001). This is the widely
  reproduced list whose six **primary** emotions are Love, Joy, Surprise, Anger,
  Sadness and Fear (which is exactly what this dataset ships). It is a distinct
  model from Gloria Willcox's *Feeling Wheel* (1982), whose six cores are
  mad/sad/scared/joyful/powerful/peaceful — we are NOT reproducing Willcox.
- **Machine-readable transcription used:** `jrosebr1/pyemotionwheel`
  (`pyemotionwheel/data/emotion_wheel_tree.json`, MIT-licensed), which encodes
  this six-core primary→secondary→tertiary tree.
  https://github.com/jrosebr1/pyemotionwheel — verified word-for-word against the
  shipped JSON (0 words added, 0 omitted).

## Taxonomy shipped (verbatim)

6 core emotions · 34 secondary · 68 tertiary (108 emotion words total):

- **Joy** — Content, Happy, Cheerful, Proud, Optimistic, Enthusiastic, Elation, Enthralled
- **Love** — Affectionate, Longing, Desire, Tenderness, Peaceful
- **Surprise** — Stunned, Confused, Amazed, Overcome, Moved
- **Fear** — Scared, Terror, Insecure, Nervous, Horror
- **Anger** — Rage, Exasperated, Irritable, Envy, Disgust
- **Sadness** — Suffering, Despondent, Disappointed, Shameful, Neglected, Despair

## Note on the 8-core Plutchik variant

The build brief's illustrative core list (joy, sadness, anger, fear, surprise,
disgust, love/trust, anticipation) is Plutchik's 8 primary emotions — a
*different* model again, one that carries no published secondary/tertiary word
breakdown for `trust` and `anticipation`. Per BAWT's data-honesty rule we
reproduce ONE coherent published taxonomy (Parrott's six cores) faithfully
rather than fabricate tertiary words to force a 7th/8th core. In this taxonomy
`Disgust` appears as a secondary of `Anger` (its published home).
