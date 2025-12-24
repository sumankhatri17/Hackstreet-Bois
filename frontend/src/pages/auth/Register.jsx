import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Alert from "../../components/common/Alert";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    schoolName: "",
    gradeLevel: "",
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
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            EduAssess
          </h1>
          <p className="text-sm sm:text-base text-blue-100">
            Create your account
          </p>
        </div>

        <Card>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
            Register
          </h2>

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

            <Input
              label="School / Educational Institution"
              value={formData.schoolName}
              onChange={(e) =>
                setFormData({ ...formData, schoolName: e.target.value })
              }
              placeholder="Enter your school, college, or university name"
              required
            />

            <Select
              label="Current Grade Level"
              value={formData.gradeLevel}
              onChange={(e) =>
                setFormData({ ...formData, gradeLevel: e.target.value })
              }
              options={[
                { value: "", label: "Select your grade" },
                { value: "6", label: "Grade 6" },
                { value: "7", label: "Grade 7" },
                { value: "8", label: "Grade 8" },
                { value: "9", label: "Grade 9" },
                { value: "10", label: "Grade 10" },
                { value: "11", label: "Grade 11" },
                { value: "12", label: "Grade 12" },
              ]}
              required
            />

            <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
              <p className="text-sm text-gray-800 leading-relaxed">
                <strong>📚 Peer-to-Peer Learning:</strong> You'll take
                assessments in Math and English based on your grade level. Based
                on your performance:
              </p>
              <ul className="text-sm text-gray-700 mt-2 ml-4 space-y-1">
                <li>
                  ✓ Get matched with <strong>peer tutors</strong> who excel in
                  your weak areas
                </li>
                <li>
                  ✓ Help <strong>other peers</strong> in topics where you're
                  strong
                </li>
                <li>✓ Learn by teaching and being taught by fellow students</li>
              </ul>
            </div>

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
