import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Alert from "../../components/common/Alert";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
    schoolId: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      // API call would go here
      // await authService.register(formData);

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      setError("Registration failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">EduAssess</h1>
          <p className="text-blue-100">Create your account</p>
        </div>

        <Card>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Register</h2>

          {error && (
            <Alert type="error" message={error} onClose={() => setError("")} />
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter your full name"
              required
            />

            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="Enter your email"
              required
            />

            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="Create a password"
              required
            />

            <Input
              label="Confirm Password"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              placeholder="Confirm your password"
              required
            />

            <Select
              label="Register as"
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              options={[
                { value: "student", label: "Student" },
                { value: "teacher", label: "Teacher" },
              ]}
            />

            <Input
              label="School ID (Optional)"
              value={formData.schoolId}
              onChange={(e) =>
                setFormData({ ...formData, schoolId: e.target.value })
              }
              placeholder="Enter school ID if available"
            />

            <Button type="submit" fullWidth loading={loading}>
              Register
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Login here
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Register;
