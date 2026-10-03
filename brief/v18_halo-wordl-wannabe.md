# Tebak Tebak Kata — Full Project Brief

*One file for the whole idea: the game, the rules, every setting, the screens, the style, the business, the risks, and the MVP.*

**How to read this brief**
- It is written in easy English.
- Text **inside the phone wireframes** is in Indonesian, because that is what the player will see in the game.
- Items marked **(assumption)** are my guesses. Please check them.
- Section 16 is the MVP (the first version to build). Section 17 is the decision log and open questions.

**Contents**
1. One-page summary
2. Vision and learning value
3. Competitors and the gap
4. Comparison tables (puzzle types, visual style, tile colors, mascot, name)
5. Core rules
6. The 4 × 4 × 2 setup matrix
7. All possible settings
8. Levels and learning content
9. Atlas 3D connection
10. UI/UX wireframes
11. Visual style
12. Mascot and Easter eggs
13. Content and packs
14. Business canvas
15. Risks, rating, and the way to 10/10
16. MVP (TK and SD, max 6 to 7 letters)
17. Decision log and open questions

---

## 1. One-Page Summary

| | |
|---|---|
| **Name** | **Tebak Tebak Kata** (tagline: *"Tebak istilah, naikin SDM-mu"*) |
| **What it is** | A word guessing game for learning. Wordle-style, but with clues, a closeness meter, and an explanation card after each word |
| **Special part** | It connects to your own **Human Atlas 3D**. The player sees a body part, guesses its name, then learns about it |
| **First topic** | Human Biology |
| **Levels** | TK, SD, SMP, SMA (all planned; MVP only does TK and SD) |
| **Players** | Single player first |
| **The meter** | **SDM revisi** (far), **SDM tinggi** (close), **SDM mengerikan** (correct). It comes from a livestream where viewers rate each guess |
| **Modes** | 4 modes, built on 2 engines (typing and dragging) |
| **Setup** | 3 presets + 1 custom preset, 2 message styles, many optional settings |
| **First release** | **Free MVP.** TK and SD only, words of 6 to 7 letters at most. Full version "coming soon" |
| **Status** | Design is clear. **No real player has tested it yet** |

## 2. Vision and Learning Value

### The learning loop

**See in 3D → guess the word from memory → read the meaning → go back to 3D.**

The atlas helps people **see**. The game helps people **remember**.

| Atlas 3D only | Atlas 3D + game |
|---|---|
| Passive: look and read names | Active: pull the answer from memory (*active recall*) |
| Easy to feel "I understand", then forget | A wrong guess that gets fixed tends to stick better |
| Opened once to look around | A reason to come back and repeat |

*Honest note:* active recall is known to work in general. But before telling schools "it works better", test it (for example, compare quiz scores after atlas-only vs atlas + game).

### Why not only a 4-option quiz (ABCD)?

- ABCD checks if you can **recognize** an answer. It is easy to make.
- But players can win by guessing or removing options, and almost every learning app already has it.
- Word guessing makes you **remember**, adds tension, and gives a reason to replay.
- ABCD is still useful as an optional **help button** when a player is stuck.

## 3. Competitors and the Gap

I did two quick searches. They are **not complete**, so something may be missing, especially Indonesian apps.

| What I found | What it does |
|---|---|
| **Hello Wordl** | Wordle with a letter-length slider and shareable game links |
| **MyWordle.me, Word.Rodeo** | Make a custom Wordle for one word and share the link |
| **Spello** | Spelling lists made for teachers |
| **Google Sheets Wordle add-on** | Custom word lists with optional hints |
| **Globle** | A hot/cold guessing game for countries (close to the SDM meter idea) |
| **Indonesian university projects** | School projects such as a "guess human organs" game (Construct 3), the skeleton game "KETUMA", and a 2D organ game (Unity) rated "very feasible" by experts and teachers and tested with 10 Grade 5 students |

**What I did not find in one product:**

| Missing piece | In this game |
|---|---|
| Words limited to a school level | Yes (TK to SMA) |
| A closeness meter, not only colors | SDM meter |
| Clues from a 3D model | Your Human Atlas |
| Score, penalties, and powerups | Yes |
| Teacher-made packs (CSV, form, export) | Yes (later version) |
| Indonesian language content | Yes |

**What this tells us:** the topic is wanted by schools (many projects exist). The idea of "guess the organ" is not new. The **combination** (Wordle-style game + SDM meter + 3D atlas + packs) is what looks new.

## 4. Comparison Tables

### 4.1 Puzzle types

| | **Crossword (TTS)** | **Scramble (susun huruf)** | **Guess + SDM meter** (picked) | **Quiz ABCD** |
|---|---|---|---|---|
| How it works | Fill a grid from clues | Rearrange mixed letters | Guess from a clue, get closeness feedback | Pick 1 of 4 |
| Skill used | Recall + crossing letters | Spelling | **Recall + reasoning from past guesses** | Recognition |
| Feedback | Only when crossings fit | Right or wrong | **Colors + SDM meter + history** | Right or wrong |
| Tension | Low | Low to medium | **High** | Low |
| Learning depth | Medium | Low to medium | **High** | Low to medium |
| Effort to make content | High (grid must fit) | Low | Medium | Low |
| Teacher packs | Hard | Easy | **Easy (CSV)** | Easy |
| Already common? | Very | Common | **Rare with this meter** | Very |
| Role here | Maybe later | **Dragging modes** | **Typing modes (core)** | Optional help button |

**Why the picked one wins:** guess history and a guess limit make players think step by step. The SDM meter gives richer feedback than a color box. Players must remember the answer, not just recognize it.

### 4.2 Visual style

| | **Full claymorphism** | **Thick tiles (like the livestream Wordle)** | **Cream pastel + fake 3D edge** (picked) |
|---|---|---|---|
| Look | Soft, round, toy-like | Bold white tiles on green | Warm cream, pastel, flat with a solid bottom edge |
| Readability | Can be weak (pastel + soft shadow) | Very good | Good if text stays dark |
| Matches the atlas | No (atlas is dark) | Partly | **Yes** (accent color follows the atlas) |
| Cost on old phones | Heavier (layered shadows) | Light | **Light** (no blur shadows) |
| Own identity | Medium | Low (looks like another game) | **High** |

Idea kept from claymorphism: rounder and brighter tiles for TK and SD.

### 4.3 Tile colors

| Question | Option A | Option B | Decision |
|---|---|---|---|
| How many statuses? | 3 (right, wrong place, wrong) | 2 (right, wrong) | **2 for TK/SD, 3 for SMP/SMA** |
| Wrong letter color | Dark gray | **Ice (pale blue-gray)** | Ice |
| Right letter color | **Green** | - | Green |
| Unused tile | White | **Pale cream/amber from the atlas accent** | Pale cream |
| "Right letter, wrong place" color | **Lemon yellow** | Metallic silver | Yellow. Silver looks too much like ice and needs shine effects |

### 4.4 Mascot and dance ideas

