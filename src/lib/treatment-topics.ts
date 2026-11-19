export interface TreatmentTopic {
  title: string;
  summary: string;
  conditions: string[];
}

export const TREATMENT_TOPICS: TreatmentTopic[] = [
  {
    title: 'Skin & dermatological concerns',
    summary: 'Skin and scalp conditions you may want to discuss with a healthcare professional.',
    conditions: ['Eczema and atopic dermatitis', 'Psoriasis', 'Acne', 'Alopecia areata and hair loss', 'Urticaria (hives)', 'Fungal skin infections', 'Lichen planus', 'Vitiligo'],
  },
  {
    title: 'Respiratory conditions & allergies',
    summary: 'Allergy and respiratory topics listed for general information and discussion.',
    conditions: ['Allergic rhinitis', 'Asthma', 'Sinusitis', 'Tonsil and adenoid concerns', 'Bronchitis and persistent cough', 'Nasal polyps and congestion'],
  },
  {
    title: 'Digestive & gastrointestinal health',
    summary: 'Digestive concerns that may need assessment by an appropriately qualified clinician.',
    conditions: ['Acid reflux (GERD) and acidity', 'Irritable bowel syndrome (IBS)', 'Gastritis and peptic ulcers', 'Constipation and haemorrhoids', 'Fatty liver concerns', 'Food intolerance and bloating'],
  },
  {
    title: "Women's health & hormonal conditions",
    summary: 'Reproductive, menstrual and endocrine topics for discussion with a qualified healthcare professional.',
    conditions: ['PCOS / PCOD', 'Irregular, painful or heavy periods', 'Hypothyroidism and Hashimoto’s thyroiditis', 'Fibroids and endometriosis', 'Menopause symptoms', 'Premenstrual dysphoric disorder (PMDD)'],
  },
  {
    title: 'Child & pediatric health',
    summary: 'Children’s health concerns should be assessed with a parent or guardian and an appropriately qualified clinician.',
    conditions: ['Recurring upper respiratory infections', 'Tonsil and adenoid concerns', 'Teething discomfort', 'Fever and diarrhoea', 'Asthma and bronchiolitis', 'Bedwetting (enuresis)', 'Appetite or growth concerns'],
  },
  {
    title: 'Joint, spine & musculoskeletal concerns',
    summary: 'Joint and movement concerns that may require medical assessment and ongoing care.',
    conditions: ['Osteoarthritis', 'Cervical and lumbar spondylosis', 'Sciatica', 'Rheumatoid arthritis', 'Gout', 'Frozen shoulder and tennis elbow'],
  },
  {
    title: 'Mental wellness & lifestyle concerns',
    summary: 'Mental health and persistent symptoms deserve support from a qualified health professional.',
    conditions: ['Anxiety and panic episodes', 'Sleep difficulties', 'Migraine and recurring headaches', 'Chronic fatigue', 'Burnout and brain fog'],
  },
];
