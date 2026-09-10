export type SeverityLevel = "Low" | "Moderate" | "High" | "Critical";

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
}

export interface Farm {
  id: string;
  user_id: string;
  name: string;
  location: string;
  size_acres?: number;
  created_at: string;
}

export interface Field {
  id: string;
  farm_id: string;
  name: string;
  crop_type: string; // e.g. "Roma Tomatoes", "Beefsteak", "Cherry", "Local Variety"
  planting_date?: string;
  plant_count?: number;
  created_at: string;
}

export interface Observation {
  id: string;
  field_id?: string;
  user_id?: string;
  notes?: string;
  symptoms: string[];
  growth_stage?: string;
  weather_condition?: string;
  affected_part?: string;
  created_at: string;
}

export interface ActionPlanItem {
  id: string;
  action: string;
  priority: "Immediate" | "Within 48 hours" | "Long-term";
  completed?: boolean;
}

export interface PlantIdDiseaseMatch {
  name: string;
  scientific_name?: string;
  probability: number;
  description?: string;
  treatment?: {
    biological?: string[];
    chemical?: string[];
    prevention?: string[];
  };
}

export interface PlantIdResult {
  is_plant: boolean;
  is_healthy: boolean;
  plant_name: string;
  suggestions: PlantIdDiseaseMatch[];
  raw_response?: any;
}

export interface DiagnosisRecord {
  id: string;
  observation_id?: string;
  farm_id?: string;
  farm_name?: string;
  field_id?: string;
  field_name?: string;
  image_url?: string;
  diagnosis: string;
  severity: SeverityLevel;
  confidence: number;
  explanation: string;
  action_plan: string[];
  action_items?: ActionPlanItem[];
  warning: string;
  cultural_controls?: string[];
  symptoms_detected?: string[];
  created_at: string;
}

export interface DiagnosisRequest {
  image_base64?: string;
  image_url?: string;
  farm_id?: string;
  field_id?: string;
  symptoms?: string[];
  growth_stage?: string;
  weather_condition?: string;
  affected_part?: string;
  notes?: string;
}

export interface DiagnosisResponse {
  diagnosis: string;
  severity: SeverityLevel;
  confidence: number;
  explanation: string;
  action_plan: string[];
  warning: string;
  symptoms_detected?: string[];
  cultural_controls?: string[];
  plant_id_raw?: {
    top_match: string;
    probability: number;
  };
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
}

export interface ChatRequest {
  message: string;
  diagnosis_context?: {
    diagnosis: string;
    severity: SeverityLevel;
    explanation: string;
    action_plan: string[];
    symptoms?: string[];
  };
  history?: { role: "user" | "model"; parts: string }[];
}