| Option | Effort | Risk | Fit for TK/SD | Verdict |
|---|---|---|---|---|
| **2D skeleton mascot (own drawing)** | Low | Low | Good | **MVP choice** |
| 3D skeleton, bones only, rigid joints ("puppet") | Medium to high | Medium (data license, time) | Good | **Phase 2, optional** |
| 3D skeleton + organs in torso | High | Medium | OK (more for SMA) | Maybe later |
| Dance with all 2,234 pieces (muscles) | Very high | High (needs skinning, may scare small kids) | Poor | **Skip** |
| Rig the atlas model itself | Very high | High (can break the atlas) | - | **Skip** |
| Swap the atlas model for a rigged one | Very high | High | - | **Skip** |
| Auto-rig test (Mixamo-style) | Medium | Medium (license, messy result) | - | Only as a quick experiment |
| Green-screen meme clip | Low | **High** (license, sound, may look scary) | Poor | **No memes** |
| "Spooky Scary Skeletons" 3D | High | **High** (song and animation have owners) | Poor | **No memes** |

### 4.5 Name

| Name | Good | Weak |
|---|---|---|
| SDM Tinggi | Funny, matches the meter | Only the livestream community gets it |
| Kata Kata Tinggi | Easy to say | Can sound like "high language", not a game |
| Tebak Kata | Very clear | Too common, hard to find |
| **Tebak Tebak Kata** (picked) | Friendly, sounds like the Indonesian "tebak-tebakan" riddle game, easy to say | Check that the name and domain are free |

"SDM" stays inside the game as the name of the meter (a small Easter egg for people who know it).

## 5. Core Rules

### 5.1 How one round works

1. The player picks a level and a mode.
2. A question or picture clue appears (and a 3D hint if there is one).
3. The player types or swipes letters to guess. Past guesses stay on screen.
4. The game shows tile colors and an SDM message.
5. The round ends on a win, a loss (Capped mode only), or "Give up". An **explanation card** always appears.

### 5.2 The SDM meter (make it explainable, not magic)

```
closeness = (letters in the right place × 2
             + letters present but in the wrong place)
            / (word length × 2)
```

| Closeness | Meter |
|---|---|
| 0% to 24% | **SDM revisi** (far) |
| 25% to 99% | **SDM tinggi** (close) |
| 100% | **SDM mengerikan** (correct) |

- **Dragging modes:** all letters are always present, so count **right places only**.
- **MVP (2 tile colors):** count right places only: `right / length`.
- **Repeated letters:** use the usual Wordle two-pass check. First mark the greens. Then match leftover letters for "right letter, wrong place".
- **Later (concept meter):** also say "right topic" if the guess is in the same group as the answer (for example MALTASE vs AMILASE, both enzymes). This needs a `kelompok` column.

### 5.3 Score

| Event | Points |
|---|---|
| Win | **10** |
| Wrong guess (minus modes) | -1 each |
| Lowest score when you win | 1 |
| Loss in Capped mode | 0 |
| Invalid guess | No penalty |

### 5.4 Powerup: reveal a letter

- Cost **1 to 5 points** (default -2 per letter).
- Locked when only 1 to 2 points are left.
- Maximum: about half of the letters.
- In Capped mode it costs points only, not a guess.
- In Casual mode it is free (there is no score).

### 5.5 Checking a guess

The game does not "understand" words. It checks your guess against a **list**, like a bouncer with a guest list. Colors come from a separate letter-by-letter comparison.

- **MVP:** accept any letters of the right length. Never punish an invalid guess.
- **Later:** accept words from a general Indonesian/English list **or** any loaded pack.
- **Dragging:** letters come from the answer, so no dictionary is needed.

### 5.6 Two message styles

Messages always talk about **the guess**, not the person ("this guess is still far", not "you are wrong").

| Situation | **Santai** (friendly) | **SDM** (meme) |
|---|---|---|
| Far | Coba lagi, yuk! | SDM revisi |
| Close | Yah, hampir lagi! | SDM tinggi |
| Correct | Mantap, benar! | SDM mengerikan! |
| 2 left, far | Sisa 2, tetap semangat! | SDM revisi... sisa 2, mulai degdegan nih |
| 2 left, close | Sisa 2, sedikit lagi! | SDM tinggi! Sisa 2, jangan sampai lepas |
| 1 left, far | Satu kesempatan lagi, kamu bisa! | Aduh boss, tinggal 1 kesempatan! Degdegan |
| 1 left, close | Satu lagi, hampir pasti! | AYO BOSS, tinggal 1 dan SDM tinggi! |
| Win on the last guess | Wah, tepat waktu! | SDM MENGERIKAN! Lolos dari lubang jarum |

- The "1 or 2 left" messages only appear in **Capped** mode (the other modes have no limit).
- **Defaults:** TK and SD use Santai. SMP and SMA can turn on SDM. Casual always uses Santai.
- The last guess row also gets a visual signal (a color change or slow pulse). Sound and vibration are optional.

## 6. The 4 × 4 × 2 Setup Matrix

You asked about **4 modes × 4 presets × 2 message styles**. On paper that is 32 combinations. Here is how it really works.

### 6.1 Three layers

| Layer | Choices | What it really is |
|---|---|---|
| **Mode** | 4 | The game engine (typing or dragging) + scoring rules |
| **Preset** | 3 + 1 custom | A saved bundle of settings (data, not a new feature) |
| **Message style** | 2 | A text table (Santai or SDM) |

Only **two engines** must be built. Presets and message styles are data.

### 6.2 The 4 modes

| # | Mode (MVP name) | Input | Guesses | Score | History |
|---|---|---|---|---|---|
| 1 | **SDM Capped** | Typing | Limited | Win 10, lose 0 | Yes |
| 2 | **SDM Minus** (Tebak Ketik) | Typing | Unlimited | 10, **-1 per wrong** | Yes |
| 3 | **Dragging + History** | Swipe letters | Unlimited | Minus can be ON or OFF | Yes |
| 4 | **Dragging Casual** (Tebak Sambung) | Swipe letters | Unlimited | No score | Optional |

### 6.3 Mode × preset (4 × 4)

★ = the preset's own mode. "tapi" = reachable by changing a setting; the name becomes "[Preset] tapi ...". "-" = not shown.

| Mode ↓ / Preset → | **Santai** | **Latihan** | **Ujian** | **Punyaku (custom)** |
|---|---|---|---|---|
| **1. SDM Capped** | tapi | tapi | ★ | Yes (teacher picks) |
| **2. SDM Minus** | tapi | ★ | tapi | Yes |
| **3. Dragging + History** | tapi | tapi | tapi | Yes |
| **4. Dragging Casual** | ★ | tapi | - (no score to protect) | Yes |

### 6.4 Mode × message style (the real count)

| Mode | Santai | SDM |
|---|---|---|
| 1. SDM Capped | Yes | Yes (shows the "1 left" drama) |
| 2. SDM Minus | Yes | Yes |
| 3. Dragging + History | Yes | Yes |
| 4. Dragging Casual | Yes | **No** (always Santai) |

