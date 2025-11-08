import React from "react";
import { Routes, Route, Navigate, useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { UserProvider, useUser } from "@/context/UserContext";
import type { JSX } from "react";

// ==========================
// 🟦 AUTHENTIFICATION
// ==========================
import Login from "@/pages/Login";
import Register from "@/pages/Register";

// ==========================
// 🟩 DASHBOARDS
// ==========================
import Dashboard from "@/pages/Dashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import CreerAdmin from "@/pages/CreerAdmin";

// ==========================
// 🧠 MODULE SYNTHÈSE IA
// ==========================
import SyntheseList from "@/pages/synthese/SyntheseIA";
import SyntheseDetail from "@/pages/synthese/SyntheseDetail";
import SyntheseAlertesDetail from "@/pages/synthese/SyntheseAlerteDetail";
import SyntheseAnomalieDetail from "@/pages/synthese/SyntheseAnomalieDetail";
import SyntheseRecommandationDetail from "@/pages/synthese/SyntheseRecommandationDetail";

// ==========================
// 🤖 IA AETHERIS
// ==========================
import Aetheris from "@/pages/aetheris/Aetheris";
import AetherisAnalyse from "@/pages/aetheris/AetherisAnalyse";
import AetherisPredictive from "@/pages/aetheris/AetherisPredictive";
import AetherisMonitoring from "@/pages/aetheris/AetherisMonitoring";
import AetherisReactive from "@/pages/aetheris/AetherisReactive";
import AetherisAdminAnalyse from "@/pages/aetheris/AetherisAdminAnalyse";

import VisualIADashboard from "@/pages/VisualIA/VisualIADashboard";
import VisualIACreate from "@/pages/VisualIA/VisualIACreate";
import VisualIAHistory from "@/pages/VisualIA/VisualIAHistory";
import VisualIADetail from "@/pages/VisualIA/VisualIADetail";
import VisualIASettings from "@/pages/VisualIA/VisualIASettings";

// ==========================
// 🧑‍⚕️ PATIENTS
// ==========================
import Patients from "@/pages/Patients/Patients";
import PatientList from "@/pages/Patients/PatientsList";
import AjouterPatient from "@/pages/Patients/AjouterPatient";
import ModifierPatient from "@/pages/Patients/ModifierPatient";
import PatientDocuments from "@/pages/Patients/PatientDocuments";
import PatientDetailPage from "@/pages/Patients/PatientDetailPage";
import PatientsCritiquesPage from "@/pages/Patient-Critiques/PatientCritiquePages";

// 🧠 PATIENTS CRITIQUES
import DossierPatientCritique from "@/pages/Patient-Critiques/DossierPatientCritique";
import CardiaquePatientCritique from "@/pages/Patient-Critiques/CardiaquePatientCritique";
import PulmonairePatientCritique from "@/pages/Patient-Critiques/PulmonairePatientCritique";
import RenalePatientCritique from "@/pages/Patient-Critiques/RenalePatientCritique";
import NeurologiquePatientCritique from "@/pages/Patient-Critiques/NeurologiquePatientCritique";
import MetaboliquePatientCritique from "@/pages/Patient-Critiques/MetaboliquePatientCritique";

// ==========================
// 📁 DOSSIERS MÉDICAUX
// ==========================
import DossierList from "@/pages/Dossiers/DossierList";
import DossierDetail from "@/pages/Dossiers/DossierDetail";
import AjouterDossier from "@/pages/Dossiers/AjouterDossier";
import ModifierDossier from "@/pages/Dossiers/ModifierDossier";

// ==========================
// 🩺 CONSULTATIONS
// ==========================
import ConsultationsList from "@/pages/Consultations/ConsultationsList";
import ConsultationForm from "@/pages/Consultations/ConsultationForm";
import ConsultationDetail from "@/pages/Consultations/ConsultationDetail";

// ==========================
// 💊 PHARMACIE
// ==========================
import ListePharmacie from "@/pages/Pharmacie/ListePharmacie";
import AjouterPharmacie from "@/pages/Pharmacie/AjouterPharmacie";
import ModifierPharmacie from "@/pages/Pharmacie/ModifierPharmacie";
import PharmacieDetail from "@/pages/Pharmacie/PharmacieDetail";
import PharmacieAlerte from "@/pages/Pharmacie/PharmacieAlertes";

// ==========================
// 🚑 URGENCES & AMBULANCES
// ==========================
import ListeUrgences from "@/pages/Urgences/ListeUrgences";
import AjouterUrgence from "@/pages/Urgences/AjouterUrgence";
import UrgenceDetail from "@/pages/Urgences/UrgenceDetail";
import ModifierUrgence from "@/pages/Urgences/ModifierUrgence";
import UrgencesDashboard from "@/pages/Urgences/UrgencesDashboard";
import AmbulanceList from "@/pages/Ambulances/AmbulanceList";
import AjouterAmbulance from "@/pages/Ambulances/AjouterAmbulance";
import AmbulanceDetail from "@/pages/Ambulances/AmbulanceDetail";
import AmbulanceMap from "@/pages/Ambulances/AmbulanceMap";

// ==========================
// 🧬 BIOLOGIE / LABORATOIRE
// ==========================
import BiologieList from "@/pages/biologie/BiologieList";
import AjouterBiologie from "@/pages/biologie/Ajouterbiologie";
import BiologieDetail from "@/pages/biologie/BiologieDetail";

// ==========================
// 🏥 HOSPITALISATIONS
// ==========================
import ListeHospitalisations from "@/pages/Hospitalisations/ListeHospitalisations";
import AjouterHospitalisation from "@/pages/Hospitalisations/AjouterHospitalisation";
import ModifierHospitalisation from "@/pages/Hospitalisations/ModifierHospitalisation";
import HospitalisationDetail from "@/pages/Hospitalisations/HospitalisationDetail";

// ==========================
// 📅 RENDEZ-VOUS
// ==========================
import RendezVousList from "@/pages/RendezVous/RendezVousList";
import RendezVousDetail from "@/pages/RendezVous/RendezVousDetail";
import AjouterRendezVous from "@/pages/RendezVous/AjouterRendezVous";
import ModifierRendezVous from "@/pages/RendezVous/ModifierRendezVous";

// ==========================
// 👨‍⚕️ RESSOURCES HUMAINES
// ==========================
import RHList from "@/pages/rh/RHList";
import AjouterRH from "@/pages/rh/AjouterRH";
import DetailRH from "@/pages/rh/DetailRH";
import ModifierRH from "@/pages/rh/ModifierRH";
import MedecinsListRH from "@/pages/rh/MedecinsListRH";
import MedecinDetail from "@/pages/rh/MedecinDetail";

// ==========================
// 💰 FINANCE & COMPTABILITÉ
// ==========================
import ListeFactures from "@/pages/Factures/ListeFactures";
import AjouterFacture from "@/pages/Factures/AjouterFacture";
import ModifierFacture from "@/pages/Factures/ModifierFacture";
import FactureDetail from "@/pages/Factures/FactureDetail";
import ListeCompta from "@/pages/Comptabilite/ListeCompta";
import AjouterCompta from "@/pages/Comptabilite/AjouterCompta";
import DetailCompta from "@/pages/Comptabilite/DetailCompta";
import Finance from "@/pages/Finance";

// ==========================
// 🩻 IMAGERIE & RADIOLOGIE
// ==========================
import Listeimagerie from "@/pages/Imagerie/ListeImageries";
import ImagerieDetail from "@/pages/Imagerie/ImagerieDetail";
import AjouterImagerie from "@/pages/Imagerie/AjouterImagerie";
import ModifierImagerie from "@/pages/Imagerie/ModifierImagerie";

import ListeRadiologie from "@/pages/Radiologie/ListeRadiologies";
import RadiologieDetail from "@/pages/Radiologie/RadiologieDetail";
import AjouterRadiologie from "@/pages/Radiologie/AjouterRadiologie";
import ModifierRadiologie from "@/pages/Radiologie/ModifierRadiologie";

// ==========================
// 🏥 BLOC OPÉRATOIRE & SOINS
// ==========================
import ListeBlocOperatoire from "@/pages/BlocOperatoire/ListeBlocOperatoire";
import AjouterBlocOperatoire from "@/pages/BlocOperatoire/AjouterBlocOperatoire";
import ModifierBlocOperatoire from "@/pages/BlocOperatoire/ModifierBlocOperatoire";
import BlocOperatoireDetail from "@/pages/BlocOperatoire/BlocOperatoireDetail";
import AnalyseBloc from "@/pages/BlocOperatoire/AnalyseBloc";
import Bloc from "./pages/bloc";
import ListeSoins from "@/pages/Soins/ListeSoins";
import AjouterSoin from "@/pages/Soins/AjouterSoin";
import ModifierSoin from "@/pages/Soins/ModifierSoin";
import SoinDetail from "@/pages/Soins/SoinDetail";

// ==========================
// 🧠 MODULES MÉDICAUX
// ==========================
import Cardiaque from "@/pages/Cardiaque";
import Neurologique from "@/pages/Neurologique";
import Pulmonaire from "@/pages/Pulmonaire";
import Digestive from "@/pages/Digestive";
import Renale from "@/pages/Renale";
import Metabolique from "@/pages/Metabolique";
import CardiaquePatientPage from "@/pages/Patients/CardiaquePatientPage";
import DigestivePatientPage from "@/pages/Patients/DigestivePatientPage";
import MetaboliquePatientPage from "@/pages/Patients/MetaboliquePatientPage";
import NeurologiquePatientPage from "@/pages/Patients/NeurologiquePatientPage";
import RenalePatientPage from "@/pages/Patients/RenalePatientPage";
// 🫁 Fonction Pulmonaire
import PulmonairePatientPage from "@/pages/Patients/PulmonairePatientPage";

// ==========================
// 🧬 SPÉCIALITÉS MÉDICALES
// ==========================
import SpecialitesList from "@/pages/specialites/SpecialitesList";
import AjouterSpecialite from "@/pages/specialites/AjouterSpecialite";
import ModifierSpecialite from "@/pages/specialites/ModifierSpecialite";
import SpecialiteDetail from "@/pages/specialites/SpecialiteDetail";
import SpecialitesDashboard from "@/pages/specialites/SpecialitesDashboard";

// ==========================
// ⚙️ AUTRES MODULES
// ==========================
import ModulesPage from "@/pages/Modules";
import Users from "@/pages/Users";
import AdminRoute from "@/components/AdminRoute";

// =============================================================
// 🛡️ ROUTES PROTÉGÉES & WRAPPERS
// =============================================================
const ProtectedRoute = ({ element }: { element: JSX.Element }) => {
  const { token } = useUser();
  return token ? element : <Navigate to="/login" replace />;
};

const EditConsultationWrapper: React.FC = () => {
  const { consultationId } = useParams<{ consultationId: string }>();
  return (
    <ConsultationForm
      mode="edit"
      consultationId={consultationId ? Number(consultationId) : undefined}
    />
  );
};

// =============================================================
// ⚡ APP PRINCIPALE
// =============================================================
const App = () => {
  return (
    <UserProvider>
      <Routes>
        {/* 🌐 Auth publique */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 🔐 Layout principal */}
        <Route element={<Layout />}>
          {/* 🟩 Dashboard */}
          <Route index element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />

          {/* 👑 Administration */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/creer" element={<CreerAdmin />} />
          <Route path="/admin/finance" element={<Finance />} />

          <Route
            path="/users"
            element={
              <AdminRoute>
                <Users />
              </AdminRoute>
            }
          />

          {/* 🧠 Synthèse IA */}
          <Route path="/synthese" element={<SyntheseList />} />
          <Route path="/synthese/:patientId" element={<SyntheseDetail />} />
          <Route path="/synthese/alertes" element={<SyntheseAlertesDetail />} />
          <Route path="/synthese/anomalies/:patientId" element={<SyntheseAnomalieDetail />} />
          <Route
            path="/synthese/recommandations/:patientId"
            element={<SyntheseRecommandationDetail />}
          />

          {/* 🤖 IA Aetheris */}
          <Route path="/aetheris" element={<Aetheris />} />
          <Route path="/aetheris/predictive" element={<AetherisPredictive />} />
          <Route path="/aetheris/monitoring" element={<AetherisMonitoring />} />
          <Route path="/aetheris/reactive" element={<AetherisReactive />} />
          <Route path="/aetheris/analyse/:patientId" element={<AetherisAnalyse />} />
          <Route path="/aetheris/analysis" element={<AetherisAdminAnalyse />} />
          <Route path="/aetheris/analysis-or-generate/:patientId" element={<AetherisAnalyse />} />
          <Route path="/aetheris/analysis/:patientId" element={<AetherisAnalyse />} />

          {/* 🧑‍⚕️ Patients */}
          <Route path="/patients" element={<Patients />} />
          <Route path="/patients-liste" element={<PatientList />} />
          <Route path="/ajouter-patient" element={<AjouterPatient />} />
          <Route path="/patients/modifier/:patientId" element={<ModifierPatient />} />
          <Route path="/dossiers/:patientId" element={<PatientDetailPage />} />
          <Route path="/patients/:patientId/cardiaque" element={<CardiaquePatientPage />} />

          <Route path="patients/:patientId/digestive" element={<DigestivePatientPage />} />
          <Route path="patients/:patientId/metabolique" element={<MetaboliquePatientPage />} />
          <Route path="patients/:patientId/neurologique" element={<NeurologiquePatientPage />} />
          <Route path="patients/:patientId/renale" element={<RenalePatientPage />} />

          <Route path="/patients/:patientId/pulmonaire" element={<PulmonairePatientPage />} />

          <Route path="/patients/:patientId/documents" element={<PatientDocuments />} />
          <Route path="/patients-critiques" element={<PatientsCritiquesPage />} />
          <Route path="/patients-critiques/:patientId" element={<DossierPatientCritique />} />
          <Route
            path="/patients-critiques/cardiaque/:patientId"
            element={<CardiaquePatientCritique />}
          />
          <Route
            path="/patients-critiques/pulmonaire/:patientId"
            element={<PulmonairePatientCritique />}
          />
          <Route path="/patients-critiques/renale/:patientId" element={<RenalePatientCritique />} />
          <Route
            path="/patients-critiques/neurologique/:patientId"
            element={<NeurologiquePatientCritique />}
          />
          <Route
            path="/patients-critiques/metabolique/:patientId"
            element={<MetaboliquePatientCritique />}
          />

          {/* === MODULE SPÉCIALITÉS MÉDICALES === */}
          <Route path="/specialites" element={<SpecialitesDashboard />} />
          <Route path="/specialites/liste" element={<SpecialitesList />} />
          <Route path="/specialites/ajouter" element={<AjouterSpecialite />} />
          <Route path="/specialites/modifier/:id" element={<ModifierSpecialite />} />
          <Route path="/specialites/:id" element={<SpecialiteDetail />} />

          <Route path="/ia-visual/dashboard" element={<VisualIADashboard />} />
          <Route path="/ia-visual/nouvelle" element={<VisualIACreate />} />
          <Route path="/ia-visual/historique" element={<VisualIAHistory />} />
          <Route path="/ia-visual/:id" element={<VisualIADetail />} />
          <Route path="/visual-ia/:id" element={<VisualIADetail />} />
          <Route path="/visual-ia/detail/:id" element={<VisualIADetail />} />
          <Route path="/visual-ia/settings" element={<VisualIASettings />} />

          {/* 📁 Dossiers médicaux */}
          <Route path="/dossiers" element={<DossierList />} />
          <Route path="/dossiers/ajouter" element={<AjouterDossier />} />
          <Route path="/dossiers/modifier/:id" element={<ModifierDossier />} />
          <Route path="/dossiers/:id" element={<DossierDetail />} />

          {/* 🩺 Consultations */}
          <Route path="/consultations" element={<ConsultationsList />} />
          <Route path="/consultations/ajouter" element={<ConsultationForm mode="create" />} />
          <Route
            path="/consultations/modifier/:consultationId"
            element={<EditConsultationWrapper />}
          />
          <Route path="/consultations/:consultationId" element={<ConsultationDetail />} />

          {/* 🚨 Urgences */}
          <Route path="/urgences" element={<ListeUrgences />} />
          <Route path="/urgences/ajouter" element={<AjouterUrgence />} />
          <Route path="/urgences/modifier/:id" element={<ModifierUrgence />} />
          <Route path="/urgences/:id" element={<UrgenceDetail />} />
          <Route path="/urgences/dashboard" element={<UrgencesDashboard />} />
          {/* 🚑 Ambulances */}
          <Route path="/ambulances" element={<AmbulanceList />} />
          <Route path="/ambulances/ajouter" element={<AjouterAmbulance />} />
          <Route path="/ambulances/:id" element={<AmbulanceDetail />} />
          <Route path="/ambulances-map" element={<AmbulanceMap />} />

          {/* 🧬 Biologie */}
          <Route path="/biologie" element={<BiologieList />} />
          <Route path="/biologie/ajouter" element={<AjouterBiologie />} />
          <Route path="/biologie/:id" element={<BiologieDetail />} />

          {/* 💉 Soins Infirmiers */}
          <Route path="/soins" element={<ListeSoins />} />
          <Route path="/soins/ajouter" element={<AjouterSoin />} />
          <Route path="/soins/modifier/:id" element={<ModifierSoin />} />
          <Route path="/soins/:id" element={<SoinDetail />} />

          {/* 🏥 Bloc Opératoire */}
          <Route path="/bloc-operatoire" element={<ListeBlocOperatoire />} />
          <Route path="/bloc-operatoire/ajouter" element={<AjouterBlocOperatoire />} />
          <Route path="/bloc-operatoire/modifier/:id" element={<ModifierBlocOperatoire />} />
          <Route path="/bloc-operatoire/:id" element={<BlocOperatoireDetail />} />
          <Route path="/bloc-operatoire/analyse/:blocId" element={<AnalyseBloc />} />
          <Route path="/bloc-operatoire" element={<Bloc />} />
          {/* 💊 Pharmacie */}
          <Route path="/pharmacie" element={<ListePharmacie />} />
          <Route path="/pharmacie/ajouter" element={<AjouterPharmacie />} />
          <Route path="/pharmacie/modifier/:id" element={<ModifierPharmacie />} />
          <Route path="/pharmacie/:id" element={<PharmacieDetail />} />
          <Route path="/pharmacie/alertes" element={<PharmacieAlerte />} />

          {/* 🩻 Imagerie & Radiologie */}
          <Route path="/imageries" element={<Listeimagerie />} />
          <Route path="/imageries/ajouter" element={<AjouterImagerie />} />
          <Route path="/imageries/modifier/:id" element={<ModifierImagerie />} />
          <Route path="/imageries/:id" element={<ImagerieDetail />} />
          <Route path="/radiologie" element={<ListeRadiologie />} />
          <Route path="/radiologie/ajouter" element={<AjouterRadiologie />} />
          <Route path="/radiologie/modifier/:id" element={<ModifierRadiologie />} />
          <Route path="/radiologie/:id" element={<RadiologieDetail />} />

          {/* 🩺 Fonction Cardiaque */}
          <Route path="/cardiaque" element={<Cardiaque />} />
          <Route path="/cardiaque/:patientId" element={<Cardiaque />} />
          <Route path="/pulmonaire/:patientId" element={<Pulmonaire />} />
          <Route path="/renal" element={<Renale />} />
          <Route path="/digestive" element={<Digestive />} />
          <Route path="/digestive/:patientId" element={<Digestive />} />
          <Route path="/neurologique" element={<Neurologique />} />
          <Route path="/neurologique/:patientId" element={<Neurologique />} />
          <Route path="/metabolique" element={<Metabolique />} />
          <Route path="/metabolique/:patientId" element={<Metabolique />} />

          {/* 🏥 Hospitalisations */}
          <Route path="/hospitalisations" element={<ListeHospitalisations />} />
          <Route path="/hospitalisations/ajouter" element={<AjouterHospitalisation />} />
          <Route path="/hospitalisations/modifier/:id" element={<ModifierHospitalisation />} />
          <Route path="/hospitalisations/:id" element={<HospitalisationDetail />} />

          {/* 📅 Rendez-vous */}
          <Route path="/rendezvous" element={<RendezVousList />} />
          <Route path="/rendezvous/ajouter" element={<AjouterRendezVous />} />
          <Route path="/rendezvous/modifier/:id" element={<ModifierRendezVous />} />
          <Route path="/rendezvous/:id" element={<RendezVousDetail />} />

          {/* 👨‍⚕️ RH */}
          <Route path="/rh" element={<RHList />} />
          <Route path="/rh/ajouter" element={<AjouterRH />} />
          <Route path="/rh/:id" element={<DetailRH />} />
          <Route path="/rh/:id/modifier" element={<ModifierRH />} />
          <Route path="/rh/medecins" element={<MedecinsListRH />} />
          <Route path="/rh/medecins/:id" element={<MedecinDetail />} />

          {/* 💰 Factures & Comptabilité */}
          <Route path="/factures" element={<ListeFactures />} />
          <Route path="/factures/nouvelle" element={<AjouterFacture />} />
          <Route path="/factures/modifier/:id" element={<ModifierFacture />} />
          <Route path="/factures/:id" element={<FactureDetail />} />
          {/* 💰 MODULE COMPTABILITÉ */}
          <Route path="/finance" element={<Finance />} />
          <Route path="/comptabilite" element={<ListeCompta />} />
          <Route path="/comptabilite/ajouter" element={<AjouterCompta />} />
          <Route path="/comptabilite/:id" element={<DetailCompta />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </UserProvider>
  );
};

export default App;
