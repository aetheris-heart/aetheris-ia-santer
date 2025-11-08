import React from "react";
import type { AnalyseIA } from "@/types/analyseIA";
import { Card, CardContent } from "@/components/uui";

interface AnalyseIADetailProps {
  analyse: AnalyseIA;
}

const AnalyseIADetail: React.FC<AnalyseIADetailProps> = ({ analyse }) => {
  return (
    <div className="space-y-6">
      {/* Infos Patient */}
      {analyse.patient && (
        <Card className="bg-white/30 dark:bg-gray-800/40 backdrop-blur-xl border border-white/20 shadow-lg">
          <CardContent>
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
              {analyse.patient.prenom} {analyse.patient.nom}
            </h2>
            <p>Âge : {analyse.patient.age ?? "—"} ans</p>
            <p>Sexe : {analyse.patient.sexe ?? "—"}</p>
          </CardContent>
        </Card>
      )}

      {/* Description */}
      <Card className="bg-white/30 dark:bg-gray-800/40 backdrop-blur-xl border border-white/20 shadow-lg">
        <CardContent>
          <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-2">
            📝 Description
          </h3>
          <p className="whitespace-pre-line text-gray-900 dark:text-gray-100">
            {analyse.description}
          </p>
        </CardContent>
      </Card>

      {/* Observations */}
      {analyse.observations && (
        <Card className="bg-white/30 dark:bg-gray-800/40 backdrop-blur-xl border border-white/20 shadow-lg">
          <CardContent>
            <h3 className="text-xl font-semibold text-yellow-600 dark:text-yellow-400 mb-2">
              🔍 Observations
            </h3>
            <p className="whitespace-pre-line text-gray-900 dark:text-gray-100">
              {analyse.observations}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Score & Type */}
      {(analyse.score !== undefined || analyse.type_analyse) && (
        <Card className="bg-white/30 dark:bg-gray-800/40 backdrop-blur-xl border border-white/20 shadow-lg">
          <CardContent className="space-y-2">
            {analyse.score !== undefined && analyse.score !== null && (
              <p className="text-gray-900 dark:text-gray-100">
                📊 Score IA : <span className="font-semibold">{analyse.score}</span>
              </p>
            )}
            {analyse.type_analyse && (
              <p className="text-gray-900 dark:text-gray-100">
                🧬 Type d’analyse : <span className="font-semibold">{analyse.type_analyse}</span>
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      {analyse.disclaimer && (
        <p className="text-xs text-gray-600 dark:text-gray-400 italic">{analyse.disclaimer}</p>
      )}

      {/* Date */}
      <p className="text-sm text-gray-500 dark:text-gray-400">
        ⏰ Analyse créée le {new Date(analyse.created_at).toLocaleString()}
      </p>
    </div>
  );
};

export default AnalyseIADetail;
