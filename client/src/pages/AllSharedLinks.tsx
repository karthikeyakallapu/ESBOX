import useSWR, { mutate } from "swr";
import { useState, useMemo } from "react";
import apiService from "../service/apiService";
import Loading from "../_components/loaders/Loading";
import Error from "../_components/loaders/Error";
import { formatDistanceToNow, format, isToday, isFuture } from "date-fns";
import {
  Image,
  Video,
  FileText,
  File,
  RefreshCw,
  Copy,
  Check,
  Key,
  Trash2,
  Link as LinkIcon,
  Share2,
  Clock,
  Search,
  X,
  Zap,
  TimerOff,
} from "lucide-react";
import useModalStore from "../store/useModal";

/* ---------------- TYPES ---------------- */

type FileData = {
  id: number;
  name: string;
  size: number;
  mime_type: string;
};

type SharedLink = {
  id: number;
  share_token: string;
  created_at: string;
  expires_at: string;
  file?: FileData;
};

type FilterState = "all" | "active" | "expired";

/* ---------------- COMPONENT ---------------- */

const AllSharedLinks = () => {
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterState>("all");

  const { openModal } = useModalStore();

  const { data, error, isLoading } = useSWR<SharedLink[]>(
    "user-shared-links",
    apiService.getAllSharedLinks,
  );

  /* ---------- helpers ---------- */

  const handleRefresh = () => mutate("user-shared-links");

  const handleCopyLink = async (token: string) => {
    await navigator.clipboard.writeText(`${window.location.origin}/s/${token}`);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const formatFileSize = (bytes = 0) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getFileIcon = (mime?: string) => {
    if (mime?.startsWith("image/"))
      return <Image className="w-5 h-5 text-sky-500" />;
    if (mime?.startsWith("video/"))
      return <Video className="w-5 h-5 text-purple-500" />;
    if (mime === "application/pdf")
      return <FileText className="w-5 h-5 text-red-500" />;
    return <File className="w-5 h-5 text-gray-400" />;
  };

  const getExpiryBadge = (date: Date) => {
    if (isToday(date))
      return (
        <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
          <Clock className="w-3 h-3" />
          Expires today
        </span>
      );

    if (isFuture(date))
      return (
        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2  py-0.5 rounded-md">
          <Zap className="w-3 h-3" />
          Active
        </span>
      );

    return (
      <span className="flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-md">
        <TimerOff className="w-3 h-3" />
        Expired
      </span>
    );
  };

  /* ---------- filtering ---------- */

  const filteredLinks = useMemo(() => {
    if (!data) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return data.filter((item) => {
      const expiry = new Date(item.expires_at);
      expiry.setHours(0, 0, 0, 0);

      const matchesSearch = item.file?.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());

      const isActive = expiry >= today;
      const isExpired = expiry < today;

      const matchesFilter =
        filter === "all" ||
        (filter === "active" && isActive) ||
        (filter === "expired" && isExpired);

      return matchesSearch && matchesFilter;
    });
  }, [data, searchQuery, filter]);

  /* ---------- modals ---------- */

  const handleDeleteClick = (token: string, fileName?: string) =>
    openModal("deleteSharedLink", {
      shareToken: token,
      fileName,
      onDelete: async () => mutate("user-shared-links"),
    });

  const handlePasswordClick = (token: string, fileName?: string) =>
    openModal("changeSharedLinkPassword", {
      shareToken: token,
      fileName,
      onChangePassword: async () => mutate("user-shared-links"),
    });

  const handleUpdateExpiryClick = (
    token: string,
    fileName?: string,
    expiry?: string,
  ) =>
    openModal("updateSharedLinkExpiry", {
      shareToken: token,
      fileName,
      currentExpiry: expiry,
      onUpdate: async () => mutate("user-shared-links"),
    });

  /* ---------- render item ---------- */

  const renderItem = (item: SharedLink) => {
    const expiry = new Date(item.expires_at);
    const link = `${window.location.origin}/s/${item.share_token}`;

    return (
      <div
        key={item.id}
        className="p-4 border-b border-gray-200 hover:bg-gray-50 transition"
      >
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
            {getFileIcon(item.file?.mime_type)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold truncate max-w-[60%]">
                {item.file?.name ?? "Unknown file"}
              </span>
              {getExpiryBadge(expiry)}
            </div>

            <div className="text-xs text-gray-500 flex flex-wrap gap-2 mt-1">
              <span>{formatFileSize(item.file?.size)}</span>
              <span>•</span>
              <span>
                Created{" "}
                {formatDistanceToNow(new Date(item.created_at), {
                  addSuffix: true,
                })}
              </span>
              <span>•</span>
              <span>Expires {format(expiry, "MMM d, yyyy")}</span>
            </div>

            <div className="flex gap-2 mt-3 items-center">
              <div className="flex items-center gap-2 flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
                <LinkIcon className="w-4 h-4 text-gray-400" />

                <span className="text-xs font-mono text-gray-500 truncate flex-1">
                  {link}
                </span>

                <button
                  onClick={() => handleCopyLink(item.share_token)}
                  className="p-1 hover:text-indigo-600"
                >
                  {copiedToken === item.share_token ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              <>
                <button
                  onClick={() =>
                    handleUpdateExpiryClick(
                      item.share_token,
                      item.file?.name,
                      item.expires_at,
                    )
                  }
                  className="p-2 rounded-lg border border-gray-200 hover:text-amber-600"
                >
                  <Clock className="w-4 h-4" />
                </button>

                <button
                  onClick={() =>
                    handlePasswordClick(item.share_token, item.file?.name)
                  }
                  className="p-2 rounded-lg border border-gray-200 hover:text-indigo-600"
                >
                  <Key className="w-4 h-4" />
                </button>
              </>

              <button
                onClick={() =>
                  handleDeleteClick(item.share_token, item.file?.name)
                }
                className="p-2 rounded-lg border border-gray-200 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) return <Loading />;
  if (error) return <Error error={error} handleRefresh={handleRefresh} />;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 h-[80vh] flex flex-col">
      {/* header */}
      <div className="flex justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <Share2 className="text-indigo-600" />
            <h1 className="text-xl font-bold">Shared Links</h1>
          </div>

          <p className="text-sm text-gray-500">
            Manage all your publicly shared files
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="p-2 border border-gray-200 rounded-lg hover:text-indigo-600"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />

        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search shared links..."
          className="w-full border border-gray-200 rounded-lg py-2 pl-9 pr-9 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
        />

        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-2.5 text-gray-400"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* filters */}
      <div className="flex gap-2 mb-4">
        {["all", "active", "expired"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as FilterState)}
            className={`px-3 py-1.5 text-sm rounded-lg border ${
              filter === f
                ? "bg-indigo-50 border-indigo-300 text-indigo-600"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* scroll area */}
      <div className="flex-1 overflow-y-auto border border-gray-200 rounded-xl">
        {filteredLinks.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            No shared links found
          </div>
        ) : (
          filteredLinks.map(renderItem)
        )}
      </div>
    </div>
  );
};

export default AllSharedLinks;
