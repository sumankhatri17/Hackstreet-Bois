import { useState } from "react";
import Button from "../common/Button";

const HelpRequestModal = ({ peer, type = "request", onClose, onSubmit }) => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit({ peer_id: peer.id, message });
      onClose();
    } catch (error) {
      console.error("Failed to send request:", error);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          {type === "request" ? "Request Help" : "Offer Help"} - {peer.name}
        </h3>

        <div className="mb-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
              {peer.name.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{peer.name}</p>
              <p className="text-sm text-gray-600">Grade {peer.grade}</p>
            </div>
          </div>

          {type === "request" && peer.can_help_with && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-3">
              <p className="text-sm text-blue-800">
                <strong>Can help with:</strong> {peer.can_help_with.join(", ")}
              </p>
            </div>
          )}

          {type === "offer" && peer.needs_help_with && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-3">
              <p className="text-sm text-green-800">
                <strong>Needs help with:</strong>{" "}
                {Array.isArray(peer.needs_help_with)
                  ? peer.needs_help_with.join(", ")
                  : peer.needs_help_with}
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message (optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                type === "request"
                  ? "Hi! I need help with... Can you explain...?"
                  : "Hi! I'd be happy to help you with... Let me know when you're free!"
              }
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              fullWidth
            >
              Cancel
            </Button>
            <Button type="submit" loading={loading} fullWidth>
              {type === "request" ? "Send Request" : "Send Offer"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HelpRequestModal;
