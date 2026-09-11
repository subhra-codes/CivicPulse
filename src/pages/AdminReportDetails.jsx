import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { ArrowLeft, MapPin, ShieldAlert, CheckCircle2 } from "lucide-react";
import { db } from "../services/firebase";

function AdminReportDetails() {
  const { reportId } = useParams();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [assigning, setAssigning] = useState(false);
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
        console.error("Error loading report:", error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [reportId]);

  useEffect(() => {
  const unsubscribe = onSnapshot(
    collection(db, "teams"),
    (snapshot) => {
      const teamData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setTeams(teamData);
    },
    (error) => {
      console.error("Error loading teams:", error);
    }
  );

  return unsubscribe;
}, []);

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
  const suggestedTeam = useMemo(() => {
  if (!report || teams.length === 0) {
    return null;
  }

  return (
    teams.find((team) => team.department === report.category) ||
    teams.find((team) => team.department === "Other") ||
    null
  );
}, [report, teams]);

  useEffect(() => {
   if (report?.assignedTeamId) {
    setSelectedTeamId(report.assignedTeamId);
  } else if (suggestedTeam) {
    setSelectedTeamId(suggestedTeam.id);
  }
}, [report, suggestedTeam]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">Loading report...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            Report not found
          </h1>

          <Link
            to="/admin"
            className="inline-flex items-center gap-2 mt-4 text-emerald-600 font-semibold"
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const score = Number(report.impactScore || 0);
  const priority = getPriority(score);

  const handleAssignTeam = async () => {
  if (!selectedTeamId || !report) {
    return;
  }
  if (report.assignedTeamId) {
  setActionMessage("This report is already assigned to a response team.");
  return;
  }

  setAssigning(true);
  setActionMessage("");

  try {
    const reportRef = doc(db, "reports", report.id);
    const teamRef = doc(db, "teams", selectedTeamId);

    await updateDoc(reportRef, {
    assignedTeamId: selectedTeamId,
    status: "ASSIGNED",
    updatedAt: serverTimestamp(),
   });

   const selectedTeam = teams.find(
  (team) => team.id === selectedTeamId
  );

if (selectedTeam) {
  await updateDoc(teamRef, {
    activeAssignments: Number(selectedTeam.activeAssignments || 0) + 1,
  });
}

    setActionMessage("Report successfully assigned to the response team.");
  } catch (error) {
    console.error("Error assigning team:", error);
    setActionMessage("Unable to assign the response team.");
  } finally {
    setAssigning(false);
  }
};

const handleVerifyResolution = async () => {
  if (!report) {
    return;
  }

  setAssigning(true);
  setActionMessage("");

  try {
    const reportRef = doc(db, "reports", report.id);

    await updateDoc(reportRef, {
      status: "RESOLVED",
      updatedAt: serverTimestamp(),
    });

    setActionMessage("Issue verified and marked as resolved.");
  } catch (error) {
    console.error("Error verifying resolution:", error);
    setActionMessage("Unable to verify the resolution.");
  } finally {
    setAssigning(false);
  }
};

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-slate-950 text-white">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition"
          >
            <ArrowLeft size={18} />
            Back to Admin Dashboard
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Heading */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span
              className={`px-3 py-1 rounded-full border text-sm font-semibold ${priority.className}`}
            >
              {priority.label}
            </span>

            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-sm font-medium">
              {report.category}
            </span>

            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-sm font-semibold">
              {report.status || "REPORTED"}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
            {report.detectedIssue || report.title || "Civic Issue"}
          </h1>

          <p className="text-slate-500 mt-2">
            Detailed AI analysis and response information for this report.
          </p>
        </div>

        {/* Impact Score + AI Analysis */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Impact Score */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold">
              <ShieldAlert size={18} />
              CIVICPULSE IMPACT
            </div>

            <div className="mt-6 text-center">
              <p className="text-6xl font-bold text-slate-900">{score}</p>

              <p className="text-sm text-slate-400 mt-1">out of 100</p>

              <div
                className={`inline-block mt-4 px-4 py-2 rounded-full border font-semibold ${priority.className}`}
              >
                {priority.label} Priority
              </div>
            </div>

            <div className="mt-8 space-y-4">
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
          </div>

          {/* AI Analysis */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-slate-900">
              AI Analysis
            </h2>

            <div className="mt-6 space-y-6">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
                  Detected Issue
                </p>

                <p className="text-slate-800 mt-2 leading-relaxed">
                  {report.detectedIssue || "No AI detection available."}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
                  Recommendation
                </p>

                <p className="text-slate-800 mt-2 leading-relaxed">
                  {report.recommendation ||
                    "No recommendation available."}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
                  Citizen Description
                </p>

                <p className="text-slate-600 mt-2 leading-relaxed">
                  {report.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Location */}
        <section className="mt-6 bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center gap-2">
            <MapPin size={20} className="text-emerald-600" />

            <h2 className="text-xl font-bold text-slate-900">
              Issue Location
            </h2>
          </div>

          <p className="text-slate-500 mt-2">
            {report.locationLabel || "Location captured by citizen"}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${report.latitude},${report.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition"
            >
              <MapPin size={17} />
              Open in Google Maps
            </a>
          </div>

          <div className="mt-4 text-sm text-slate-400">
            Coordinates: {report.latitude}, {report.longitude}
          </div>
        </section>

{/* Response Management */}
<section className="mt-6 bg-white border border-slate-200 rounded-2xl p-6">
  <h2 className="text-xl font-bold text-slate-900">
    Response Management
  </h2>

  <p className="text-sm text-slate-500 mt-1">
    Manage verification, response team assignment, and resolution.
  </p>

  <div className="grid md:grid-cols-2 gap-5 mt-6">

    {/* Current Status */}
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        Current Status
      </label>

      <div className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-semibold">
        {report.status || "REPORTED"}
      </div>
    </div>

    {/* Response Team */}
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        Response Team
      </label>

      <select
        value={selectedTeamId}
        onChange={(e) => setSelectedTeamId(e.target.value)}
        disabled={!!report.assignedTeamId}
        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-emerald-400 disabled:bg-slate-50 disabled:text-slate-500"
      >
        <option value="">Select a response team</option>

        {teams.map((team) => (
          <option key={team.id} value={team.id}>
            {team.name} — {team.department}
          </option>
        ))}
      </select>
    </div>

  </div>

  {/* Suggested Team */}
  {suggestedTeam && !report.assignedTeamId && (
    <p className="text-sm text-emerald-600 mt-4">
      Suggested team: <strong>{suggestedTeam.name}</strong>
    </p>
  )}

  {/* Assign Response Team */}
  {!report.assignedTeamId && report.status !== "RESOLVED" && (
    <div className="mt-6">
      <button
        onClick={handleAssignTeam}
        disabled={!selectedTeamId || assigning}
        className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-semibold transition"
      >
        {assigning ? "Assigning..." : "Assign Response Team"}
      </button>
    </div>
  )}

  {/* Resolution Verification */}
  {report.status === "COMPLETED" && (
    <div className="mt-6 p-5 rounded-2xl bg-emerald-50 border border-emerald-200">

      <div className="flex items-start gap-3">
        <CheckCircle2
          size={22}
          className="text-emerald-600 mt-0.5"
        />

        <div>
          <h3 className="font-bold text-slate-900">
            Work Completed
          </h3>

          <p className="text-sm text-slate-600 mt-1">
            The response team has marked this issue as completed.
            Review the work and verify the resolution.
          </p>
        </div>
      </div>

      <button
        onClick={handleVerifyResolution}
        disabled={assigning}
        className="mt-5 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-semibold transition"
      >
        <CheckCircle2 size={18} />
        {assigning ? "Verifying..." : "Verify & Resolve"}
      </button>

    </div>
  )}

  {/* Resolved Message */}
  {report.status === "RESOLVED" && (
    <div className="mt-6 p-5 rounded-2xl bg-emerald-50 border border-emerald-200">
      <div className="flex items-center gap-3">
        <CheckCircle2
          size={22}
          className="text-emerald-600"
        />

        <div>
          <h3 className="font-bold text-emerald-800">
            Issue Resolved
          </h3>

          <p className="text-sm text-emerald-700 mt-1">
            This issue has been verified and marked as resolved by the authority.
          </p>
        </div>
      </div>
    </div>
  )}

  {/* Action Message */}
  {actionMessage && (
    <div className="mt-4 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">
      {actionMessage}
    </div>
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
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-slate-600">{label}</span>

        <span className="text-sm font-bold text-slate-900">
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

export default AdminReportDetails;