**Result:** 32 on paper → **7 real mode + style combinations** → **4 starting presets**. You test 7, not 32.

### 6.5 Preset defaults

| | **Santai** | **Latihan** | **Ujian** |
|---|---|---|---|
| Mode | Dragging Casual | SDM Minus | SDM Capped |
| Guesses | Unlimited | Unlimited | Limited |
| Points | No score | 10, minus per wrong | 10, loss = 0 |
| Atlas | Open + names free | Names cost points | **Off** |
| Reveal letter | Free | Costs points | Costs points |
| Message style | Santai | Santai | SDM |

**Automatic naming** when a player changes something:

| Change | Name shown |
|---|---|
| Santai + names cost points | Santai tapi atlas bayar |
| Latihan + atlas off | Latihan tapi tanpa atlas |
| Ujian + Santai messages | Ujian tapi pesan ramah |
| More than 2 changes | Santai + 3 perubahan (tap for details) |

A **"Reset ke preset"** button is always there, so nobody fears breaking settings.

## 7. All Possible Settings

### 7.1 Setting groups

| Group | Settings |
|---|---|
| **Gameplay** | Mode, number of guesses, minus per wrong guess, guess history |
| **Atlas** | Atlas access (Off / View only / View + names free), tap name costs points |
| **Help** | Reveal-letter powerup, "show 4 options" button |
| **Messages and look** | Message style (SDM or Santai), last-guess effects (visual, sound, vibration), clue type (text, 3D, or both), theme, big letters, color-blind marks |
| **Content** | Level, topic/pack, name language (Indonesian or Latin/English) |
| **Points and penalties** | Every number (section 7.3) |

### 7.2 Which settings show in which mode

| Setting | Capped | Minus | Dragging + History | Casual |
|---|---|---|---|---|
| Number of guesses | Yes | No | No | No |
| Minus per wrong | No (uses the limit) | Locked ON | **Toggle** | No |
| Guess history | Locked ON | Locked ON | Locked ON | Optional |
| Atlas access | 3 choices | 3 choices | 3 choices | Open + names free |
| Tap name costs points | Yes | Yes | Yes | No |
| Reveal letter | Costs points | Costs points | Costs points | Free |
| Points panel | Yes | Yes | Yes | Hidden |

Settings that do not matter for a mode are **hidden**, so players never see a useless switch.

### 7.3 Point values (text boxes), default per preset

| Situation | Santai | Latihan | Ujian |
|---|---|---|---|
| Win reward | (no score) | 10 | 10 |
| Lowest score on a win | (no score) | 1 | 1 |
| Wrong guess | 0 | -1 | 0 (uses the limit) |
| Reveal 1 letter | 0 | -2 | -2 |
| Show 4 options | 0 | -3 | -3 |
| Tap a name in the atlas | 0 | -3 | (atlas off) |
| Open the atlas (each time) | 0 | 0 | (atlas off) |
| Loss (Capped) | n/a | n/a | 0 |
| Invalid guess | 0 | 0 | 0 |

**Rules for the text boxes**
- Numbers only. Penalties are limited to **0 to 5**. A teacher can change the win reward.
- A winner's score never goes below **1**.
- Powerups lock when only 1 to 2 points are left.
- "Invalid guess" is locked at 0, so typos are never punished.
- A **live example** ("10 - 3 - 2 - 3 = 2 points") updates when a number changes.

### 7.4 Atlas access rules

| Setting | Meaning |
|---|---|
| **Off** | The atlas cannot be opened during a round |
| **View only** | Rotate and zoom freely. A name shows **only when tapped**, and the tap can cost points |
| **View + names free** (default) | Names are visible, no points lost |

- Rotating and zooming is always free. Only **tapping to see the name** can cost points.
- The player knows why: the name is the answer.
- The atlas should **not** jump the camera to the answer. The player still has to look for it.
- Tapping the same part twice costs points **once per round** (assumption).

### 7.5 Teacher tools (later version)

- **Save a custom preset** (for example "Kuis Bab 3").
- **Lock settings** so students can only pick the saved preset.
- **Share link** that carries the preset (and pack).

## 8. Levels and Learning Content (Human Biology)

| Level | Content | Word length |
|---|---|---|
| **TK** | Very simple body parts: MATA, KAKI, TANGAN, HIDUNG | 3 to 6 |
| **SD** | Body parts and organs, up to a first look at enzymes | 4 to 7 |
| **SMP** | Each enzyme and its science name: AMILASE, LIPASE, PEPSIN | 5 to 8 |
| **SMA** | Everything below + Latin or English words: NUCLEUS, RIBOSOME, MITOCHONDRIA | 6 to 12 |

- **SD stops at the idea of enzymes** (ENZIM, LIUR). Named enzymes start at SMP. *(assumption: check the curriculum)*
- SMA can mix easier words from lower levels for review.
- Words with 6 to 7 letters fit the MVP shapes. Longer SMA words need a two-row letter tray later.
- All clues and explanations must be **checked by a teacher or a textbook**.

## 9. Atlas 3D Connection

Your **Human Atlas** is the special part of this game. Notes from looking at your screenshots:

- The atlas has **separate mesh pieces** (296 bones; 2,234 pieces for the full system) with **two layouts**: **assembled** and **lined up in rows**. Pieces fly between the two.
- It is **not rigged**. There are no joints, so nothing can dance without extra work.
- A selected part (for example "Left iliotibial tract") stays highlighted in both layouts. So part highlighting seems to be supported. *(assumption: check in the code)*

### How the game uses the atlas

| Use | Detail |
|---|---|
| **Clue** | The 3D model highlights the part to guess |
| **Swap panel** | A button "Atlas >>" opens the full atlas. "<< Kembali ke Game" comes back. **Game state is saved** (history, score, chosen letters) and no timer runs |
| **After the round** | The explanation card has "Lihat di atlas", which jumps to that part |
| **Reward effect (idea)** | On a win, the slider animates from rows to assembled, so the skeleton "builds itself". This reuses what already exists, with no rigging |
| **Progress idea (later)** | Each correct word adds a bone to a skeleton. After a session the skeleton is complete |

### Things to check in your code

1. Can the game **set the slider value and highlight a part from code**?
2. Is the animation smooth on old phones?
3. What does the atlas run on (three.js, Babylon, other)?
4. Where does the bone data come from, and **what is its license** (before changing it for animation)?

### Data cleanup

- The atlas has hundreds of parts (for example 639 arteries). Pick about **100 to 150 good words per level**, not everything.
- Clean names: remove "left/right" and spaces, so each is one word.
- Add Indonesian names for TK to SMP, and Latin/English names for SMA.

## 10. UI/UX Wireframes

All screens fit a phone (about 40 characters wide). **Screen text is Indonesian, because it is the game's language.**

### 10.1 Rules for good UX

