import Badge from "../common/Badge";

const PeerLearnerCard = ({ peer, onOfferHelp }) => {
  return (
    <div className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:shadow-md transition">
      <div className="flex items-start space-x-3 mb-3">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
          {peer.name.charAt(0)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 truncate">{peer.name}</h4>
          <p className="text-sm text-gray-600">Grade {peer.grade}</p>
        </div>

        {/* Request Badge */}
        {peer.requested_help && <Badge variant="warning">Requested</Badge>}
      </div>

      {/* Needs Help With */}
      <div className="mb-3">
        <p className="text-xs font-medium text-gray-600 mb-2">
          Needs help with:
        </p>
        <div className="flex flex-wrap gap-2">
          {(Array.isArray(peer.needs_help_with)
            ? peer.needs_help_with
            : [peer.needs_help_with]
          ).map((topic, idx) => (
            <span
              key={idx}
              className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full"
            >
              {topic}
            </span>
          ))}
        </div>
      </div>

      {/* Score Comparison */}
      {peer.their_score !== undefined && peer.your_score !== undefined && (
        <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded">
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">
              Their score:{" "}
              <strong className="text-red-600">{peer.their_score}%</strong>
            </span>
            <span className="text-gray-600">
              Your score:{" "}
              <strong className="text-green-600">{peer.your_score}%</strong>
            </span>
          </div>
        </div>
      )}

      {/* Match Reason */}
      {peer.match_reason && (
        <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded">
          <p className="text-xs text-blue-700">
            <strong>Why you can help:</strong> {peer.match_reason}
          </p>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={() => onOfferHelp(peer)}
        className={`w-full px-4 py-2 rounded-lg transition text-sm font-medium ${
          peer.requested_help
            ? "bg-gradient-to-r from-green-500 to-teal-500 text-white hover:from-green-600 hover:to-teal-600"
            : "bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600"
        }`}
      >
        {peer.requested_help ? "Accept Request" : "Offer Help"}
      </button>
    </div>
  );
};

export default PeerLearnerCard;
