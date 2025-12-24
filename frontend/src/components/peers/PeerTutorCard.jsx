import Badge from "../common/Badge";

const PeerTutorCard = ({ peer, onRequestHelp }) => {
  return (
    <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition">
      <div className="flex items-start space-x-3 mb-3">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
          {peer.name.charAt(0)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 truncate">{peer.name}</h4>
          <p className="text-sm text-gray-600">Grade {peer.grade}</p>
        </div>

        {/* Status Badge */}
        <Badge
          variant={peer.availability === "Online now" ? "success" : "secondary"}
        >
          {peer.availability || "Offline"}
        </Badge>
      </div>

      {/* Can Help With */}
      <div className="mb-3">
        <p className="text-xs font-medium text-gray-600 mb-2">Can help with:</p>
        <div className="flex flex-wrap gap-2">
          {peer.can_help_with?.map((topic, idx) => (
            <span
              key={idx}
              className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
            >
              {topic}
            </span>
          ))}
        </div>
      </div>

      {/* Scores */}
      {peer.their_scores && (
        <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded">
          <p className="text-xs text-blue-800">
            <strong>Their scores:</strong>{" "}
            {Object.entries(peer.their_scores).map(([topic, score], idx) => (
              <span key={idx}>
                {topic}: {score}%
                {idx < Object.entries(peer.their_scores).length - 1 ? ", " : ""}
              </span>
            ))}
          </p>
        </div>
      )}

      {/* Match Reason */}
      {peer.match_reason && (
        <div className="mb-3 p-2 bg-purple-50 border border-purple-200 rounded">
          <p className="text-xs text-purple-700">
            <strong>Why matched:</strong> {peer.match_reason}
          </p>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={() => onRequestHelp(peer)}
        className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition text-sm font-medium"
      >
        Request Help
      </button>
    </div>
  );
};

export default PeerTutorCard;
