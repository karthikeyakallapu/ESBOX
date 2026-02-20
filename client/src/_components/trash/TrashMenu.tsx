interface Props {
  onRestore: () => void;
  onPermanentDelete: () => void;
}

const TrashMenu = ({ onRestore, onPermanentDelete }: Props) => {
  return (
    <div
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      className="absolute top-12 left-36 z-50 min-w-52 bg-white rounded-lg shadow-lg border border-gray-200 py-1"
    >
      <button
        onClick={onRestore}
        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-green-600 hover:bg-green-50"
      >
        Restore
      </button>

      <button
        onClick={onPermanentDelete}
        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
      >
        Delete Permanently
      </button>
    </div>
  );
};

export default TrashMenu;
