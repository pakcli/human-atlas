import { type SystemId } from './anatomy';

export type VennClassification = 'shared' | 'male_only' | 'female_only';

export interface HomologyInfo {
  counterpartName: string;
  counterpartSex: 'male' | 'female';
  developmentalOrigin: string;
  notes: string;
}

export const HOMOLOGY_MAP: Record<string, HomologyInfo> = {
  // Male structures pointing to Female counterparts
  'testis': {
    counterpartName: 'Ovary',
    counterpartSex: 'female',
    developmentalOrigin: 'Bipotential embryonic gonad',
    notes: 'Both produce gametes (sperm vs. ova) and primary sex hormones (testosterone vs. estrogen/progesterone).'
  },
  'right testis': {
    counterpartName: 'Right ovary',
    counterpartSex: 'female',
    developmentalOrigin: 'Right bipotential embryonic gonad',
    notes: 'Right gonad counterpart producing gametes and hormones.'
  },
  'left testis': {
    counterpartName: 'Left ovary',
    counterpartSex: 'female',
    developmentalOrigin: 'Left bipotential embryonic gonad',
    notes: 'Left gonad counterpart producing gametes and hormones.'
  },
  'scrotum': {
    counterpartName: 'Labia majora',
    counterpartSex: 'female',
    developmentalOrigin: 'Embryonic labioscrotal swellings',
    notes: 'Both form the outer protective cutaneous envelope surrounding internal or external genitalia.'
  },
  'penis': {
    counterpartName: 'Clitoris',
    counterpartSex: 'female',
    developmentalOrigin: 'Embryonic genital tubercle and urogenital folds',
    notes: 'Both share homologous erectile tissues (corpora cavernosa) and dense sensory innervation.'
  },
  'prostate': {
    counterpartName: 'Paraurethral glands',
    counterpartSex: 'female',
    developmentalOrigin: 'Embryonic urogenital sinus',
    notes: 'Both develop from the urogenital sinus and produce prostatic fluid secretions.'
  },

  // Female structures pointing to Male counterparts
  'ovary': {
    counterpartName: 'Testis',
    counterpartSex: 'male',
    developmentalOrigin: 'Bipotential embryonic gonad',
    notes: 'Both produce gametes (ova vs. sperm) and primary sex hormones.'
  },
  'right ovary': {
    counterpartName: 'Right testis',
    counterpartSex: 'male',
    developmentalOrigin: 'Right bipotential embryonic gonad',
    notes: 'Right gonad counterpart producing gametes and hormones.'
  },
  'left ovary': {
    counterpartName: 'Left testis',
    counterpartSex: 'male',
    developmentalOrigin: 'Left bipotential embryonic gonad',
    notes: 'Left gonad counterpart producing gametes and hormones.'
  },
  'uterus': {
    counterpartName: 'Prostatic utricle (vestigial)',
    counterpartSex: 'male',
    developmentalOrigin: 'Paramesonephric (Müllerian) ducts',
    notes: 'In females, Müllerian ducts form the uterus and tubes; in males, anti-Müllerian hormone causes them to regress.'
  },
  'vagina': {
    counterpartName: 'Prostatic utricle',
    counterpartSex: 'male',
    developmentalOrigin: 'Müllerian ducts & urogenital sinus',
    notes: 'Forms the female reproductive canal and part of the birth canal.'
  },
  'clitoris': {
    counterpartName: 'Penis',
    counterpartSex: 'male',
    developmentalOrigin: 'Embryonic genital tubercle',
    notes: 'Shares homologous erectile corpora cavernosa with the male penis.'
  },
  'labia majora': {
    counterpartName: 'Scrotum',
    counterpartSex: 'male',
    developmentalOrigin: 'Embryonic labioscrotal swellings',
    notes: 'Homologous outer cutaneous folds protecting the genitalia.'
  },
  'labia minora': {
    counterpartName: 'Ventral penis & penile raphe',
    counterpartSex: 'male',
    developmentalOrigin: 'Embryonic urogenital folds',
    notes: 'In males, fuse to form the ventral penis; in females, remain separate flanking the vestibule.'
  }
};

