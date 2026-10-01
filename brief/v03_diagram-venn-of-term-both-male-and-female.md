# Project Brief: Anatomical Venn Diagram & Shared/Dimorphic Ontology

**File:** `brief/v03_diagram-venn-of-term-both-male-and-female.md`  
**Target Repo:** https://github.com/pakcli/human-atlas  
**Objective:** Define the complete anatomical taxonomy, Venn diagram distribution, biological homology mappings, and UI/UX specification for exploring shared versus sex-dimorphic structures across male and female human anatomy.

---

## 1. High-Level Venn Taxonomy

```
                   ┌──────────────────────────────────────────────┐
                   │               HUMAN ANATOMY                  │
  ┌────────────────┼──────────────────────────────────────────────┼────────────────┐
  │   MALE ONLY    │            SHARED HUMAN ANATOMY              │  FEMALE ONLY   │
  │ (Male \ Female)│               (Male ∩ Female)                │ (Female \ Male)│
  │                │                                              │                │
  │ • Testis       │  • Skeletal System (206 Bones)               │ • Ovary        │
  │ • Epididymis   │  • Muscular System (600+ Muscles)            │ • Uterine Tube │
  │ • Ductus       │  • Circulatory System (Heart, Arteries,      │ • Uterus       │
  │   deferens     │    Veins, Capillaries)                       │ • Cervix       │
  │ • Prostate     │  • Nervous System (Brain, Spinal Cord,       │ • Vagina       │
  │ • Seminal      │    Cranial & Peripheral Nerves)              │ • Clitoris     │
  │   vesicle      │  • Respiratory System (Trachea, Lungs)       │ • Labia        │
  │ • Scrotum      │  • Digestive System (Stomach, Liver,         │   major/minor  │
  │ • Penis        │    Intestines, Pancreas)                     │ • Mammary      │
  │ • Bulbourethral│  • Urinary System (Kidneys, Ureters,         │   glands       │
  │   glands       │    Bladder, Prostatic/Spongy vs Short Urethra)│ • Placenta &  │
  │                │  • Endocrine System (Pituitary, Thyroid,     │   Umbilical    │
  │                │    Adrenals, Pineal, Hypothalamus)           │   (Pregnancy)  │
  │                │  • Lymphatic & Immune Systems                │                │
  │                │  • Integumentary (Skin, Body Surface)        │                │
  └────────────────┴──────────────────────────────────────────────┴────────────────┘
```

---

## 2. Biological Homology Mapping (Developmental Counterparts)

Male and female reproductive organs originate from identical embryonic precursors (indifferent gonads, Wolffian ducts, and Müllerian ducts). The knowledge base links these pairs:

| Embryonic Precursor | Male Structure (Adult) | Female Structure (Adult) | Physiological / Functional Relationship |
| :--- | :--- | :--- | :--- |
| **Bipotential Gonad** | **Testis** (`FMA:7215`) | **Ovary** (`FMA:7199`) | Gametogenesis & primary sex steroid production |
| **Genital Tubercle** | **Glans penis** (`FMA:19630`) | **Glans clitoridis** (`FMA:20188`) | Highly sensitive erectile organ |
| **Genital Swellings** | **Scrotum** (`FMA:20197`) | **Labia majora** (`FMA:20184`) | Outer protective cutaneous envelopes |
| **Urogenital Folds** | **Ventral penis & spongy urethra** | **Labia minora** (`FMA:20185`) | Mucocutaneous margins flanking the urethra/vestibule |
| **Müllerian Duct** | *Degenerates* (Appendix testis remnant) | **Uterus, Uterine tubes, upper Vagina** | Gestational & ovum transport pathways |
| **Wolffian Duct** | **Epididymis, Ductus deferens, Seminal vesicle** | *Degenerates* (Gartner's duct remnant) | Sperm maturation, storage, and ejaculation tract |
| **Urogenital Sinus** | **Prostate gland** (`FMA:9600`) | **Paraurethral (Skene's) glands** | Secretory accessory glands providing lubricating fluids |
| **Bulbourethral area**| **Bulbourethral (Cowper's) glands** | **Greater vestibular (Bartholin's) glands** | Mucous secretion during arousal |

---

## 3. Data Dictionary Schema (`anatomy-dictionary.json`)

Each entry in the unified dictionary adheres to this schema:

```typescript
export type VennClassification = 'shared' | 'male_only' | 'female_only';

export interface HomologyRelation {
  counterpartConceptId: string;
  counterpartName: string;
  counterpartSex: 'male' | 'female';
  developmentalOrigin: string; // e.g. "Bipotential Gonad"
  notes: string;
}

export interface UnifiedConcept {
  id: string; // FMA ID, e.g. "FMA:7088"
  name: string; // Canonical English name
  system: SystemId; // e.g. "cardiac", "reproductive"
  classification: VennClassification;
  description: string;
  homology?: HomologyRelation;
  models: {
    male?: {
      partIds: string[]; // mesh part IDs in atlas.json
      chunkIndices: number[];
    };
    female?: {
      partIds: string[]; // mesh part IDs in atlas-female.json
      chunkIndices: number[];
    };
  };
}
```

---

## 4. UI/UX Specification for Venn Interaction

### 4.1. Venn Status Badges in the Detail Sheet
When any structure is tapped, a clean pill badge appears below the structure title:
* 🟢 **Shared Human Anatomy** — *Found in both male and female bodies*
* 🔵 **Male-Specific Structure** — *Distinct male reproductive anatomy*
* 🟣 **Female-Specific Structure** — *Distinct female reproductive anatomy*

### 4.2. Interactive Homology Card
If the selected structure has an anatomical counterpart (e.g. Testis or Ovary), a dedicated card appears in the information panel:
```
┌───────────────────────────────────────────────────────────┐
│ ⟷ BIOLOGICAL COUNTERPART                                   │
│ Ovary (Female Reference)                                  │
│ Origin: Bipotential embryonic gonad                       │
│ [ Switch to Female & View Counterpart → ]                 │
└───────────────────────────────────────────────────────────┘
```
Tapping the button immediately switches the 3D viewer to the opposite sex, loads the counterpart geometry, centers the camera, and selects the organ.

### 4.3. Venn Filter & Presets in the Systems Panel
In the Systems drawer, add a **Venn Distribution filter**:
* **All Anatomy**: Default view.
* **Shared Only**: Highlights the ~95% shared body; dims or hides reproductive structures.
* **Sex-Dimorphic Only**: Isolates the reproductive systems and endocrine differences, showing exactly where male and female anatomy diverge.

---

## 5. Execution Roadmap

1. **Step 1:** Restore female geometry chunks (`female-*.bin*`), `atlas-female.json`, and converter from git history.
2. **Step 2:** Formulate `anatomy-dictionary.ts` integrating the Venn classifications, homology pairs, and unified definitions.
3. **Step 3:** Implement the clean UI/UX Header/Dock Sex Switcher with smooth transition states.
4. **Step 4:** Integrate the Homology Card and Venn classification badges into the standardized detail panel.
5. **Step 5:** Validate both models and run production builds.
