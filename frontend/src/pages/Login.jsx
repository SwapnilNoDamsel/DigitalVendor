
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

export default function Login() {
  const [form, setForm] = useState({
    mobile: "",
    password: ""
  });

  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const nav = useNavigate();

  // Load previously saved mobile number
  useEffect(() => {
    const savedMobile = localStorage.getItem(
      "digitalvendor_saved_mobile"
    );

    const savedRemember = localStorage.getItem(
      "digitalvendor_remember_me"
    );

    // Accept only numbers, never email addresses
    if (
      savedMobile &&
      /^\d{10,15}$/.test(savedMobile) &&
      savedRemember === "true"
    ) {
      setForm((previous) => ({
        ...previous,
        mobile: savedMobile
      }));

      setRememberMe(true);
    } else {
      localStorage.removeItem("digitalvendor_saved_mobile");
      localStorage.removeItem("digitalvendor_remember_me");
    }
  }, []);

  const submit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      // Remove previous vendor session
      localStorage.removeItem("digitalvendor_token");

      const r = await api.post("/vendors/login", {
        mobile: form.mobile,
        password: form.password,
        rememberMe
      });

      // Save newly authenticated vendor token
      localStorage.setItem(
        "digitalvendor_token",
        r.data.token
      );

      // Remember mobile number only if selected
      if (rememberMe) {
        localStorage.setItem(
          "digitalvendor_saved_mobile",
          form.mobile
        );

        localStorage.setItem(
          "digitalvendor_remember_me",
          "true"
        );
      } else {
        localStorage.removeItem(
          "digitalvendor_saved_mobile"
        );

        localStorage.removeItem(
          "digitalvendor_remember_me"
        );
      }

      nav("/dashboard");

    } catch (e) {
      localStorage.removeItem("digitalvendor_token");

      setError(
        e.response?.data?.message || "Login failed"
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card">

        <div className="text-center mb-4">
          <div className="brand fs-3">
            Digital<span>Vendor</span>
          </div>

          <p className="text-secondary">
            Vendor Login
          </p>
        </div>

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        <form onSubmit={submit} autoComplete="on">

          <label htmlFor="mobile">
            Mobile Number
          </label>

          <input
            id="mobile"
            type="tel"
            name="mobile"
            className="form-control mb-3"
            placeholder="Enter mobile number"
            inputMode="numeric"
            autoComplete="tel"
            pattern="[0-9]{10,15}"
            maxLength="15"
            value={form.mobile}
            onChange={(e) =>
              setForm({
                ...form,
                mobile: e.target.value.replace(/\D/g, "")
              })
            }
            required
          />

          <label htmlFor="password">
            Password
          </label>

          <input
            id="password"
            type="password"
            name="password"
            className="form-control mb-2"
            placeholder="Enter password"
            autoComplete="current-password"
            value={form.password}
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value
              })
            }
            required
          />

          <div className="form-check mb-4">
            <input
              type="checkbox"
              className="form-check-input"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) =>
                setRememberMe(e.target.checked)
              }
            />

            <label
              className="form-check-label"
              htmlFor="rememberMe"
            >
              Remember Me
            </label>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Login"}
          </button>

        </form>

        <p className="text-center mt-3 mb-0">
          New vendor?{" "}
          <Link to="/register">
            Create an account
          </Link>
        </p>

      </div>
    </main>
  );
}