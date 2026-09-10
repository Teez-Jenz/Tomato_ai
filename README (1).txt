TOMATO AI FARM ASSISTANT
=========================

School Project Documentation
Technology: Next.js + Supabase + Plant.id + Gemini

1. PROJECT OVERVIEW
-------------------
Tomato AI Farm Assistant is a web application designed to help small-scale
tomato farmers identify possible tomato plant health problems from an image
and receive a simple, understandable action plan.

This version is being built as a school project and is optimized for speed
of development rather than training a custom machine-learning model.

The application combines:
- Next.js for the web application and server-side API routes
- Supabase for authentication, database and image storage
- Plant.id for plant/disease identification
- Google Gemini for explanations, action plans and conversational assistance

IMPORTANT:
Plant.id is the primary diagnostic engine.
Gemini is the explanation/action-plan engine.
Gemini should not independently override Plant.id's diagnosis.

2. MAIN OBJECTIVE
-----------------
A farmer should be able to:

1. Create an account.
2. Create a farm.
3. Add a tomato field/crop.
4. Upload a picture of a tomato plant.
5. Answer a few optional questions about the plant.
6. Receive an AI-assisted diagnosis.
7. See the likely problem and confidence.
8. Receive a simple action plan.
9. Save the diagnosis.
10. Review previous diagnoses.
11. Ask follow-up questions about the diagnosis.

3. CORE USER FLOW
-----------------
Landing Page
    |
    v
Register / Login
    |
    v
Farmer Dashboard
    |
    v
Create Farm
    |
    v
Create Field / Tomato Crop
    |
    v
Diagnose Plant
    |
    v
Upload Image
    |
    v
Plant.id
    |
    v
Diagnosis Result
    |
    +--------------------+
    |                    |
    v                    v
Plant.id result      Farmer details
    |                    |
    +---------+----------+
              |
              v
           Gemini
              |
              v
Explanation + Severity + Action Plan
              |
              v
        Final Result Page
              |
              v
        Save to Supabase
              |
              v
       Diagnosis History
              |
              v
        AI Follow-up Chat

4. HIGH-LEVEL ARCHITECTURE
---------------------------
                    FARMER
                       |
                       v
                Next.js Web App
                       |
                       v
                Image Upload
                       |
                       v
              Next.js API Route
                       |
             +---------+---------+
             |                   |
             v                   v
         Plant.id             Gemini
     Plant diagnosis      Explanation/plan
             |                   |
             +---------+---------+
                       |
                       v
                Final Result
                       |
                       v
                    Supabase
              /        |        \
           Auth      Database    Storage


5. TECHNOLOGY STACK
-------------------
Frontend:
- Next.js
- React
- TypeScript
- Tailwind CSS

Backend:
- Next.js App Router API routes
- Server-side API calls

Database/Auth/Storage:
- Supabase
- PostgreSQL
- Supabase Auth
- Supabase Storage

AI:
- Plant.id
- Google Gemini API

Deployment:
- Vercel or another Next.js-compatible host
- Supabase hosted backend

6. WHY THESE AI SERVICES?
-------------------------
PLANT.ID
Plant.id is used as the specialized plant identification/health service.
It is responsible for analyzing the uploaded plant image and returning
possible plant health problems.

GEMINI
Gemini is used after Plant.id returns its result. It can turn the technical
diagnosis into a farmer-friendly explanation and action plan. It can also
power a later "Ask the AI" conversation.

The separation makes the project easier to explain academically:

Computer Vision / Specialized AI:
    Plant.id

Generative AI:
    Gemini

Application / Business Logic:
    Next.js

Data / Authentication:
    Supabase

7. MVP FEATURES
---------------
Required:
- User registration/login
- Farmer dashboard
- Farm creation
- Tomato field/crop creation
- Plant image upload
- Plant.id diagnosis
- Gemini explanation
- Severity assessment
- Action plan
- Save diagnosis
- Diagnosis history

Optional:
- AI follow-up chat
- Admin dashboard
- Expert review
- Weather information
- Notifications
- Multiple crops
- Local language support
- Voice input
- Offline functionality

8. DATABASE PLAN
----------------
Initial tables:

users
- id
- full_name
- email
- created_at

farms
- id
- user_id
- name
- location
- created_at

fields
- id
- farm_id
- name
- crop_type
- planting_date
- created_at

observations
- id
- field_id
- user_id
- notes
- symptoms
- created_at

images
- id
- observation_id
- storage_path
- public_url
- created_at

diagnoses
- id
- observation_id
- plant_id_result
- diagnosis
- confidence
- severity
- explanation
- warning
- created_at

action_plans
- id
- diagnosis_id
- action
- priority
- created_at

Later tables:
- diseases
- expert_reviews
- chat_sessions
- chat_messages

9. API PLAN
-----------
POST /api/diagnose
Purpose:
- Receive uploaded tomato image
- Send image to Plant.id
- Extract diagnosis
- Send Plant.id result plus farmer information to Gemini
- Return structured final result

POST /api/chat
Purpose:
- Receive user question
- Include relevant diagnosis context
- Ask Gemini for an answer
- Return response