export const UNIFIED_DEFINITIONS: Record<string, string> = {
  // Female reproductive & pregnancy
  'uterus': 'A hollow, muscular organ in the female pelvis. It provides mechanical protection, nutritional support, and waste removal for the developing embryo and fetus during pregnancy.',
  'ovary': 'The female gonad that stores and releases oocytes (egg cells) during ovulation. It also acts as an endocrine gland producing estrogen and progesterone.',
  'right ovary': 'The right female gonad situated in the ovarian fossa of the lateral pelvic wall, responsible for follicle maturation and hormone release.',
  'left ovary': 'The left female gonad situated in the ovarian fossa of the lateral pelvic wall, responsible for follicle maturation and hormone release.',
  'vagina': 'An elastic muscular canal lined with stratified squamous epithelium that extends from the cervix of the uterus to the vulval vestibule.',
  'uterine tube': 'Paired conduits (Fallopian tubes) that transport ova from the ovaries to the uterus and serve as the typical site of fertilization.',
  'cervix': 'The lower, cylindrical portion of the uterus that projects into the upper vagina, allowing passage of menstrual fluids and sperm.',
  'placenta': 'A temporary gestational vascular organ that develops during pregnancy to facilitate nutrient, gas, and waste exchange between maternal and fetal blood supplies.',
  'umbilical cord': 'The conduit containing two umbilical arteries and one umbilical vein connecting the developing fetus to the placenta.',

  // Male reproductive
  'testis': 'The male gonad contained within the scrotum. It produces spermatozoa through spermatogenesis and secretes androgens, primarily testosterone.',
  'right testis': 'The right male gonad, suspended by the spermatic cord within the scrotum.',
  'left testis': 'The left male gonad, typically hanging slightly lower within the scrotum.',
  'prostate': 'A walnut-sized male exocrine gland situated below the urinary bladder. It secretes alkaline fluid that nourishes and protects sperm.',
  'epididymis': 'A tightly coiled duct on the posterior aspect of each testis that stores and matures sperm cells before ejaculation.',
  'ductus deferens': 'The muscular tube that propels sperm from the epididymis to the ejaculatory ducts during emission.',
  'seminal vesicle': 'Pair of glands posterior to the urinary bladder that produce fructose-rich fluid comprising up to 70% of semen volume.',
  'scrotum': 'The fibromuscular cutaneous pouch suspended beneath the pubic symphysis containing and thermoregulating the testes.',
  'penis': 'The male external copulatory and urinary organ comprising the root, body (shaft), and glans.',

  // Shared Core Organs
  'heart': 'A four-chambered muscular pump located in the middle mediastinum that propels oxygenated blood to tissues and deoxygenated blood to the lungs.',
  'liver': 'The largest internal metabolic organ, positioned in the right upper quadrant. It processes nutrients, detoxifies metabolites, synthesizes plasma proteins, and secretes bile.',
  'brain': 'The primary control center of the central nervous system, coordinating sensory processing, motor command, cognitive thought, memory, and autonomic homeostasis.',
  'stomach': 'A J-shaped muscular organ in the upper alimentary tract that performs mechanical breakdown and enzymatic digestion of ingested food.',
  'spleen': 'A lymphoid organ located in the left hypochondrium that filters blood, removes senescent erythrocytes, and mounts immune responses against blood-borne pathogens.',
  'pancreas': 'A dual-function retroperitoneal gland that secretes digestive enzymes into the duodenum and releases metabolic hormones (insulin and glucagon) into circulation.',
  'urinary bladder': 'A distensible muscular sac in the pelvic cavity that stores urine received from the kidneys via the ureters until micturition.',
  'trachea': 'The cartilaginous tube conducting air from the larynx to the principal bronchi in the thoracic cavity.',
  'diaphragm': 'The primary musculotendinous partition separating the thoracic and abdominal cavities, whose contraction drives pulmonary ventilation.',
  'kidney': 'Essential paired retroperitoneal organs that filter blood plasma, eliminate metabolic waste as urine, and regulate fluid-electrolyte and acid-base equilibrium.',
  'thyroid gland': 'An endocrine gland situated on the anterior trachea that synthesizes thyroid hormones (T3, T4) regulating systemic metabolic rate and calcitonin.',
  'gallbladder': 'A hollow pear-shaped organ beneath the liver that concentrates and stores hepatic bile until stimulated to contract by food in the duodenum.'
};

/**
 * Categorize any anatomical part into Venn taxonomy:
 * - 'shared': exists in both male and female bodies (~95% of human anatomy)
 * - 'male_only': male-specific reproductive anatomy
 * - 'female_only': female-specific reproductive / pregnancy anatomy
 */
export function getVennClassification(
  name: string,
  system: SystemId,
  sex?: 'male' | 'female'
): VennClassification {
  if (system === 'pregnancy') return 'female_only';

  const lower = name.toLowerCase();

  // Distinct female reproductive structures
  if (
    /uterus|uterine|ovary|ovarian|vagina|vaginal|cervix|cervical canal|clitoris|labium|labia|placenta|umbilical/i.test(lower)
  ) {
    return 'female_only';
  }

  // Distinct male reproductive structures
  if (
    /testis|testicle|epididymis|ductus deferens|vas deferens|prostate|prostatic|seminal vesicle|scrotum|scrotal|penis|penile|bulbourethral/i.test(lower)
  ) {
    return 'male_only';
  }

  if (system === 'reproductive') {
    return sex === 'female' ? 'female_only' : 'male_only';
  }

  return 'shared';
}

/**
 * Retrieve developmental/biological homology information for sex-dimorphic structures.
 */
export function getHomology(name: string): HomologyInfo | null {
  const lower = name.toLowerCase().trim();
  if (HOMOLOGY_MAP[lower]) return HOMOLOGY_MAP[lower];

  for (const [key, info] of Object.entries(HOMOLOGY_MAP)) {
    if (lower.includes(key)) return info;
  }
  return null;
}

/**
 * Standardized definitional description for any anatomical structure across both sexes.
 */
export function getStandardizedDescription(
  name: string,
  system: SystemId,
  sex?: 'male' | 'female'
): string {
  const lower = name.toLowerCase().trim();

  // Direct match in unified definitions
  if (UNIFIED_DEFINITIONS[lower]) return UNIFIED_DEFINITIONS[lower];

  // Substring match
  for (const [key, desc] of Object.entries(UNIFIED_DEFINITIONS)) {
    if (lower.includes(key)) return desc;
  }

  // Fallback to sex-aware reproductive overview
  if (system === 'reproductive') {
    if (sex === 'female') {
      return 'Female reproductive structures include the ovaries, uterine tubes, uterus, cervix, and vagina. Together they support oocyte maturation, fertilization, gestation, and hormonal regulation.';
    }
    return 'Male reproductive structures include the testes, epididymides, ductus deferentia, seminal vesicles, and prostate. They produce, mature, and transport spermatozoa and secrete sex hormones.';
  }

  if (system === 'pregnancy') {
    return 'The placenta and umbilical cord support exchange between maternal and fetal circulations during pregnancy. These reference structures are shown separately from the default adult anatomy.';
  }

  return '';
}
