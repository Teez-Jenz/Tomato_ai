import { Farm, Field, DiagnosisRecord, UserProfile, ActionPlanItem } from "@/types";
import { createClient } from "./supabase/client";

// Storage Keys
const STORAGE_KEYS = {
  USER: "tomato_ai_user",
  FARMS: "tomato_ai_farms",
  FIELDS: "tomato_ai_fields",
  DIAGNOSES: "tomato_ai_diagnoses",
};

// Realistic Seed Data for Demo & School Evaluation
const SEED_USER: UserProfile = {
  id: "demo-farmer-01",
  full_name: "Ibrahim Sani",
  email: "ibrahim@tomatofarm.ng",
  created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
};

const SEED_FARMS: Farm[] = [
  {
    id: "farm-green-acres",
    user_id: "demo-farmer-01",
    name: "Green Valley Farm",
    location: "Kano Valley, Nigeria",
    size_acres: 4.5,
    created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "farm-sunshine-hills",
    user_id: "demo-farmer-01",
    name: "Sunshine Ridge Crops",
    location: "Zaria Agricultural Belt",
    size_acres: 2.0,
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const SEED_FIELDS: Field[] = [
  {
    id: "field-roma-alpha",
    farm_id: "farm-green-acres",
    name: "Field A - Roma Tomatoes",
    crop_type: "Roma VF (Determinate)",
    planting_date: "2026-06-15",
    plant_count: 1200,
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "field-cherry-beta",
    farm_id: "farm-green-acres",
    name: "Field B - Sweet Cherry",
    crop_type: "Sweet Million (Cherry)",
    planting_date: "2026-07-02",
    plant_count: 850,
    created_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "field-beefsteak-gamma",
    farm_id: "farm-sunshine-hills",
    name: "Plot 1 - Beefsteak Heirloom",
    crop_type: "Beefsteak Classic",
    planting_date: "2026-06-28",
    plant_count: 600,
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const SEED_DIAGNOSES: DiagnosisRecord[] = [
  {
    id: "diag-sample-01",
    farm_id: "farm-green-acres",
    farm_name: "Green Valley Farm",
    field_id: "field-roma-alpha",
    field_name: "Field A - Roma Tomatoes",
    diagnosis: "Early Blight (Alternaria solani)",
    severity: "Moderate",
    confidence: 89,
    explanation: "The lower foliage demonstrates brown circular lesions with distinct concentric target rings surrounded by chlorotic yellow halos, characteristic of early blight fungal development.",
    action_plan: [
      "Prune and safely burn lower infected leaves up to 30cm off the soil bed.",
      "Switch immediately to base drip or furrow watering to maintain dry foliage.",
      "Apply protective copper hydroxide spray across unaffected neighboring plants.",
      "Lay organic dry straw mulch around plant stems to stop soil spore splash.",
    ],
    action_items: [
      { id: "act-1", action: "Prune and safely destroy lower infected leaves", priority: "Immediate", completed: true },
      { id: "act-2", action: "Switch immediately to base watering", priority: "Immediate", completed: true },
      { id: "act-3", action: "Apply protective copper fungicide spray", priority: "Within 48 hours", completed: false },
      { id: "act-4", action: "Lay clean straw mulch around plant bases", priority: "Long-term", completed: false },
    ],
    warning: "This is an AI-assisted assessment. If lesions expand past 50% of the foliage, consult an agricultural extension officer.",
    symptoms_detected: ["Dark spots with concentric rings", "Lower leaf yellowing", "Leaf tip dieback"],
    cultural_controls: [
      "Avoid planting solanaceous crops in this section for the next 3 seasons.",
      "Sanitize secateurs with 10% bleach after pruning.",
    ],
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "diag-sample-02",
    farm_id: "farm-green-acres",
    farm_name: "Green Valley Farm",
    field_id: "field-cherry-beta",
    field_name: "Field B - Sweet Cherry",
    diagnosis: "Healthy Tomato Plant",
    severity: "Low",
    confidence: 96,
    explanation: "The foliage displays strong green coloration, uniform leaf margins, and vigorous vegetative development with zero signs of pathogen-induced necrosis or leaf curling.",
    action_plan: [
      "Maintain consistent soil moisture levels during initial flowering.",
      "Continue bi-weekly scouting for early whitefly or aphid colonization.",
      "Check supporting stakes to ensure upright airflow.",
    ],
    action_items: [
      { id: "act-h1", action: "Maintain current soil watering regime", priority: "Immediate", completed: true },
      { id: "act-h2", action: "Inspect underside of leaves for whitefly nymphs", priority: "Within 48 hours", completed: false },
    ],
    warning: "Plant appears healthy. Keep up optimal cultivation practices.",
    symptoms_detected: ["Healthy green foliage", "Vigorous shoot growth"],
    cultural_controls: ["Maintain companion plantings like marigolds to deter nematodes."],
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

class StorageManager {
  private isBrowser(): boolean {
    return typeof window !== "undefined";
  }

  // --- USER AUTH / PROFILE ---
  getUser(): UserProfile | null {
    if (!this.isBrowser()) return null;
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(SEED_USER));
      return SEED_USER;
    }
    try {
      return JSON.parse(data);
    } catch {
      return SEED_USER;
    }
  }

  setUser(user: UserProfile | null): void {
    if (!this.isBrowser()) return;
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }

  // --- FARMS ---
  getFarms(): Farm[] {
    if (!this.isBrowser()) return SEED_FARMS;
    const data = localStorage.getItem(STORAGE_KEYS.FARMS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.FARMS, JSON.stringify(SEED_FARMS));
      return SEED_FARMS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return SEED_FARMS;
    }
  }

  addFarm(farm: Omit<Farm, "id" | "created_at">): Farm {
    const newFarm: Farm = {
      ...farm,
      id: `farm-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    if (this.isBrowser()) {
      const farms = this.getFarms();
      farms.unshift(newFarm);
      localStorage.setItem(STORAGE_KEYS.FARMS, JSON.stringify(farms));
    }
    return newFarm;
  }

  // --- FIELDS ---
  getFields(farmId?: string): Field[] {
    if (!this.isBrowser()) return SEED_FIELDS;
    const data = localStorage.getItem(STORAGE_KEYS.FIELDS);
    let fields: Field[] = [];
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.FIELDS, JSON.stringify(SEED_FIELDS));
      fields = SEED_FIELDS;
    } else {
      try {
        fields = JSON.parse(data);
      } catch {
        fields = SEED_FIELDS;
      }
    }
    return farmId ? fields.filter((f) => f.farm_id === farmId) : fields;
  }

  addField(field: Omit<Field, "id" | "created_at">): Field {
    const newField: Field = {
      ...field,
      id: `field-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    if (this.isBrowser()) {
      const fields = this.getFields();
      fields.unshift(newField);
      localStorage.setItem(STORAGE_KEYS.FIELDS, JSON.stringify(fields));
    }
    return newField;
  }

  // --- DIAGNOSES ---
  getDiagnoses(): DiagnosisRecord[] {
    if (!this.isBrowser()) return SEED_DIAGNOSES;
    const data = localStorage.getItem(STORAGE_KEYS.DIAGNOSES);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.DIAGNOSES, JSON.stringify(SEED_DIAGNOSES));
      return SEED_DIAGNOSES;
    }
    try {
      return JSON.parse(data);
    } catch {
      return SEED_DIAGNOSES;
    }
  }

  getDiagnosisById(id: string): DiagnosisRecord | undefined {
    const list = this.getDiagnoses();
    return list.find((d) => d.id === id);
  }

  saveDiagnosis(diag: Omit<DiagnosisRecord, "id" | "created_at">): DiagnosisRecord {
    const actionItems: ActionPlanItem[] = (diag.action_plan || []).map((action, i) => ({
      id: `act-${Date.now()}-${i}`,
      action,
      priority: i === 0 ? "Immediate" : i === 1 ? "Within 48 hours" : "Long-term",
      completed: false,
    }));

    const newRecord: DiagnosisRecord = {
      ...diag,
      id: `diag-${Date.now()}`,
      action_items: diag.action_items || actionItems,
      created_at: new Date().toISOString(),
    };

    if (this.isBrowser()) {
      const list = this.getDiagnoses();
      list.unshift(newRecord);
      localStorage.setItem(STORAGE_KEYS.DIAGNOSES, JSON.stringify(list));
    }

    // Attempt async save to Supabase if client available
    try {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => {
        if (data?.user) {
          // Can persist to Supabase diagnoses table
          supabase.from("diagnoses").insert({
            user_id: data.user.id,
            diagnosis: newRecord.diagnosis,
            confidence: newRecord.confidence,
            severity: newRecord.severity,
            explanation: newRecord.explanation,
            created_at: newRecord.created_at,
          }).then();
        }
      });
    } catch {
      // Offline / Local storage fallback active
    }

    return newRecord;
  }

  toggleActionItem(diagId: string, itemId: string): void {
    if (!this.isBrowser()) return;
    const list = this.getDiagnoses();
    const target = list.find((d) => d.id === diagId);
    if (target && target.action_items) {
      const item = target.action_items.find((it) => it.id === itemId);
      if (item) {
        item.completed = !item.completed;
        localStorage.setItem(STORAGE_KEYS.DIAGNOSES, JSON.stringify(list));
      }
    }
  }
}

export const storage = new StorageManager();