| Rule | Why |
|---|---|
| One main action per screen | Small kids must not feel lost |
| Big buttons (about 48px or more), main action at the bottom | Easy for a thumb |
| Icon + text on key buttons | TK kids may not read well |
| Confirm before leaving a round | Avoid losing progress by accident |
| Save game state when opening the atlas | Players will not fear switching screens |
| Short text, friendly tone | Santai style in the MVP |
| No heavy punishment for TK | Tebak Sambung has no score |
| Advanced settings stay hidden | New players only pick a level and a mode |

### 10.2 Navigation map

```
Menu
 ├─ Tebak Sambung ─┐
 ├─ Tebak Ketik  ──┤
 │                 ├─ Kartu penjelasan ─ Lanjut (next word)
 │                 │                    └ Keluar ke Menu
 │                 └─ Atlas (swap) ── Kembali ke Game
 ├─ Atlas Anatomi 3D
 ├─ Tentang
 └─ Pengaturan
```

### 10.3 Page 1: Menu

```
┌────────── TEBAK TEBAK KATA ──────────┐
│      [ logo / maskot ]               │
│ Tebak istilah, naikin SDM-mu         │
├──────────────────────────────────────┤
│ Jenjang   [ ● TK ]  [ ○ SD ]         │
├──────────────────────────────────────┤
│ [ ▶ TEBAK SAMBUNG ]  (disarankan TK) │
│   Sambung huruf dengan jari          │
│ [ ▶ TEBAK KETIK ]    (disarankan SD) │
│   Ketik kata, baca petunjuk warna    │
├──────────────────────────────────────┤
│ [ Lihat Atlas Anatomi 3D ]           │
├──────────────────────────────────────┤
│ [ Tentang ]        [ Pengaturan ]    │
├──────────────────────────────────────┤
│ Segera: SMP, SMA, mode ujian         │
└──────────────────────────────────────┘
```

- **Level** decides the word set. The last choice is remembered.
- Both mode buttons are always visible. The **recommended** mode gets a small label (TK: Sambung, SD: Ketik). The player can still pick either one.
- "Segera: SMP, SMA, mode ujian" is plain text, **not a disabled button**, so nothing looks broken.
- The atlas button opens the full Human Atlas.

### 10.4 Page 2: About

```
┌────────────── TENTANG ───────────────┐
│ << Kembali                           │
├──────────────────────────────────────┤
│ Tebak Tebak Kata                     │
│ Versi 0.1 · gratis (MVP)             │
├──────────────────────────────────────┤
│ Cara main:                           │
│ 1. Lihat gambar atau baca soal       │
│ 2. Tebak katanya                     │
│ 3. Baca penjelasan, lalu belajar     │
├──────────────────────────────────────┤
│ Arti warna:                          │
│ [ ✓ ] Hijau = huruf benar & tepat    │
│ [ · ] Es    = huruf belum tepat      │
├──────────────────────────────────────┤
│ Materi: Biologi Manusia, TK & SD     │
│ Dibuat dengan Human Atlas 3D         │
├──────────────────────────────────────┤
│ Segera hadir: SMP, SMA, mode ujian,  │
│ pack buatan guru                     │
├──────────────────────────────────────┤
│ [ Kirim masukan ]   [ Privasi ]      │
└──────────────────────────────────────┘
```

- It holds **how to play and what the colors mean**, so there is no separate tutorial page.
- Do **not** write "checked by teachers" until it is really checked.
- "Kirim masukan" opens a tiny form (one text box, one send button).
- If the app collects any player data, say so on the Privacy page. This matters because the players are children.

### 10.5 Page 3: Settings (MVP)

```
┌───────────── PENGATURAN ─────────────┐
│ << Kembali                           │
├──────────────────────────────────────┤
│ Suara            [ ● ON ]            │
│ Getar            [ ● ON ]            │
│ Tema             [ ▼ Terang ]        │
│ Huruf besar      [ ○ OFF ]           │
│ Penanda warna    [ ● ON ]            │
│   (✓ dan titik di ubin)              │
│ Bacakan soal     [ ○ OFF ] (segera)  │
├──────────────────────────────────────┤
│ DATA                                 │
│ Riwayat main tersimpan di perangkat  │
│ [ Hapus data main ]                  │
├──────────────────────────────────────┤
│ [ Kirim masukan ]                    │
└──────────────────────────────────────┘
```

| Setting | What it does | Default |
|---|---|---|
| Suara | Sound effects | ON |
| Getar | Small vibration on right/wrong | ON |
| Tema | Light (cream) or Dark (brown, matches the atlas) | Light |
| Huruf besar | Bigger letters | OFF |
| Penanda warna | ✓ and dot marks on tiles for color-blind players | ON |
| Bacakan soal | Read the question aloud (for TK) | Later |
| Hapus data main | Delete play history on this device | Button |

**Not in the MVP:** presets, the points panel, SDM messages, guess limits. They come in the full version.

### 10.6 Page 4: Game, Tebak Ketik (typing)

```
┌──────────── TEBAK KETIK ─────────────┐
│ [ II ]  Skor 9  Salah 1  [ Atlas >> ]│
├──────────────────────────────────────┤
│ Organ yang memompa darah ke          │
│ seluruh tubuh. Apa namanya?          │
├──────────────────────────────────────┤
│ [ 3D organ / gambar (opsional) ]     │
├──────────────────────────────────────┤
│ Hampir lagi! 4 dari 7 benar          │
│ [L·][A✓][M·][B·][U✓][N✓][G✓]         │
│ [ ][ ][ ][ ][ ][ ][ ]                │
│ [ ][ ][ ][ ][ ][ ][ ]                │
├──────────────────────────────────────┤
│  Q W E R T Y U I O P                 │
│   A S D F G H J K L                  │
│    Z X C V B N M  [⌫]                │
│ [ Buka huruf -2 ]    [ Enter ]       │
└──────────────────────────────────────┘
```

- **Screen order:** question on top, picture or 3D hint in the middle, guesses and keyboard at the bottom.
- `✓` = green (right and in place). `·` = ice (not in place). In the real UI these are colors plus small marks.
- **Score:** win 10, each wrong guess -1, lowest score on a win is 1. Invalid guesses are free.
- **Reveal letter** costs 2 points.
- There is **no game over** here (unlimited guesses).
- The 3D area can be **folded** so the guess rows are not covered.
- The newest guess row is big. Old rows scroll away.

### 10.7 Page 5: Game, Tebak Sambung (swipe to connect)

```
┌─────────── TEBAK SAMBUNG ────────────┐
│ [ II ]  Ronde 3        [ Atlas >> ]  │
├──────────────────────────────────────┤
│ Alat untuk mencium bau.              │
│ [ ♪ Dengar soal ]                    │
├──────────────────────────────────────┤
│ [ gambar / 3D hidung disorot ]       │
├──────────────────────────────────────┤
│ Jawaban:  [H][I][ ][ ][ ][ ]         │
├──────────────────────────────────────┤
│        [ H ]──[ I ]                  │
│     ( N )          ( D )             │
│        ( G )  ( U )                  │
│     ↑ garis mengikuti jari           │
├──────────────────────────────────────┤
│ [ Acak ]  [ Hapus ]  [ Kirim → ]     │
└──────────────────────────────────────┘
```

