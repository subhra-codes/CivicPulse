import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../services/firebase";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  LogOut,
  MapPin,
  ShieldAlert,
} from "lucide-react";

function TeamDashboard() {
    const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const userRef = query(
      collection(db, "users"),
      where("uid", "==", currentUser.uid)
    );

    const unsubscribeUser = onSnapshot(
      userRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const userData = {
            id: snapshot.docs[0].id,
            ...snapshot.docs[0].data(),
          };

          setTeam(userData);

          if (userData.teamId) {
            const reportsQuery = query(
              collection(db, "reports"),
              where("assignedTeamId", "==", userData.teamId)
            );

            onSnapshot(
              reportsQuery,
              (reportSnapshot) => {
                const reportData = reportSnapshot.docs.map((doc) => ({
                  id: doc.id,
                  ...doc.data(),
                }));

                setReports(reportData);
                setLoading(false);
              },
              (error) => {
                console.error("Error loading team reports:", error);
                setLoading(false);
              }
            );
          } else {
            setReports([]);
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      },
      (error) => {
        console.error("Error loading team profile:", error);
        setLoading(false);
      }
    );

    return unsubscribeUser;
  });

  return unsubscribeAuth;
}, []);

  const activeReports = reports.filter(
    (report) =>
      report.status === "ASSIGNED" ||
      report.status === "ACCEPTED" ||
      report.status === "IN PROGRESS"
  ).length;

  const completedReports = reports.filter(
    (report) =>
      report.status === "COMPLETED" ||
      report.status === "RESOLVED"
  ).length;

  const criticalReports = reports.filter(
    (report) => Number(report.impactScore || 0) >= 76
  ).length;

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

 const handleLogout = async () => {
  try {
    await signOut(auth);
    navigate("/login");
  } catch (error) {
    console.error("Logout error:", error);
  }
};

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <Link to="/" className="text-xl font-bold">
              Civic<span className="text-emerald-400">Pulse</span>
            </Link>

            <p className="text-xs text-slate-400 mt-1">
              Response Team Dashboard
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition"
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Heading */}
        <div className="mb-8">
          <p className="text-emerald-600 font-semibold text-sm mb-2">
            RESPONSE OPERATIONS
          </p>

          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
            Team Dashboard
          </h1>

          <p className="text-slate-500 mt-2">
            Manage the civic issues assigned to your response team.
          </p>

          {team?.teamId && (
            <p className="text-sm text-slate-400 mt-2">
              Team ID: {team.teamId}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Active Assignments</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {activeReports}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                <Clock3 size={22} />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Critical Issues</p>
                <p className="text-3xl font-bold text-red-600 mt-1">
                  {criticalReports}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-red-50 text-red-600">
                <ShieldAlert size={22} />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Completed</p>
                <p className="text-3xl font-bold text-emerald-600 mt-1">
                  {completedReports}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Reports */}
        <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">
              Assigned Issues
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Issues assigned to this response team.
            </p>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500">
              Loading assignments...
            </div>
          ) : !team?.teamId ? (
            <div className="p-8 text-center">
              <AlertTriangle
                size={30}
                className="mx-auto text-orange-500 mb-3"
              />

              <p className="font-semibold text-slate-800">
                No response team is linked to this account.
              </p>

              <p className="text-sm text-slate-500 mt-1">
                Please contact the CivicPulse administrator.
              </p>
            </div>
          ) : reports.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No issues have been assigned to your team yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {[...reports]
                .sort(
                  (a, b) =>
                    Number(b.impactScore || 0) -
                    Number(a.impactScore || 0)
                )
                .map((report) => {
                  const priority = getPriority(
                    Number(report.impactScore || 0)
                  );

                  return (
                    <div
                      key={report.id}
                      className="p-6 hover:bg-slate-50 transition"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span
                              className={`px-2.5 py-1 rounded-full border text-xs font-semibold ${priority.className}`}
                            >
                              {priority.label}
                            </span>

                            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                              {report.category}
                            </span>

                            <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold">
                              {report.status || "ASSIGNED"}
                            </span>
                          </div>

                          <h3 className="text-lg font-bold text-slate-900">
                            {report.detectedIssue ||
                              report.title ||
                              "Civic Issue"}
                          </h3>

                          <p className="text-sm text-slate-500 mt-1">
                            {report.description}
                          </p>

                          {report.locationLabel && (
                            <p className="inline-flex items-center gap-1 text-xs text-slate-400 mt-3">
                              <MapPin size={13} />
                              {report.locationLabel}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-5">
                          <div className="text-center">
                            <p className="text-xs text-slate-400 uppercase tracking-wide">
                              Impact
                            </p>

                            <p className="text-3xl font-bold text-slate-900">
                              {report.impactScore || 0}
                            </p>

                            <p className="text-xs text-slate-400">
                              / 100
                            </p>
                          </div>

                          <Link
                            to={`/team/report/${report.id}`}
                            className="px-4 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition"
                          >
                            View Task
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default TeamDashboard;