Later:
GET /api/diagnoses
GET /api/diagnoses/:id
POST /api/farms
POST /api/fields
POST /api/observations

10. EXPECTED DIAGNOSIS RESPONSE
-------------------------------
The application should eventually return data similar to:

{
  "diagnosis": "Early Blight",
  "severity": "Moderate",
  "confidence": 87,
  "explanation": "The image and reported symptoms are consistent with
  early blight.",
  "action_plan": [
    "Inspect nearby tomato plants.",
    "Remove severely affected leaves.",
    "Avoid overhead watering.",
    "Monitor the affected plants."
  ],
  "warning": "This is an AI-assisted assessment. If symptoms worsen,
  consult an agricultural professional."
}

The exact response format will be implemented using structured output
from Gemini.

11. SECURITY
-----------
Never expose these secrets in browser/client code:

PLANT_ID_API_KEY
GEMINI_API_KEY

They must remain server-side in environment variables.

Public Supabase variables can use the NEXT_PUBLIC_ prefix as required by
Supabase's client-side architecture.

Never commit .env.local to Git.

12. ENVIRONMENT VARIABLES
-------------------------
Create a .env.local file in the project root.

Expected variables:

NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key

PLANT_ID_API_KEY=your_plant_id_api_key

GEMINI_API_KEY=your_gemini_api_key

Do not put real keys in this README or in source code.

13. PROJECT STRUCTURE
--------------------
tomato-ai/
|
+-- app/
|   +-- page.tsx
|   +-- dashboard/
|   +-- diagnose/
|   +-- api/
|       +-- diagnose/
|       |   +-- route.ts
|       +-- chat/
|           +-- route.ts
|
+-- components/
|
+-- lib/
|   +-- supabase/
|   +-- plantid.ts
|   +-- gemini.ts
|
+-- types/
|
+-- public/
|
+-- .env.local
+-- .gitignore
+-- package.json
+-- README.txt

14. DEVELOPMENT STAGES
----------------------
STAGE 1 - Project Setup
- Create Next.js project
- Install required packages
- Create Supabase project
- Configure environment variables
- Configure project folders
- Verify application runs

STAGE 2 - Authentication
- Supabase Auth
- Register
- Login
- Logout
- Protected dashboard

STAGE 3 - Farmer Dashboard
- Dashboard layout
- Farm creation
- Field/crop creation

STAGE 4 - Image Upload
- Upload tomato image
- Preview image
- Store image in Supabase Storage

STAGE 5 - Plant.id
- Create server-side Plant.id integration
- Send image
- Receive diagnosis
- Display raw diagnosis for testing

STAGE 6 - Gemini
- Send Plant.id result to Gemini
- Generate explanation
- Generate severity
- Generate action plan
- Return structured JSON

STAGE 7 - Diagnosis History
- Save diagnoses
- Display history
- View individual diagnosis

STAGE 8 - AI Chat
- Ask questions about diagnosis
- Maintain diagnosis context
- Generate farmer-friendly answers

STAGE 9 - Admin
- Basic dashboard
- View users
- View diagnosis statistics
- Review submitted observations

STAGE 10 - Testing and Deployment
- Test API errors
- Test authentication
- Test uploads
- Test AI responses
- Add security rules
- Deploy

15. STAGE 1 CHECKLIST
---------------------
[ ] Install Node.js 20.9+
[ ] Create Next.js project
[ ] Use TypeScript
[ ] Use Tailwind CSS
[ ] Use App Router
[ ] Start development server
[ ] Create Supabase project
[ ] Obtain Supabase URL
[ ] Obtain Supabase publishable key
[ ] Create .env.local
[ ] Install Supabase package
[ ] Install Gemini SDK
[ ] Install Zod
[ ] Create lib folder
[ ] Create AI integration files
[ ] Create API route folders
[ ] Confirm application runs

16. DEVELOPMENT PRINCIPLES
--------------------------
- Build the simplest working version first.
- Do not train a custom ML model for this school project unless the
  academic requirement specifically requires model training.
- Keep AI API keys on the server.
- Validate uploaded files.
- Handle API failures gracefully.
- Do not present AI output as guaranteed agricultural diagnosis.
- Keep the UI mobile-friendly.
- Store useful diagnosis history for demonstration.
- Use structured AI output instead of parsing free-form text where possible.

17. FUTURE STARTUP VERSION
--------------------------
If this project later becomes a real product, possible improvements include:

- Nigerian field-collected tomato disease dataset
- Expert-verified diagnoses
- Local agricultural knowledge base
- Weather and disease-risk prediction
- Farm monitoring
- WhatsApp integration
- Voice assistant
- Nigerian languages
- Offline/mobile support
- Agronomist marketplace
- Cooperative/farmer organization accounts
- Farm outcome tracking
- Custom proprietary AI model

18. PROJECT SUCCESS CRITERIA
----------------------------
The school project is successful when a user can:

1. Register.
2. Log in.
3. Create a farm.
4. Upload a tomato plant image.
5. Receive a Plant.id result.
6. Have Gemini explain the result.
7. Receive a clear action plan.
8. Save the diagnosis.
9. View the diagnosis later.
10. Ask Gemini a follow-up question.

END OF DOCUMENT