**How it works**
1. The answer's letters sit on a shape in mixed order.
2. The player **swipes a finger** from letter to letter. A line joins the letters.
3. Chosen letters fill the answer boxes in order.
4. Lift the finger, then tap **Kirim** to check.

**Tap alternative:** the player can tap letters one by one instead of swiping. This is important for TK kids and for accessibility.

**The shape depends on the number of letters:**

```
┌───────── 3 HURUF: SEGITIGA ──────────┐
│          ( A )                       │
│      ( B )   ( C )                   │
└──────────────────────────────────────┘
```

```
┌────────── 4 HURUF: PERSEGI ──────────┐
│      ( J )     ( A )                 │
│      ( R )     ( I )                 │
└──────────────────────────────────────┘
```

```
┌───────── 5 HURUF: SEGI LIMA ─────────┐
│           ( L )                      │
│     ( H )       ( I )                │
│       ( A )   ( D )                  │
└──────────────────────────────────────┘
```

```
┌────────── 6 HURUF: HEXAGON ──────────┐
│        ( N )  ( I )                  │
│     ( H )          ( G )             │
│        ( U )  ( D )                  │
└──────────────────────────────────────┘
```

```
┌───── 7 HURUF: HEXAGON + TENGAH ──────┐
│        ( L )  ( A )                  │
│     ( B )  ( M )  ( U )              │
│        ( G )  ( N )                  │
└──────────────────────────────────────┘
```

- Triangle (3), square (4), pentagon (5), hexagon (6), hexagon with one letter in the middle (7).
- A 3-letter word has only 6 orders, so it is very easy. That is fine for TK. **Acak** shuffles the letters.
- No score in this mode. The screen shows the round number and the result.
- **TK uses a picture or 3D clue.** The button "Dengar soal" reads the question aloud (can come later).
- Wrong answer: the answer boxes shake gently and the letters return. The player can try again with no penalty.
- This is **not Spelling Bee.** The goal is to build **one word**, not find many words.

### 10.8 Shared parts

**Pause and exit**

```
┌──────────────── JEDA ────────────────┐
│ Ronde dijeda                         │
│                                      │
│ [ Lanjut → ]                         │
│ [ Ulangi ronde ]                     │
│ [ Keluar ke menu ]                   │
└──────────────────────────────────────┘
```

```
┌───────── KELUAR DARI RONDE? ─────────┐
│ Progres ronde ini akan hilang.       │
│                                      │
│ [ Tetap main ]   [ Keluar ]          │
└──────────────────────────────────────┘
```

**Explanation card** (after a win or give-up, in both modes; losing still teaches something)

```
┌────────── KARTU PENJELASAN ──────────┐
│ Benar! Jawabannya:                   │
│ J A N T U N G                        │
├──────────────────────────────────────┤
│ Jantung memompa darah ke seluruh     │
│ tubuh supaya tubuh mendapat          │
│ oksigen dan makanan.                 │
├──────────────────────────────────────┤
│ Skor +7   (3 tebakan salah)          │
├──────────────────────────────────────┤
│ [ Lihat di atlas >> ]  [ Lanjut → ]  │
└──────────────────────────────────────┘
```

**Atlas while playing**

```
┌───────── ATLAS SAAT BERMAIN ─────────┐
│ << Kembali ke Game                   │
├──────────────────────────────────────┤
│ [ model 3D, putar & zoom ]           │
│                                      │
│ Tap bagian untuk lihat nama          │
│   → nama muncul (kena poin bila ON)  │
├──────────────────────────────────────┤
│ Skor sekarang: 7                     │
└──────────────────────────────────────┘
```

- Opened with the "Atlas >>" button in the top bar.
- Round state is **kept** and no timer runs.
- In the **MVP** the atlas is free and open (no points). Access rules and name prices come in the full version.

### 10.9 Full-version screens (not in the MVP)

**Pick a preset**

```
┌────────── PILIH CARA MAIN ───────────┐
│ Jenjang  [ ▼ SMP ]                   │
│ Pack     [ ▼ Biologi Manusia ]       │
│                                      │
│ ( ● ) SANTAI                         │
│       Tanpa skor, atlas bebas        │
│ ( ○ ) LATIHAN                        │
│       Minus per salah, nama bayar    │
│ ( ○ ) UJIAN                          │
│       Tebakan terbatas, atlas mati   │
│ ( ○ ) PUNYAKU: Kuis Bab 3            │
│       (preset buatan guru)           │
│                                      │
│ ~ Pengaturan lanjutan ▼ ~            │
│                                      │
│ [ MULAI → ]                          │
└──────────────────────────────────────┘
```

**Advanced settings**

```
┌──────── PENGATURAN LANJUTAN ─────────┐
│ Preset: (Latihan tapi atlas mati)    │
│ [ Reset ke Latihan ]                 │
├──────────────────────────────────────┤
│ ▼ GAMEPLAY                           │
│   Mode        [ ▼ SDM Minus ]        │
│   Minus salah [ ● ON ] terkunci      │
│   Riwayat     [ ● ON ]               │
├──────────────────────────────────────┤
│ ▼ ATLAS                              │
│   Akses  [ ▼ Mati ]                  │
│   Tap nama kena poin [ ○ OFF ]       │
├──────────────────────────────────────┤
│ ▶ BANTUAN                            │
│ ▶ PESAN & TAMPILAN                   │
│ ▶ KONTEN                             │
│ ▶ POIN & HUKUMAN                     │
├──────────────────────────────────────┤
│ [ Simpan jadi preset ]  [ MULAI → ]  │
└──────────────────────────────────────┘
```

**Points and penalties (text boxes)**

```
┌─────────── POIN & HUKUMAN ───────────┐
│ Hadiah menang          [ 10 ]        │
│ Skor min. jika menang  [  1 ]        │
├──────────────────────────────────────┤
│ Salah tebak            [ -1 ]        │
│ Buka 1 huruf           [ -2 ]        │
│ Tampilkan 4 pilihan    [ -3 ]        │
│ Tap nama di atlas      [ -3 ]        │
│ Buka atlas (per kali)  [  0 ]        │
├──────────────────────────────────────┤
│ Kalah (mode Capped)    [  0 ]        │
│ Tebakan tak valid      [  0 ] (kunci)│
├──────────────────────────────────────┤
│ Contoh hitungan:                     │
│ Menang di tebakan ke-4 (3 salah),    │
│ 1 huruf dibuka, 1 nama di-tap:       │
│ 10 - 3 - 2 - 3 = 2 poin              │
├──────────────────────────────────────┤
│ [ Reset angka bawaan ]  [ Simpan → ] │
└──────────────────────────────────────┘
```

If a number is wrong, it cannot be saved:

```
┌───────── ANGKA TIDAK VALID ──────────┐
│ Tap nama di atlas      [ -9 ]        │
│                         ↑            │
│ Harga maksimal 5 poin.               │
│ [ Perbaiki ]                         │
└──────────────────────────────────────┘
```

