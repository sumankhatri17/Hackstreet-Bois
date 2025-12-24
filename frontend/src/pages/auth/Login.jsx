import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Alert from "../../components/common/Alert";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // API call would go here
      // const response = await authService.login(formData);

      // Mock navigation - everyone goes to dashboard
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (err) {
      setError("Invalid credentials. Please try again.");
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
            Adaptive Learning Assessment Platform
          </p>
        </div>

        <Card>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
            Login
          </h2>

          {error && (
            <Alert type="error" message={error} onClose={() => setError("")} />
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="Enter your password"
              required
            />

            <Button type="submit" fullWidth loading={loading}>
              Login
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Register here
            </Link>
          </div>

          <div className="mt-4 text-center">
            <Link
              to="/forgot-password"
              className="text-sm text-gray-600 hover:text-gray-700"
            >
              Forgot password?
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
