# Lesson 6 practice

Open `lesson-6/` from the existing GitHub Pages site. Lessons 4 (root) and 5 (`lesson-5/`) are unchanged except for a Lesson 6 link in their navigation. Lesson 6 stores progress under `l6-practice-v1` and `l6-practice-v1-best`; it never reads or writes the Lesson 4/5 keys. All stroke resources load locally; there are no runtime CDN dependencies.

## Sources and scope

Content comes only from `L5-L6 vocab and sentence patterns (Nov 9-16).md` and the slides `W11 Mon`, `W11 T`, `W11 Wed`, `W11 TH` and `W12 Mon (2026)`. Scope is the Lesson 6 Dialogue 1 vocabulary taught through 11/16 plus the Lesson 5 review (了, 没, 才). Dialogue 2 words (见面 etc.) are not taught yet and are left out.

- **Word pool (43 entries):** 打电话, 给, 喂, 您, 就, 哪, 位, 时间, 上, 下, 上课, 下课, 上个星期, 下个星期, 上上个星期, 下下个星期, 以后, 空儿, 有空, 方便, 节, 门, 课, 年级, 考试, 小考, 开会, 问, 问题, 没问题, 办公室, 要是, 等, 到, 行, 别, 别客气, 去年, 今年, 明年, 上午, 中午, 下午.
- **Writing list:** none of the slides gives a writing list for the Lesson 6 quiz (W11 Wed only says "Review flashcards (1-23)"), so every word is a writing word.
- **Mock format:** the W11 Mon slide shows the Lesson 5 vocab quiz as 10 minutes; no other format details are on the slides. The mock (5 recognition, 5 writing, 1 sentence; 10 minutes; 12 points) is a practice estimate.
- **Sentences, word order, translation:** taken from the slides' own examples and answers (W12 Mon p.9 translation set, the 等/到…去/行 handout, W11 Tue/Thu exercises, the L5 review, Dialogue 1) wherever one exists.

## Sections

- **A · Sentence structure:** 12 units, 33 steps. Each step is one idea, a colour-coded example (Subject · Time · Helper · Place/给/在/到 · Verb · Object, plus How long and End word), and a quick check.
- **B · Word building:** character-by-character breakdowns, a build-the-word tile exercise, and word families.
- **C · Word order:** 75 scrambled sentences across 12 patterns. Subject/time order is accepted both ways, as are listed alternative orders. A wrong answer names the slot that is out of place.
- **D · Slot builder:** pick subject, time, helper, place/给/到 phrase and verb + object; the page assembles the sentence in Chinese order, with pinyin and the English order for comparison.
- **E · Translate:** 41 English → Chinese drills with the model answer, pinyin and a pattern hint.
- **1–5:** the same Learn strokes / Recognition / Write it / Sentences / Mock quiz / Word list engine as Lesson 5 (three right in a row = learned; misses come back more often).

Stroke data in `hz-data.js` comes from `hanzi-writer-data@2.0.1` (Arphic Public License; see `STROKE-DATA-LICENSE.txt`). It supplements the unchanged shared `lib/hz-data.js` with every missing character used by the writing words and sentences.

## Validation

Serve the repository with `python3 -m http.server 8766`, then run with an existing Playwright install:

```sh
PLAYWRIGHT_MODULE=/path/to/node_modules/playwright node tests/lesson-6.cjs
```

The test runs at 390px (and checks 320px), walks all 33 structure steps, checks every word-order item's accepted orders and the slot hints, and drives the slot builder, word building, translation, stroke learning (including real touch drawing), sentences and mock quiz. It also confirms that Lesson 4/5 progress is untouched and that no console errors occur.
