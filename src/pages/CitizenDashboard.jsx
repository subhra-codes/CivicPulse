import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  increment,
  onSnapshot,
  query,
  updateDoc,
  where,
  arrayUnion,
} from "firebase/firestore";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileText,
  MapPin,
  Plus,
  ArrowRight,
  LogOut,
} from "lucide-react";
import { auth, db } from "../services/firebase";

export default function CitizenDashboard() {
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState([]);
  const [communityReports, setCommunityReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeReports;
    let unsubscribeCommunityReports;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (!currentUser) {
        setReports([]);
        setLoading(false);
        return;
      }

      const reportsQuery = query(
        collection(db, "reports"),
        where("reporterId", "==", currentUser.uid)
      );
      const communityReportsQuery = collection(db, "reports");

      unsubscribeCommunityReports = onSnapshot(
      communityReportsQuery,
      (snapshot) => {
      const communityData = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter((report) => report.reporterId !== currentUser.uid);

    setCommunityReports(communityData);
  },
  (error) => {
    console.error("Error loading community reports:", error);
  }
);

      unsubscribeReports = onSnapshot(
        reportsQuery,
        (snapshot) => {
          const reportData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setReports(reportData);
          setLoading(false);
        },
        (error) => {
          console.error("Error loading reports:", error);
          setLoading(false);
        }
      );
    });

return () => {
  unsubscribeAuth();

  if (unsubscribeReports) {
    unsubscribeReports();
  }

  if (unsubscribeCommunityReports) {
    unsubscribeCommunityReports();
  }
};
  }, []);

  const activeReports = reports.filter(
    (report) =>
      report.status !== "RESOLVED" &&
      report.status !== "COMPLETED"
  ).length;

  const resolvedReports = reports.filter(
    (report) =>
      report.status === "RESOLVED" ||
      report.status === "COMPLETED"
  ).length;

const getStatusStyle = (status) => {
  switch (status) {
    case "REPORTED":
      return "bg-slate-100 text-slate-700";

    case "VERIFIED":
      return "bg-blue-50 text-blue-700";

    case "ASSIGNED":
      return "bg-purple-50 text-purple-700";

    case "ACCEPTED":
      return "bg-indigo-50 text-indigo-700";

    case "IN PROGRESS":
      return "bg-orange-50 text-orange-700";

    case "COMPLETED":
      return "bg-yellow-50 text-yellow-700";

    case "RESOLVED":
      return "bg-emerald-50 text-emerald-700";

    default:
      return "bg-slate-100 text-slate-700";
  }
};
const getStatusStep = (status) => {
  const steps = [
    "REPORTED",
    "ASSIGNED",
    "ACCEPTED",
    "IN PROGRESS",
    "COMPLETED",
    "RESOLVED",
  ];

  const currentIndex = steps.indexOf(status);

  return currentIndex === -1 ? 0 : currentIndex;
};

  const formatStatus = (status) => {
  switch (status) {
    case "REPORTED":
      return "Reported";

    case "VERIFIED":
      return "Verified";

    case "ASSIGNED":
      return "Assigned";

    case "ACCEPTED":
      return "Accepted";

    case "IN PROGRESS":
      return "In Progress";

    case "COMPLETED":
      return "Completed";

    case "RESOLVED":
      return "Resolved";

    default:
      return "Reported";
  }
};
  
