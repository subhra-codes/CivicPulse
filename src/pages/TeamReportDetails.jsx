import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../services/firebase";
import {
  ArrowLeft,
  MapPin,
  ShieldAlert,
  CheckCircle2,
  Clock3,
} from "lucide-react";

function TeamReportDetails() {
  const { reportId } = useParams();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    if (!reportId) {
      setLoading(false);
      return;
    }

    const reportRef = doc(db, "reports", reportId);

    const unsubscribe = onSnapshot(
      reportRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setReport({
            id: snapshot.id,
            ...snapshot.data(),
          });
        } else {
          setReport(null);
        }

        setLoading(false);
      },
      (error) => {
        console.error("Error loading team task:", error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [reportId]);

  const getPriority = (score) => {
    if (score >= 76) {
      return {
        label: "Critical",
        className: "bg-red-50 text-red-700 border-red-200",
      };
    }

    if (score >= 56) {
      return {
        label: "High",
        className: "bg-orange-50 text-orange-700 border-orange-200",
      };
    }

    if (score >= 31) {
      return {
        label: "Moderate",
        className: "bg-yellow-50 text-yellow-700 border-yellow-200",
      };
    }

    return {
      label: "Low",
      className: "bg-slate-50 text-slate-600 border-slate-200",
    };
  };

  const handleAcceptAssignment = async () => {
  if (!report) {
    return;
  }

  setUpdating(true);
  setActionMessage("");

  try {
    const reportRef = doc(db, "reports", report.id);

    await updateDoc(reportRef, {
      status: "ACCEPTED",
      updatedAt: serverTimestamp(),
    });

    setActionMessage("Assignment accepted successfully.");
  } catch (error) {
    console.error("Error accepting assignment:", error);
    setActionMessage("Unable to accept the assignment.");
  } finally {
    setUpdating(false);
  }
};

  const handleStartWork = async () => {
  if (!report) {
    return;
  }

  setUpdating(true);
  setActionMessage("");

  try {
    const reportRef = doc(db, "reports", report.id);

    await updateDoc(reportRef, {
      status: "IN PROGRESS",
      updatedAt: serverTimestamp(),
    });

    setActionMessage("Work has been started successfully.");
  } catch (error) {
    console.error("Error starting work:", error);
    setActionMessage("Unable to start work.");
  } finally {
    setUpdating(false);
  }
};
const handleCompleteWork = async () => {
  if (!report) {
    return;
  }

  setUpdating(true);
  setActionMessage("");

  try {
    const reportRef = doc(db, "reports", report.id);

    await updateDoc(reportRef, {
      status: "COMPLETED",
      updatedAt: serverTimestamp(),
    });

    setActionMessage("Work has been completed successfully.");
  } catch (error) {
    console.error("Error completing work:", error);
    setActionMessage("Unable to complete the work.");
  } finally {
    setUpdating(false);
  }
};

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">Loading task...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            Task not found
          </h1>

          <Link
            to="/team"
            className="inline-flex items-center gap-2 mt-4 text-emerald-600 font-semibold"
          >
            <ArrowLeft size={17} />
            Back to Team Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const score = Number(report.impactScore || 0);
  const priority = getPriority(score);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-slate-950 text-white">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Link
            to="/team"
            className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition"
          >
            <ArrowLeft size={18} />
            Back to Team Dashboard
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Heading */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span
              className={`px-3 py-1.5 rounded-full border text-sm font-semibold ${priority.className}`}
            >
              {priority.label}
            </span>

            <span className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-sm font-medium">
              {report.category}
            </span>

            <span className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-sm font-semibold">
              {report.status || "ASSIGNED"}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
            {report.detectedIssue ||
              report.title ||
              "Civic Issue"}
          </h1>

          <p className="text-slate-500 mt-2">
            Response task details and AI analysis.
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Impact */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6">
            <div className="flex items-center gap-2 text-slate-500">
              <ShieldAlert size={18} />
              <span className="text-sm font-semibold uppercase tracking-wide">
                CivicPulse Impact
              </span>
            </div>

            <div className="text-center mt-6">
              <p className="text-6xl font-bold text-slate-900">
                {score}
              </p>

              <p className="text-slate-400 mt-1">
                out of 100
              </p>

              <span
                className={`inline-flex mt-5 px-4 py-2 rounded-full border font-semibold ${priority.className}`}
              >
                {priority.label} Priority
              </span>
            </div>

            {/* Scores */}
            <div className="space-y-5 mt-8">
              <ScoreRow
                label="Severity"
                value={report.severity}
              />

              <ScoreRow
                label="Environmental Risk"
                value={report.environmentalRisk}
              />

              <ScoreRow
                label="Health Risk"
                value={report.healthRisk}
              />

              <ScoreRow
                label="Community Impact"
                value={report.communityImpact}
              />
            </div>
          </section>

          {/* AI Analysis */}
          <section className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-bold text-slate-900">
              AI Analysis
            </h2>

            <div className="mt-6">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Detected Issue
              </p>

              <p className="text-slate-800 mt-2 leading-relaxed">
                {report.detectedIssue || "No AI analysis available."}
              </p>
            </div>

            <div className="mt-7">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Recommendation
              </p>

              <p className="text-slate-800 mt-2 leading-relaxed">
                {report.recommendation ||
                  "No recommendation available."}
              </p>
            </div>

            <div className="mt-7">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Citizen Description
              </p>

              <p className="text-slate-600 mt-2 leading-relaxed">
                {report.description}
              </p>
            </div>
          </section>
        </div>

        {/* Location */}
        <section className="mt-6 bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Issue Location
              </h2>

              <div className="flex items-center gap-2 text-slate-500 mt-2">
                <MapPin size={17} />
                <span>
                  {report.locationLabel ||
                    `${report.latitude}, ${report.longitude}`}
                </span>
              </div>
            </div>

            {report.latitude && report.longitude && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${report.latitude},${report.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition"
              >
                <MapPin size={17} />
                Open in Google Maps
              </a>
            )}
          </div>
        </section>

        {/* Current Task Status */}
        <section className="mt-6 bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <Clock3 className="text-blue-600" size={22} />

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Task Status
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Current response status
              </p>
            </div>
          </div>

          <div className="mt-5 px-5 py-4 rounded-xl bg-blue-50 border border-blue-200">
            <p className="text-blue-700 font-bold">
              {report.status || "ASSIGNED"}
            </p>
          </div>
          {actionMessage && (
             <div className="mt-4 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">
               {actionMessage}
            </div>
           )}

         {report.status === "ASSIGNED" && (
           <button
             onClick={handleAcceptAssignment}
             disabled={updating}
             className="mt-5 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-semibold transition"
        >
            <CheckCircle2 size={18} />
            {updating ? "Accepting..." : "Accept Assignment"}
            </button>
       )}
       {report.status === "ACCEPTED" && (
         <button
           onClick={handleStartWork}
           disabled={updating}
           className="mt-5 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold transition"
         >
           <Clock3 size={18} />
           {updating ? "Starting..." : "Start Work"}
           </button>
        )}
        {report.status === "IN PROGRESS" && (
          <button
            onClick={handleCompleteWork}
            disabled={updating}
            className="mt-5 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-semibold transition"
          >
            <CheckCircle2 size={18} />
            {updating ? "Completing..." : "Complete Work"}
        </button>
       )}
        </section>
      </main>
    </div>
  );
}

function ScoreRow({ label, value }) {
  const score = Number(value || 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-slate-600">
          {label}
        </span>

        <span className="text-sm font-bold text-slate-800">
          {score}/10
        </span>
      </div>

      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full"
          style={{ width: `${score * 10}%` }}
        />
      </div>
    </div>
  );
}

export default TeamReportDetails;