**Name price confirmation** (only when the price is above 0)

```
┌── KONFIRMASI (harga lebih dari 0) ───┐
│ Lihat nama bagian ini?               │
│ Harga: -3 poin                       │
│                                      │
│ [ Batal ]  [ Lihat nama → ]          │
└──────────────────────────────────────┘
```

**Save and lock a preset (teacher)**

```
┌─────────── SIMPAN PRESET ────────────┐
│ Nama  [ Kuis Bab 3____________ ]     │
│                                      │
│ [✓] Kunci pengaturan                 │
│     (murid tidak bisa mengubah)      │
│ [ ] Sembunyikan pengaturan lanjutan  │
│                                      │
│ [ Simpan ]  [ Bagikan link → ]       │
└──────────────────────────────────────┘
```

### 10.10 Special states

| Situation | What the player sees |
|---|---|
| First time opening | A short "how to play" screen that can be skipped |
| Pack fails to load | A friendly message + "Coba lagi" button |
| No internet | The game still runs from the loaded pack; the atlas may fail and shows a message |
| All words finished | "Kamu sudah main semua kata! Segera ada kata baru" |
| Leaving during a round | Ask first |
| Invalid guess | A short message, no points lost |

## 11. Visual Style

**Direction:** warm cream, pastel but still high contrast. A **fake 3D look made with a solid bottom edge** (about 4px, no blur shadow). Tiles drop 2px when pressed. The accent color follows the atlas theme (the atlas accent changes, for example amber or maroon, so the game should read the accent as a **variable**, not hard-code it).

### Tile states

| State | Color | Note |
|---|---|---|
| Unused | Pale cream/amber | Normal tile, follows the accent |
| **Right** | Green | Dark text, small ✓ mark |
| **Wrong** | Ice (pale blue-gray) | Dark text, small dot mark |
| Right letter, wrong place (SMP/SMA, later) | Lemon yellow | Shift it toward green-yellow so it differs from amber |

### Starting palette (check the contrast before locking)

| Part | Color | Bottom edge |
|---|---|---|
| Background | `#F6EFE0` | - |
| Unused tile | `#FFF3D6` | `#E3CFA0` |
| Right | `#8FCB7E` | `#5E9E4E` |
| Wrong (ice) | `#CFE3EC` | `#9DBFCF` |
| Wrong place | `#F2E04B` | `#C4B21E` |
| Text | `#2B1D12` | - |
| Main button and accent | `#E8952B` | `#B8701A` |

### Principles

- **Text is always dark** on pastel. Contrast comes from light vs dark, not only color.
- A **second mark** (✓, dot) for color-blind players.
- **Dark theme & Dynamic Color Sync:** The game inherits CSS variables directly from the 3D Atlas view (`theme-engine.ts`):
  - `--accent-primary`: Dynamic header accents, button borders, and primary highlights.
  - `--bg-canvas`: Seamless background blending between game screens and 3D viewport canvas.
  - `--panel-bg-solid`: Card and modal background surfaces.
  - `--panel-border`: Crisp, tactile 3D borders for tiles, letter nodes, and on-screen keyboard keys.
  - `--panel-text`: High-contrast typography matching selected color schemes.
- **Tactile Fake 3D Tiles & On-Screen Keyboard:**
  - Both guess slots, connection nodes, and keyboard keys feature tactile styling: `border-b-4` with a darker bottom border, dropping 2px on touch/click (`active:translate-y-[2px] active:border-b-2`).
  - Tactile feeling reinforces engagement for young learners (TK and SD) on mobile touchscreens without laggy physics engines.
- **By level:** TK and SD are rounder and brighter (2 statuses). SMP and SMA are sharper (3 statuses).
- Do not copy another game's look exactly. Use the general style only.

## 12. Mascot and Easter Eggs

**Decisions**
- The mascot is a **2D skeleton drawn separately**. The atlas 3D model is **not touched**.
- **No memes.** No clips, songs, or animations from other people. Every asset (picture, motion, sound) is **original or clearly licensed**.

### Why not dance with the atlas model

- The atlas is a **viewer for many separate pieces**, not a character.
- Real rigging means a skeleton with joints, plus attaching every piece. Muscles also need skinning because they stretch over joints.
- Swapping the model is just as heavy, and it risks the atlas that already works.
- A dancing skinless body (muscles and organs) could scare small children. Bones only is friendlier, and much lighter (296 pieces, not 2,234).

### The 2D mascot (MVP)

- **3 poses:** idle, cheer, shrug. Optional: one short dance loop.
- **How to make it:** draw the skeleton as vector art (SVG), cut into parts (head, body, upper and lower arms, legs), then rotate the parts with simple CSS. Or use a sprite sheet or Lottie file.
- **Where it shows:** Menu logo, reaction on the explanation card, session-finished screen.

### Easter egg triggers

| Trigger | Reaction |
|---|---|
| Right answer | Cheer |
| Wrong guess | A friendly shrug (never mocking) |
| Win on the last guess | Big dance |
| Tap the Menu mascot 5 times | Dance |
| Type a secret word (for example JOGET) | Dance, and it does not count as a wrong guess |
| Win reward (later) | The atlas skeleton **builds itself** from rows to assembled |

### Rules

- Animations are short (under about 2 seconds) and **never delay** the next question.
- A **"reduce motion"** setting turns them off or simplifies them.
- The atlas bones stay still and accurate, so no one learns wrong bone movement.

### Stages

| Stage | What |
|---|---|
| **MVP** | 2D mascot, 3 poses, triggered by the game |
| **Phase 2 (optional)** | A bones-only 3D "puppet" with rigid joints, original dance and music, tested as an experiment first |
| **Never** | Meme clips, popular songs, downloaded animations without a clear license |

## 13. Content and Packs

### Pack manifest (so any subject can be a pack)

```json
{
  "id": "tubuh-manusia",
  "nama": "Tubuh Manusia",
  "bahasa": "id",
  "version": "1.0",
  "author": "pack author name",
  "words": [
    {
      "kata": "JANTUNG",
      "clue": "Organ yang memompa darah ke seluruh tubuh",
      "penjelasan": "Jantung memompa darah agar tubuh mendapat oksigen.",
      "kategori": "organ",
      "jenjang": "SD",
      "kelompok": "peredaran-darah"
    }
  ]
}
```

New topics (physics, chemistry, English) become new packs without changing the game engine.

### CSV format (import, form, export; later version)

| Column | Required | Notes |
|---|---|---|
| `kata` | **Yes** | The answer |
| `clue` | No | If empty, the game still works as plain guessing |
| `penjelasan` | No | Shown on the explanation card |
| `kategori` | No | Topic, for example enzim, tulang |
| `jenjang` | No | TK / SD / SMP / SMA |
| `kelompok` | No | For the concept SDM meter |