const handleConfirmIssue = async (report) => {
  if (!user) {
    return;
  }

  const alreadyConfirmed = Array.isArray(report.confirmedBy)
    ? report.confirmedBy.includes(user.uid)
    : false;

  if (alreadyConfirmed) {
    return;
  }

  try {
    const reportRef = doc(db, "reports", report.id);

    await updateDoc(reportRef, {
      communityConfirmations: increment(1),
      confirmedBy: arrayUnion(user.uid),
    });
  } catch (error) {
    console.error("Error confirming issue:", error);
  }
};

  const handleLogout = async () => {
    try {
      await auth.signOut();
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <header className="bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold">
            Civic<span className="text-emerald-400">Pulse</span>
          </Link>

          <div className="flex items-center gap-5">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium">
                {user?.displayName || user?.email || "Citizen"}
              </p>
              <p className="text-xs text-slate-400">Citizen</p>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition"
            >
              <LogOut size={17} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Welcome */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-10">
          <div>
            <p className="text-emerald-600 font-semibold text-sm mb-2">
              CITIZEN DASHBOARD
            </p>

            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
              Welcome back 👋
            </h1>

            <p className="text-slate-500 mt-2">
              Help your community become cleaner, safer and more resilient.
            </p>
          </div>

          <Link
            to="/report"
            className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-5 py-3 rounded-xl transition shadow-sm"
          >
            <Plus size={19} />
            Report an Issue
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Reports</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {reports.length}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center">
                <FileText className="text-slate-700" size={21} />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Active Reports</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {activeReports}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center">
                <Clock3 className="text-amber-600" size={21} />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Resolved</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {resolvedReports}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 className="text-emerald-600" size={21} />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Action */}
        <div className="bg-slate-950 rounded-2xl p-7 md:p-8 mb-10 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="text-emerald-400" size={21} />

                <span className="text-emerald-400 font-semibold text-sm">
                  MAKE AN IMPACT
                </span>
              </div>

              <h2 className="text-2xl font-bold">
                Spotted a local problem?
              </h2>

              <p className="text-slate-400 mt-2 max-w-xl">
                Report waste, water issues, blocked drains, damaged roads or
                other civic problems. CivicPulse will help prioritize the
                issue.
              </p>
            </div>

            <Link
              to="/report"
              className="shrink-0 inline-flex items-center gap-2 bg-white text-slate-900 hover:bg-slate-100 font-semibold px-5 py-3 rounded-xl transition"
            >
              Report Now
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        {/* Reports */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                My Reports
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Track the issues you've reported.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
              <p className="text-slate-500">Loading your reports...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                <MapPin className="text-emerald-600" size={25} />
              </div>

              <h3 className="font-semibold text-slate-900 text-lg">
                No reports yet
              </h3>

              <p className="text-slate-500 text-sm mt-2 mb-5">
                Be the first to report a local issue in your community.
              </p>

              <Link
                to="/report"
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-5 py-3 rounded-xl transition"
              >
                <Plus size={18} />
                Report an Issue
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                          {report.category || "Civic Issue"}
                        </span>

                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusStyle(
                            report.status
                          )}`}
                        >
                          {formatStatus(report.status)}
                        </span>
                      </div>

                      <h3 className="font-semibold text-slate-900">
                        {report.title ||
                          report.detectedIssue ||
                          "Community Issue"}
                      </h3>

                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                        {report.description || "No description available."}
                      </p>
                      {/* Status Progress */}
                      <div className="mt-5">
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span>Reported</span>
                      <span>Resolved</span>
                      </div>

                     <div className="flex items-center gap-1">
                    {[
                       "REPORTED",
                       "ASSIGNED",
                       "ACCEPTED",
                       "IN PROGRESS",
                       "COMPLETED",
                       "RESOLVED",
                      ].map((step, index) => {
                      const currentStep = getStatusStep(report.status);

                      const completed = index <= currentStep;

                      return (
                      <div
                     key={step}
                      className="flex-1 flex items-center"
                      >
                    <div
                     className={`h-2 w-full rounded-full ${
                    completed
                ? "bg-emerald-500"
                : "bg-slate-200"
                }`}
               />
              </div>
              );
              })}
            </div>

             <p className="text-xs text-slate-500 mt-2">
             Current stage:{" "}
             <span className="font-semibold text-slate-700">
            {formatStatus(report.status)}
            </span>
            </p>
            </div>

            {/* Community Intelligence */}
              <div className="flex flex-wrap items-center gap-4 mt-4">
               <div className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200">
                 <span className="text-xs text-slate-400">
                 Impact Score
                </span>

                <p className="text-sm font-bold text-slate-900">
                 {Number(report.impactScore || 0)}/100
                </p>
               </div>

              <div className="px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200">
              <span className="text-xs text-emerald-600">
              Community Confirmations
              </span>

             <p className="text-sm font-bold text-emerald-700">
             {Number(report.communityConfirmations || 0)}
             </p>
            </div>
            </div>
                    </div>

                    <div className="flex flex-col items-start md:items-end gap-3">

                     {/* Location */}
                     <div className="flex items-center gap-2 text-sm text-slate-500">
                     <MapPin size={16} />
                     {report.locationLabel || "Location recorded"}
                    </div>

                </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        {/* Community Reports */}
        <section className="mt-10">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-900">
              Community Reports
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              See civic issues reported by other members of your community.
            </p>
          </div>

          {communityReports.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-10 text-center">
              <h3 className="font-semibold text-slate-900 text-lg">
                No community reports yet
              </h3>

              <p className="text-slate-500 text-sm mt-2">
                Other reported issues will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {communityReports.map((report) => (
                <div
                  key={report.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                    {/* Issue Information */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">

                        <span className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                          {report.category || "Civic Issue"}
                        </span>

                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusStyle(
                            report.status
                          )}`}
                        >
                          {formatStatus(report.status)}
                        </span>

                      </div>

                      <h3 className="font-semibold text-slate-900">
                        {report.detectedIssue ||
                          report.title ||
                          "Community Issue"}
                      </h3>

                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                        {report.description ||
                          "No description available."}
                      </p>

                      <div className="flex items-center gap-2 text-sm text-slate-500 mt-3">
                        <MapPin size={15} />
                        {report.locationLabel || "Location recorded"}
                      </div>
                    </div>

                    {/* Community Information */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">

                      <div className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-xs text-slate-400">
                          Impact Score
                        </span>

                        <p className="text-lg font-bold text-slate-900">
                          {Number(report.impactScore || 0)}/100
                        </p>
                      </div>

                      <div className="px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200">
                        <span className="text-xs text-emerald-600">
                          Confirmations
                        </span>

                        <p className="text-lg font-bold text-emerald-700">
                          {Number(
                            report.communityConfirmations || 0
                          )}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleConfirmIssue(report)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition"
                      >
                        ✓ Confirm Issue
                      </button>

                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
