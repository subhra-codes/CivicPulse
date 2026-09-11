import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, db } from "../services/firebase";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  LogOut,
  MapPin,
  ShieldAlert,
} from "lucide-react";

function AdminDashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const reportsQuery = query(
      collection(db, "reports"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
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

    return unsubscribe;
  }, []);

  const totalReports = reports.length;

  const criticalReports = reports.filter(
    (report) => Number(report.impactScore) >= 76
  ).length;

  const highReports = reports.filter(
    (report) =>
      Number(report.impactScore) >= 56 &&
      Number(report.impactScore) <= 75
  ).length;

  const resolvedReports = reports.filter(
    (report) => report.status === "RESOLVED"
  ).length;

  const calculateHotspots = (reports) => {
  const validReports = reports.filter(
    (report) =>
      typeof report.latitude === "number" &&
      typeof report.longitude === "number"
  );

  const hotspots = [];
  const visited = new Set();

  const toRadians = (degrees) => (degrees * Math.PI) / 180;

  const getDistanceInMeters = (lat1, lon1, lat2, lon2) => {
    const earthRadius = 6371000;

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadius * c;
  };

  validReports.forEach((report, index) => {
    if (visited.has(report.id)) {
      return;
    }

    const nearbyReports = validReports.filter((otherReport) => {
      if (report.id === otherReport.id) {
        return true;
      }

      return (
        getDistanceInMeters(
          report.latitude,
          report.longitude,
          otherReport.latitude,
          otherReport.longitude
        ) <= 500
      );
    });

    if (nearbyReports.length >= 2) {
      nearbyReports.forEach((nearbyReport) => {
        visited.add(nearbyReport.id);
      });

      const centerLatitude =
        nearbyReports.reduce(
          (sum, item) => sum + item.latitude,
          0
        ) / nearbyReports.length;

      const centerLongitude =
        nearbyReports.reduce(
          (sum, item) => sum + item.longitude,
          0
        ) / nearbyReports.length;

      const highestImpact = Math.max(
        ...nearbyReports.map((item) =>
          Number(item.impactScore || 0)
        )
      );
      const totalConfirmations = nearbyReports.reduce(
      (total, item) =>
       total + Number(item.communityConfirmations || 0),
       0
      );

const hotspotScore = Math.min(
  100,
  Math.round(
    highestImpact * 0.6 +
      Math.min(nearbyReports.length * 5, 20) +
      Math.min(totalConfirmations * 5, 20)
  )
);

      hotspots.push({
        id: `hotspot-${index}`,
        latitude: centerLatitude,
        longitude: centerLongitude,
        reportCount: nearbyReports.length,
        highestImpact,
        reports: nearbyReports,
        hotspotScore,
        totalConfirmations,
      });
    }
  });

  return hotspots;
};

  const getPriorityLabel = (score) => {
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

  const getStatusClass = (status) => {
    switch (status) {
      case "RESOLVED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "IN PROGRESS":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "ASSIGNED":
        return "bg-purple-50 text-purple-700 border-purple-200";

      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp?.toDate) {
      return "Recently";
    }

    return timestamp.toDate().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleLogout = async () => {
    await signOut(auth);
  };
  const hotspots = calculateHotspots(reports);
  const getCommunitySignal = (report) => {
  const confirmations = Number(
    report.communityConfirmations || 0
  );

  if (confirmations >= 5) {
    return "Strong";
  }

  if (confirmations >= 2) {
    return "Moderate";
  }

  return "Low";
};
const getPriorityScore = (report) => {
  const impact = Number(report.impactScore || 0);

  const confirmations = Number(
    report.communityConfirmations || 0
  );

  const communityBoost = Math.min(
    confirmations * 2,
    10
  );

  return Math.min(
    100,
    impact + communityBoost
  );
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
              Authority Dashboard
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
            CIVICPULSE ADMIN
          </p>

          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
            Community Intelligence Dashboard
          </h1>

          <p className="text-slate-500 mt-2">
            Monitor reported civic issues and prioritize the problems that
            need attention first.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Issues</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {totalReports}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-100 text-slate-700">
                <AlertTriangle size={22} />
              </div>
            </div>
          </div>

          {/* Critical */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Critical</p>
                <p className="text-3xl font-bold text-red-600 mt-1">
                  {criticalReports}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-red-50 text-red-600">
                <ShieldAlert size={22} />
              </div>
            </div>
          </div>

          {/* High */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">High Priority</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">
                  {highReports}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-orange-50 text-orange-600">
                <Clock3 size={22} />
              </div>
            </div>
          </div>

          {/* Resolved */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Resolved</p>
                <p className="text-3xl font-bold text-emerald-600 mt-1">
                  {resolvedReports}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={22} />
              </div>
            </div>
          </div>
        </div>
        {/* Hotspot Summary */}
<section className="bg-white border border-slate-200 rounded-2xl p-6 mb-6">
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

    <div>
      <div className="flex items-center gap-2">
        <span className="text-2xl">🔥</span>

        <h2 className="text-lg font-bold text-slate-900">
          Civic Hotspots Detected
        </h2>
      </div>

      <p className="text-sm text-slate-500 mt-1">
        Areas where multiple civic reports are clustered within 500 meters.
      </p>
    </div>

    <div className="flex items-center gap-4">

      {/* Hotspot Count */}
      <div className="text-center px-6 py-3 rounded-xl bg-red-50 border border-red-100">
        <p className="text-3xl font-bold text-red-600">
          {hotspots.length}
        </p>

        <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">
          Active Hotspots
        </p>
      </div>

      {/* Clustered Reports */}
      <div className="text-center px-6 py-3 rounded-xl bg-slate-50 border border-slate-200">
        <p className="text-3xl font-bold text-slate-900">
          {hotspots.reduce(
            (total, hotspot) => total + hotspot.reportCount,
            0
          )}
        </p>

        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Clustered Reports
        </p>
      </div>

    </div>
  </div>
</section>



        {/* CivicPulse Map */}
        <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden mb-6">
        <div className="px-6 py-5 border-b border-slate-200">
        <h2 className="text-lg font-bold text-slate-900">
         CivicPulse Issue Map
        </h2>

         <p className="text-sm text-slate-500 mt-1">
         View reported civic issues by location.
        </p>
        </div>

        <div className="h-[450px] relative">
        <MapContainer
        center={[12.02069, 79.85532]}
        zoom={13}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {reports
        .filter(
          (report) =>
            typeof report.latitude === "number" &&
            typeof report.longitude === "number"
        )
        .map((report) => (
          <CircleMarker
            key={report.id}
            center={[report.latitude, report.longitude]}
            radius={9}
            pathOptions={{
              fillColor: "#10b981",
              color: "#ffffff",
              weight: 2,
              fillOpacity: 0.9,
            }}
          >
            <Popup>
              <div className="text-sm">
                <strong>
                  {report.detectedIssue ||
                    report.title ||
                    "Civic Issue"}
                </strong>

                <br />

                <span>
                  Category: {report.category}
                </span>

                <br />

                <span>
                  Impact: {Number(report.impactScore || 0)}/100
                </span>

                <br />

                <span>
                  Status: {report.status || "REPORTED"}
                </span>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* Hotspot Markers */}
        {hotspots.map((hotspot) => (
          <CircleMarker
            key={hotspot.id}
            center={[hotspot.latitude, hotspot.longitude]}
            radius={20}
            pathOptions={{
        fillColor:
            hotspot.hotspotScore >= 76
             ? "#ef4444"
             : hotspot.hotspotScore >= 56
             ? "#f97316"
             : hotspot.hotspotScore >= 31
             ? "#eab308"
             : "#22c55e",

        color:
           hotspot.hotspotScore >= 76
           ? "#b91c1c"
           : hotspot.hotspotScore >= 56
           ? "#c2410c"
           : hotspot.hotspotScore >= 31
           ? "#a16207"
           : "#15803d",

        weight: 3,
        fillOpacity: 0.25,
        }}
          >
          <Popup>
            <div className="text-sm">
             <strong>🔥 Civic Hotspot</strong>

         <br />

        <span>
        {hotspot.reportCount} nearby reports
        </span>

        <br />

        <span>
        Community Confirmations: {hotspot.totalConfirmations}
        </span>

        <br />

        <span>
         Highest Impact: {hotspot.highestImpact}/100
        </span>

        <br />

    <span>
    Hotspot Score:{" "}
    <strong>{hotspot.hotspotScore}/100</strong>
    </span>

    <br />

     <span>
     Priority:{" "}
     <strong>
    {hotspot.hotspotScore >= 76
      ? "CRITICAL"
      : hotspot.hotspotScore >= 56
      ? "HIGH"
      : hotspot.hotspotScore >= 31
      ? "MODERATE"
      : "LOW"}
  </strong>
</span>

         <br />

        <span>
        Radius: 500 meters
        </span>
        </div>
        </Popup>
          </CircleMarker>
        ))}
     </MapContainer>

    {/* Hotspot Legend */}
         <div className="absolute bottom-4 left-4 z-[1000] bg-white rounded-xl shadow-lg border border-slate-200 p-4">
          <p className="text-sm font-bold text-slate-900 mb-3">
            🔥 Hotspot Priority
          </p>

          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span className="text-slate-600">
                Critical — 76–100
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-500"></span>
              <span className="text-slate-600">
                High — 56–75
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
              <span className="text-slate-600">
                Moderate — 31–55
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              <span className="text-slate-600">
                Low — 0–30
              </span>
            </div>
          </div>
        </div>
     </div>
     </section>

        {/* Priority Issues */}
        <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">
              Priority Issues
            </h2>

            <p className="text-sm text-slate-500 mt-1">
               Reports are ranked using AI impact and community validation.
            </p>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500">
              Loading reports...
            </div>
          ) : reports.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No reports have been submitted yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {[...reports]
                .sort(
                   (a, b) =>
                    getPriorityScore(b) -
                    getPriorityScore(a)
                )
                .map((report) => {
                  const priority = getPriorityLabel(
                    Number(report.impactScore || 0)
                  );
                  const communitySignal = getCommunitySignal(report);
                  const priorityScore = getPriorityScore(report);

                  return (
                    <div
                      key={report.id}
                      className="p-6 hover:bg-slate-50 transition"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                        {/* Issue */}
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

                            <span
                              className={`px-2.5 py-1 rounded-full border text-xs font-semibold ${getStatusClass(
                                report.status
                              )}`}
                            >
                              {report.status || "REPORTED"}
                            </span>
                            <span
                             className={`px-2.5 py-1 rounded-full border text-xs font-semibold ${
                              communitySignal === "Strong"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : communitySignal === "Moderate"
                              ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                              : "bg-slate-50 text-slate-600 border-slate-200"
                           }`}
                    >
                      Community: {communitySignal}
                      </span>
                          </div>

                          <h3 className="font-bold text-slate-900 text-lg">
                            {report.detectedIssue ||
                              report.title ||
                              "Civic Issue"}
                          </h3>

                          <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                            {report.description}
                          </p>

                          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-400">
                            <span>
                              Reported {formatDate(report.createdAt)}
                            </span>

                            {report.locationLabel && (
                              <span className="inline-flex items-center gap-1">
                                <MapPin size={13} />
                                {report.locationLabel}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Score */}
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <p className="text-xs text-slate-400 uppercase tracking-wide">
                              Impact
                            </p>

                           <p className="text-3xl font-bold text-slate-900">
                             {priorityScore}
                            </p>

                        <p className="text-xs text-slate-400">
                           Priority / 100
                        </p>

                        <p className="text-xs text-slate-400 mt-1">
                           AI Impact: {Number(report.impactScore || 0)}/100
                        </p>
                          </div>

                          <Link
                            to={`/admin/report/${report.id}`}
                            className="px-4 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition"
                          >
                            View Details
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

export default AdminDashboard;