```csv
kata,clue,penjelasan,kategori,jenjang,kelompok
JANTUNG,Organ pemompa darah,Jantung memompa darah ke seluruh tubuh.,organ,SD,peredaran-darah
MATA,Alat untuk melihat,Mata menangkap cahaya agar kita bisa melihat.,tubuh,TK,indra
```

- Packs are saved **in the browser**. Show a reminder "export first to be safe", because clearing the cache deletes them.
- Import checks: make letters uppercase, reject spaces and odd characters, show which row is wrong.
- Check all content with a textbook or a teacher.

## 14. Business Canvas (Hypotheses)

The MVP is **free**. The full version is "coming soon". Everything about money below is a **hypothesis to test**, not a fact.

| Box | Notes |
|---|---|
| **Customer segments** | Students in TK and SD (later SMP, SMA); parents; teachers; study communities |
| **Value proposition** | Learn the human body with a 3D atlas, a fun guessing game, and clear explanations, in Indonesian. Teachers can build their own word packs |
| **Channels** | Website (no install), teacher and parent word of mouth, school groups, short videos, shareable links |
| **Customer relationships** | Free to start; in-app feedback button; a "coming soon" interest list; teacher communities |
| **Revenue streams (hypotheses)** | (a) schools or teachers pay for full packs and class presets; (b) parents pay for SMP and SMA levels; (c) the atlas may have its own plan. **Test with short interviews while the MVP runs** |
| **Key resources** | Your Human Atlas 3D; the game engines; teacher-checked content; the mascot art |
| **Key activities** | Write and check content; build and improve the game; playtest; talk to teachers |
| **Key partners** | Teachers or a school for content checks and testing; an illustrator (if the mascot is outsourced); the owner of the bone data (if its license requires it) |
| **Cost structure** | Your time; content writing and checking; hosting; mascot art or tools; later, support |

**Why free first:** zero entry barrier gives honest playtests, you learn before choosing prices, and the content cost is small.

**How to keep "free" useful**
1. Show the coming features inside the game, but do not make them look usable yet.
2. Add one simple feedback button ("Seru? Ada yang bingung?").
3. Do not promise dates. Say "segera" (soon).
4. Decide early if the MVP content stays free forever. People should not feel that something they used was locked later.
5. For children's data: collect as little as possible, and say clearly what is collected.

## 15. Risks, Rating, and the Way to 10/10

### 15.1 Risks

1. **Too many features before we know it is fun.** If guessing itself is not fun, nothing else helps.
2. **Content is the biggest job.** Each word needs a clue and a correct explanation.
3. **Hexagon fits only 6 to 7 letters.** Longer words need another layout.
4. **Atlas data** needs cleaning (names, language, level).
5. **Too many switches** can confuse new players. Presets and hidden advanced settings fix this.
6. **Competitors are not fully checked.**
7. **Licenses:** bone data, mascot art, sounds.
8. **Children's privacy** if any data is collected.

### 15.2 Rating (my judgment from our talks, not test results): 8.5 / 10

| Area | Score | Why |
|---|---|---|
| Core concept | 9 | Guess + meter + explanation card is clear and has character |
| Learning value | 8 | Active recall + 3D atlas, but not tested |
| What makes it different | 9 | Your atlas + the SDM meter are hard to copy. Competitor check is not deep |
| Flexibility | 8 | Modes, presets, packs (planned for the full version) |
| Design clarity | 9 | Full brief, wireframes, clear scope |
| Easy to build | 7 | MVP is small. Risks: atlas control, content, mascot art |
| Proven fun | ? | **No real player yet** |

### 15.3 How to reach 10/10

10/10 on paper is impossible. Three areas (fun, effective, truly new) are proven only by real players. Here is how to push each one as high as possible.

| Area | Step toward 10 |
|---|---|
| Core concept | Playtest with 5 to 10 people. A good sign: they ask for a second round without being told |
| Learning value | A teacher checks every clue and explanation. Then a small test (atlas only vs atlas + game, quiz one week later) |
| Different | A deeper competitor search (Play Store, Google Classroom, school apps). Make claims only about what is truly missing |
| Flexibility | New players start playing within about 10 seconds without touching settings |
| Design clarity | One person reads this brief and explains it back without asking questions |
| Easy to build | Confirm the atlas can be controlled from code. Decide who draws the mascot |
| Proven fun | Prototype, playtest, fix the two most confusing spots, repeat |

**Fastest path:** (1) write 15 TK and SD words and have a teacher check them; (2) build a prototype of Tebak Ketik only, with no atlas and no mascot; (3) give it to 5 to 10 kids and parents and watch without helping; (4) fix the two most confusing spots; (5) then add the atlas, Tebak Sambung, and the mascot.

## 16. MVP: TK and SD, Max 6 to 7 Letters

**The only goal:** prove that this guessing game (with a meter and an explanation card) is **fun and gets replayed** by TK and SD kids.

### 16.1 Scope

| Area | MVP |
|---|---|
| Price | **Free.** Full version "coming soon" |
| Levels | **TK and SD only** |
| Word length | **At most 6 to 7 letters** (TK 3 to 6, SD 4 to 7) |
| Number of words | About **30 to 40** |
| Modes | **2:** Tebak Sambung (swipe, no score) and Tebak Ketik (typing, scored) |
| Choosing a mode | The player can pick either; the recommended one is shown by level (TK: Sambung, SD: Ketik) |
| Presets and advanced settings | **None** |
| Tile colors | **2:** ice and green |
| Message style | **Santai only** |
| Meter | Right places only: `right / length` |
| Score (Ketik) | Win 10, -1 per wrong guess, minimum 1 on a win |
| Score (Sambung) | None |
| Reveal letter | -2 in Ketik, free in Sambung |
| Shapes (Sambung) | Triangle 3, square 4, pentagon 5, hexagon 6, hexagon + center 7 |
| TK clue | Picture or 3D (the question is optional text; read-aloud can come later) |
| Atlas | Swap panel with a free, open atlas (no points) *(assumption: the atlas can be reached from the same app)* |
| Checking guesses | Accept any letters of the right length |
| Explanation card | **Yes, required** |
| Mascot | 2D, 3 poses |
| Packs | A pack file in the manifest format from day one (no import screen yet) |
| Other | Feedback button, "coming soon" note, settings page (sound, vibration, theme, big letters, color marks) |

### 16.2 MVP flow

```
┌────────────── ALUR MVP ──────────────┐
│ Pilih jenjang (TK / SD)              │
│    ↓                                 │
│ Pilih mode: Sambung atau Ketik       │
│    ↓                                 │
│ Main satu soal                       │
│    ↓                                 │
│ Kartu penjelasan                     │
│    ↓                                 │
│ [ Lanjut ] → soal berikutnya         │
└──────────────────────────────────────┘
```

### 16.3 Out of the MVP (later)

SMP and SMA, Capped and Dragging + History modes, presets and advanced settings, the points panel, SDM message style, yellow "wrong place" tiles, CSV (import, form, export), share links, dark theme details, atlas point rules, and the "skeleton builds itself" win effect.

### 16.4 Example word list (a teacher must check it)

