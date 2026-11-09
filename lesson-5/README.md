# Lesson 5 practice

Open `lesson-5/` from the existing GitHub Pages site. Lesson 4 remains at the root. Lesson 5 uses `l5-practice-v1` and `l5-practice-v1-best`; Lesson 4 continues using its original `l4-practice-v1` keys. All stroke resources load locally; there are no runtime CDN dependencies.

The 18 writing entries and all three sentences match `Study guide for Lesson 5 Vocab quiz.pdf`. The guide specifies no quiz date, duration, counts, or points. The inherited mock format (5 recognition, 5 writing, 1 sentence; 10 minutes; 12 points) is a practice estimate. Sentence translations are self-assessed against a model.

The recognition pool has 37 entries crosschecked against these secondary sources, not verified by the publisher:

- [HanziPress, Integrated Chinese 4th edition Lesson 5](https://www.hanzipress.com/textbook/ic4/ic4-v1/ic4-v1-l05)
- [HanziStroke, Integrated Chinese 4th edition Lesson 5](https://www.hanzistroke.com/course/integrated-chinese-4th-edition-volume-1/lesson-5)
- [Dialogue 2 / narrative corroboration](https://quizlet.com/8317761/integrated-chinese-lesson-5-dialogue-2-flash-cards/)

高小音 is a personal name. 聊, 天, and 回 are separate component entries. Optional 儿, neutral-tone numbers 0/5, and listed citation/spoken tone alternatives are accepted. Pinyin is graded automatically; English definitions accept common equivalents and offer a manual correction. Sentence models use ordinary English translations, not prescribed official wording.

Additional stroke data in `hz-data.js` comes from `hanzi-writer-data@2.0.1` (Arphic Public License; see `STROKE-DATA-LICENSE.txt`). It supplements the unchanged shared Lesson 4 data with all missing writing/sentence characters.

## Validation

Serve the repository with `python3 -m http.server 8766`, install Playwright and its Chromium browser outside the project, then run:

```sh
PLAYWRIGHT_MODULE=/path/to/node_modules/playwright node tests/lesson-5.cjs
```

`TEST_BASE_URL` may point to an equivalent deployed base URL. The browser test uses isolated browser storage. It checks actual touch drawing against bundled stroke medians; other handwriting completion flows use Hanzi Writer's stroke progression to exercise all five copies and full sentence sequences without pretending to validate human handwriting quality.
