import { Link, useNavigate } from "react-router-dom";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  MapPin,
  Send,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { auth, db } from "../services/firebase";
const AI_API_URL =
  import.meta.env.VITE_AI_API_URL || "http://localhost:5000";

const categories = [
  "Waste",
  "Water",
  "Drainage & Flooding",
  "Infrastructure",
  "Environment",
  "Other",
];

export default function ReportIssue() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [locationLabel, setLocationLabel] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const [locationLoading, setLocationLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Check logged-in user
  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    setUser(currentUser);
  });

  return unsubscribe;
}, []);

  const getLocation = () => {
    setError("");

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    
    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setLatitude(lat.toString());
        setLongitude(lng.toString());

        setLocationLabel(
          `Location captured (${lat.toFixed(5)}, ${lng.toFixed(5)})`
        );

        setLocationLoading(false);
      },
      (err) => {
        console.error(err);
        setError(
          "Unable to access your location. Please allow location access and try again."
        );
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  setError("");

  if (!user) {
    setError("You must be logged in to submit a report.");
    return;
  }

  if (!category) {
    setError("Please select an issue category.");
    return;
  }

  if (!latitude || !longitude) {
    setError("Please capture your location before submitting.");
    return;
  }

  if (description.trim().length < 10) {
    setError("Please provide a little more detail about the issue.");
    return;
  }

  setSubmitting(true);

  try {
    // 1. Send the report details to CivicPulse AI
    const aiResponse = await fetch(`${AI_API_URL}/api/analyze-report`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        category,
        description: description.trim(),
      }),
    });

    if (!aiResponse.ok) {
      throw new Error("AI analysis request failed.");
    }

    const aiData = await aiResponse.json();
    console.log("CivicPulse AI Response:", aiData);

    if (!aiData.success || !aiData.analysis) {
      throw new Error("AI analysis failed.");
    }

    const analysis = aiData.analysis;

    // 2. Calculate the transparent CivicPulse Impact Score
    const impactScore = Math.round(
      (analysis.severity * 0.30 +
        analysis.environmentalRisk * 0.25 +
        analysis.healthRisk * 0.25 +
        analysis.communityImpact * 0.20) *
        10
    );

    // 3. Save the report + AI analysis to Firestore
    await addDoc(collection(db, "reports"), {
      reporterId: user.uid,
      reporterEmail: user.email,

      title: category,
      description: description.trim(),

      category: analysis.category || category,

      latitude: Number(latitude),
      longitude: Number(longitude),
      locationLabel,
      googleMapsUrl: `https://www.google.com/maps?q=${latitude},${longitude}`,

      status: "REPORTED",

      // AI analysis
      severity: Number(analysis.severity),
      environmentalRisk: Number(analysis.environmentalRisk),
      healthRisk: Number(analysis.healthRisk),
      communityImpact: Number(analysis.communityImpact),

      // CivicPulse calculated score
      impactScore,

      communityConfirmations: 0,

      detectedIssue: analysis.detectedIssue,
      recommendation: analysis.recommendation,

      assignedTeamId: null,

      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    navigate("/citizen");
  } catch (err) {
    console.error("Error submitting report:", err);

    setError(
      "Unable to analyze or submit your report. Please make sure the CivicPulse AI server is running and try again."
    );
  } finally {
    setSubmitting(false);
  }
};
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-slate-950 text-white">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link
            to="/citizen"
            className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Heading */}
        <div className="mb-8">
          <p className="text-emerald-600 font-semibold text-sm mb-2">
            CIVICPULSE REPORT
          </p>

          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
            Report an Issue
          </h1>

          <p className="text-slate-500 mt-2 max-w-2xl">
            Tell us about a local civic or environmental problem. Your report
            will be analyzed and prioritized to help your community respond
            faster.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8">
          {error && (
            <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              <AlertTriangle size={18} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-7">
            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                What type of issue is this?
              </label>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {categories.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCategory(item)}
                    className={`p-4 rounded-xl border text-left transition ${
                      category === item
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 hover:border-slate-300 text-slate-700"
                    }`}
                  >
                    <span className="font-medium text-sm">{item}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Describe the issue
              </label>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Example: A large amount of garbage has been dumped near the school entrance. It has been there for several days and is attracting insects."
                rows={6}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none resize-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
              />

              <p className="text-xs text-slate-400 mt-2">
                Provide specific details. This will help CivicPulse analyze the
                issue more accurately.
              </p>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">
                Issue Location
              </label>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={getLocation}
                  disabled={locationLoading}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-semibold transition"
                >
                  {locationLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Getting Location...
                    </>
                  ) : (
                    <>
                      <MapPin size={18} />
                      Capture My Location
                    </>
                  )}
                </button>
                
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200">
                 <div className="text-sm text-slate-500">
                   {locationLabel || "No location captured yet"}
                </div>

                {latitude && longitude && (
                  <a
                     href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 whitespace-nowrap"
                >
                     <MapPin size={16} />
                     Open in Google Maps
                    </a>
                )}
             </div>

              </div>

              {latitude && longitude && (
                <p className="text-xs text-emerald-600 mt-2">
                  ✓ GPS coordinates captured successfully.
                </p>
              )}
            </div>

            {/* Submit */}
            <div className="pt-2 border-t border-slate-100">
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-semibold px-7 py-3.5 rounded-xl transition"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Submitting Report...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Submit Report
                  </>
                )}
              </button>

              <p className="text-xs text-slate-400 mt-3">
                Your report will be saved securely to CivicPulse.
              </p>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}