| Level | Words |
|---|---|
| **TK (3 to 6)** | MATA, KAKI, JARI, GIGI, PIPI, KUKU, LEHER, LIDAH, MULUT, HIDUNG, TANGAN, KEPALA, RAMBUT |
| **SD (4 to 7)** | OTAK, PARU, HATI, USUS, DARAH, OTOT, SENDI, KULIT, GINJAL, TULANG, JANTUNG, LAMBUNG, TELINGA, ENZIM, LIUR |

Named enzymes (AMILASE, LIPASE) are **not** in SD. ENZIM and LIUR set the "SD up to enzymes" limit.

### 16.5 Test plan

1. Give it to **5 to 10 people** (TK/SD kids, parents, teachers).
2. Watch **without helping**. Do they start in about 10 seconds? Do they finish round one? Do they **ask for round two**?
3. Note where they get confused or stop.
4. Suggested first goals (adjust as needed): most finish round one, and half or more ask for another round.
5. If it is fun, build in this order: full atlas control, SMP, Capped mode, presets, CSV, SMA.

## 17. Decision Log and Open Questions

### 17.1 Decision log (in order)

| # | Topic | Decision |
|---|---|---|
| 1 | The meter | "SDM" = how close a guess is (revisi / tinggi / mengerikan), taken from a livestream |
| 2 | Big idea | A Wordle-style learning game, Human Biology first |
| 3 | Words | Limited by school level (TK to SMA), not random. Long science words were too discouraging |
| 4 | Players | Single player first |
| 5 | Puzzle type | Compared 4 types. **Guess + SDM meter is the core.** Scramble is a support mode. ABCD is only a help button |
| 6 | Why the core wins | Guess history + input limit make players think, and feedback stacks up |
| 7 | Guess rules | Adjustable guess count. An unlimited mode loses points per wrong guess. Win = 10 |
| 8 | Two modes | Capped guesses and Unlimited with minus. Scope is modular |
| 9 | Custom packs | Import CSV, a form, and export. Clue is optional. Reveal-letter powerup costs points |
| 10 | Name | Looked at SDM Tinggi, Kata Kata Tinggi, Tebak Kata. **Final: Tebak Tebak Kata** |
| 11 | Hello Wordl | Liked: shareable links and a length slider |
| 12 | Guess checking | Explained the word list idea. MVP accepts any letters of the right length |
| 13 | Four modes | Hexagon scramble idea led to the final 4: SDM Capped, SDM Minus, Dragging + History (minus toggle), Dragging Casual |
| 14 | Review feedback | Accepted: exact meter formula, repeated-letter rule, pack manifest, build in stages, tone by level. Fixed the overlapping meter table |
| 15 | Two message styles | SDM (meme) and Santai (friendly). Special "heart-pounding" messages for the last 1 to 2 guesses |
| 16 | Atlas link | Use the Human Atlas for visual clues. Learning loop: 3D → word → meaning |
| 17 | Atlas rules | Default free. A separate hidden-label option was **removed** (it confused). Final: Off / View only / View + names free, plus "tap name costs points" |
| 18 | Many switches | Presets (Santai, Latihan, Ujian) + auto names "[Preset] tapi ...", a points text-box panel, teacher save and lock |
| 19 | 4 × 4 × 2 | Explained as three layers: 32 on paper, 7 real mode + style combos |
| 20 | Visual style | Claymorphism considered. **Chosen:** cream pastel, fake 3D bottom edge, no blur shadows, accent from the atlas |
| 21 | Tile colors | Ice = wrong, green = right, unused = pale accent. Yellow (not silver) for wrong place. 2 statuses for TK/SD, 3 for SMP/SMA |
| 22 | Layout | Question on top, optional 3D below, rows + keyboard under that. Dragging uses shapes |
| 23 | MVP scope | TK and SD only. SD up to enzymes. Words max 6 to 7 letters. Shapes by letter count. TK uses picture clues |
| 24 | Money | MVP is free. Full version "coming soon" |
| 25 | Pages | Menu, About, Settings, Tebak Ketik, Tebak Sambung. "Connect drag" = swipe to connect letters |
| 26 | Mascot | Atlas has separate meshes and is not rigged, so rigging or swapping it was rejected. Whole-body dance rejected (skinning, scary). **2D mascot first. No memes.** A 3D bones-only puppet is optional later |
| 27 | Rating | 8/10, then 8.5/10 after the scope and design work. Real players are still needed |
| 28 | 3D theme sync | Bind game UI tokens directly to dynamic Atlas CSS variables (`--accent-primary`, `--bg-canvas`, `--panel-bg-solid`, `--panel-border`, `--panel-text`) for instant reactive theme harmony |
| 29 | Tactile fake 3D tiles | Apply `border-b-4` and 2px drop on press (`active:translate-y-[2px] active:border-b-2`) to all word slots, connection nodes, and on-screen keyboard keys for tactile engagement |
| 30 | Mobile sheet isolation | Enforce strict portal suppression and `data-view-mode="game"` rules to prevent 3D inspection sheets (`.detail-sheet`) and mobile drawers (`.mobile-bottom-sheet`) from leaking over the game screen |
| 31 | English codebase standard | Standardize all module filenames, helper scripts, TypeScript interfaces, and internal variables on standard English (UI wireframe copy remains in Indonesian for students) |
| 32 | Livestream chiclet fake 3D style | Replaced bulky cartoon pill radius with sleek rectangular chiclet keys (`border-radius: 5px`, 3.5px solid bottom bevel, chamfer top highlight, vibrant green/yellow/muted surfaces) matching the livestream Wordle reference |
| 33 | Complete theme engine binding | Eliminated all hardcoded brown tones; 100% reactive color-mix on active theme variables (`--panel-bg-solid`, `--panel-border`, `--accent-primary`) |
| 34 | Zero vertical scroll guarantee | Compact 3-row keyboard layout with integrated Backspace/Enter, tightened padding and mascot height to ensure 100% viewport fit on both mobile (375x667) and desktop without scrollbars |


### 17.2 Open questions

| Question | Note |
|---|---|
| Is the atlas in the same app as the game? | Needed for the swap panel. If not, delay it to phase 2 |
| Can the game control the atlas slider and highlight parts from code? | Needs a code check |
| Final TK and SD word lists | A teacher or the curriculum must check them |
| TK: picture only, or picture + text? | Picture clue is chosen. Text is optional |
| Swipe or tap as the main way for TK? | Swipe + a tap alternative is planned |
| Words per session | Suggested: 5 words, then a summary screen |
| Sound and read-aloud for TK | In the MVP or later? |
| Guess limit defaults (Capped mode) | Not decided. Decide after the playtest |
| Who draws the mascot? | You, an illustrator, or a licensed asset |
| License of the bone data | Check before changing it for any animation |
| Is the name "Tebak Tebak Kata" free to use? | Check the name and domain |
| Privacy page content | Needed if any child data is collected |
| Does "SD up to enzymes" match the curriculum? | Assumption. Check | 