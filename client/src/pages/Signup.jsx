import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import "./Login.css";

function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    // Frontend Validation
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const response = await axios.post(
        "/auth/signup",
        {
          username,
          email,
          password,
        }
      );

      console.log(response.data);

      alert("Signup Successful!");

      navigate("/login");
    } catch (error) {
      console.log(error.response?.status);
      console.log(error.response?.data);
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">

        <h1 className="logo">🔗 LinkForge</h1>
        <p className="subtitle">Create your account</p>

        <form onSubmit={handleSubmit}>

          <input
            type="text"
            placeholder="Enter Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button type="submit">
            Signup
          </button>

        </form>

        <p className="signup-text">
          Already have an account?{" "}
          <Link to="/login">
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Signup;