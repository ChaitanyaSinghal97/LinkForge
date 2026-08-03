import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:5000/auth/login",
        {
          email,
          password,
        }
      );

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user",JSON.stringify(response.data.user));
      navigate("/dashboard");
    } catch (error) {
      console.log(error.response.status);
      console.log(error.response.data);
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">

        <h1 className="logo">🔗 LinkForge</h1>
        <p className="subtitle">Login to your account</p>

        <form onSubmit={handleSubmit}>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">
            Login
          </button>

        </form>

        <p className="signup-text">
          Don't have an account?{" "}
          <Link to="/signup">Signup</Link>
        </p>

      </div>
    </div>
  );
}

export default Login;