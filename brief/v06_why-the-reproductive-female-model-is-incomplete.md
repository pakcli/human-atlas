# Anatomical & Scientific Analysis: Source Data, Female Reproductive Coverage & Anatomical Integrity

**File:** `brief/v06_why-the-reproductive-female-model-is-incomplete.md`  
**Target Repo:** https://github.com/pakcli/human-atlas  
**Primary Female Source:** HuBMAP / Human Reference Atlas (HRA) *3D Reference Organ Set for Female v1.5* (CC BY 4.0, DOI: [10.48539/HBM352.BTSQ.586](https://doi.org/10.48539/HBM352.BTSQ.586))  
**Primary Male Source:** BodyParts3D 4.0 (The Database Center for Life Science, University of Tokyo, CC BY 4.0)

---

## 1. Where Does the Anatomy Data Actually Come From?

| Attribute | Male Model | Female Model |
| :--- | :--- | :--- |
| **Origin Database** | **BodyParts3D 4.0** (Japan DBCLS / Univ of Tokyo) | **HuBMAP HRA v1.5** (NIH / Indiana University) |
| **Source Type** | Continuous whole-body MRI scan of an adult male cadaver | Multi-donor organ consensus reference for tissue biopsy mapping |
| **Mesh Count** | 2,234 individual anatomical structures | 888 individual anatomical structures |
| **Pelvic Floor** | Levator ani, coccygeus, perineal membrane segmented | **Not segmented** (omitted by HuBMAP researchers) |
| **Reproductive Scope** | Complete penis, testes, epididymis, prostate, vas deferens | Uterus, fallopian tubes, ovaries, cervix, and **upper vaginal fornix** |

---

## 2. Why Does the Female Reproductive System Look Incomplete in HuBMAP v1.5?

### A. The Biopsy Mapping Purpose of HuBMAP
The Human Reference Atlas (HRA) produced by the NIH HuBMAP consortium was not designed as an aesthetic 3D character or an artistic full-body model. It was engineered specifically to provide **spatial reference envelopes for registering single-cell RNA-seq and histology tissue biopsies**.

Because donor tissue samples are harvested primarily from internal viscera (uterus, cervix, ovary), the NIH team modeled:
* **The Uterus:** Fundus, corpus, cavity, and myometrium.
* **The Ovaries & Oviducts:** Left and right ovaries, fallopian tubes, fimbriae, and broad ligament sheets (*ligamentum latum*).
* **The Upper Vagina (`VH_F_vagina`):** Only the vaginal fornices encasing the cervix ($Y = 0.742\text{ m}$ to $Y = 0.801\text{ m}$, total height of only $5.85\text{ cm}$).

### B. What Was Omitted by HuBMAP
1. **The Lower Vaginal Canal & Introitus:** The distal $2/3$ of the vaginal canal connecting to the perineum ($Y \approx 0.64\text{ m}$) was never segmented.
2. **The External Vulva:** Discrete organ meshes for the *clitoris* (glans, crura, vestibular bulbs), *labia majora*, and *labia minora* were not included as separate organs; only the continuous outer skin surface (`VH_F_skin`) was provided.
3. **The Pelvic Floor (*Diaphragma pelvis*):** The muscular hammock composed of *Levator ani* and *Coccygeus* muscles was not segmented. Without these supporting muscles, the upper vaginal cup appears to "float" or terminate abruptly in mid-air inside the pelvic basin.

---

## 3. Transparency Note: The "Procedural Cylinder" Experiment & Why It Was Reverted

In an attempt to visually close the $10\text{ cm}$ gap down to the perineum, a procedural script (`scripts/complete-female-vagina.mjs`) was tested that generated a 16-sided geometric cylinder and sphere.

### Why Procedural/Manual Geometry Is Unacceptable in an Educational Atlas:
1. **Visual Distortion:** As seen in the viewport, a procedural tube looks like a rigid mechanical pipe or grey plastic cylinder protruding from the cervix—completely unnatural and visually jarring.
2. **Scientific & Educational Inaccuracy:** Real vaginal anatomy is not a round hollow pipe; in living anatomy, it is an H- or H-collapsed muscular tube with transverse mucosal rugae, angled anteroinferiorly along the pelvic axis (~45° to the vertical), passing through the urogenital hiatus of the levator ani muscle.
3. **Violation of Scientific Attribution:** An educational reference atlas must maintain strict scientific integrity. Users and medical students must trust that every mesh comes directly from peer-reviewed scientific datasets (BodyParts3D or HuBMAP HRA), not fabricated artificial primitives.

**Resolution:**
The synthetic procedural meshes (`VH_F_vagina_lower` and `VH_F_vulva_clitoris`) were **immediately reverted and deleted** (commit `6a8594e`). The female atlas remains 100% authentic to the official NIH HuBMAP HRA v1.5 dataset.

---

## 4. How the Model Is Accurately Presented & Explained

Instead of faking geometry, a high-quality anatomical atlas handles source coverage differences through:

1. **Rigorous Metadata & Naming:**
   - All 888 authentic HuBMAP meshes are verified and indexed.
   - Raw source glitches (like `VH_F_cervicovaginal_junction` and `VH_F_cornua` being labeled `'-'`) have been properly resolved to `"Cervicovaginal junction"` and `"Uterine cornu"` with official FMA concept IDs.
2. **Standardized Educational Panel:**
   - Both male and female structures share the exact same rich definitional sheets, anatomical system tags, Venn classification (`shared`, `male_only`, `female_only`), and biological homology links.
   - The dictionary accurately explains the anatomical extent of each organ (e.g., explaining that `VH_F_vagina` represents the superior vaginal vault and fornices supporting the uterine cervix).
3. **Spatial Context Grounding:**
   - Viewing the reproductive system with the semi-transparent body envelope (`integumentary`) or the pelvic bones provides anatomical orientation so the pelvic cavity and perineal floor relationships are clear and clear to the user.
