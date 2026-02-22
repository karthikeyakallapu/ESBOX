import { Link } from "react-router-dom";
import Github from "../../assets/github.svg";

import {
  Shield,
  Zap,
  Users,
  CheckCircle,
  Cloud,
  ArrowRight,
  Server,
  Lock,
  Upload,
  Download,
  Share2,
  FileText,
  Image,
  Music,
  Video,
  Folder,
  Star,
  Infinity as InfinityIcon,
} from "lucide-react";

// Define the type for file types
type FileType = "pdf" | "image" | "audio" | "video" | "folder";

interface RecentFile {
  name: string;
  type: FileType;
  size: string;
  icon: React.ComponentType<{ size: number; className?: string }>;
}

const recentFiles: RecentFile[] = [
  { name: "Project Proposal.pdf", type: "pdf", size: "2.4 MB", icon: FileText },
  { name: "Vacation Photo.jpg", type: "image", size: "4.1 MB", icon: Image },
  { name: "Meeting Recording.mp3", type: "audio", size: "8.7 MB", icon: Music },
  { name: "Tutorial Video.mp4", type: "video", size: "156 MB", icon: Video },
  { name: "Documents", type: "folder", size: "12 items", icon: Folder },
];

// Define colors object with proper typing
const colors: Record<FileType, string> = {
  pdf: "text-red-500",
  image: "text-blue-500",
  audio: "text-purple-500",
  video: "text-green-500",
  folder: "text-yellow-500",
};

const Home = () => {
  const features = [
    {
      icon: Shield,
      title: "Secure by Design",
      desc: "End-to-end encryption for your files",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      desc: "Quick uploads and instant access",
    },
    {
      icon: Users,
      title: "Easy Sharing",
      desc: "Share files with anyone securely",
    },
    {
      icon: Cloud,
      title: "Unlimited Storage",
      desc: "No limits, completely free",
    },
  ];

  // Add shimmer animation to your CSS
  const shimmerAnimation = `
    @keyframes shimmer {
      0% {
        transform: translateX(-100%);
      }
      100% {
        transform: translateX(100%);
      }
    }
    .animate-shimmer {
      animation: shimmer 2s infinite;
    }
  `;

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
      {/* Add the animation style */}
      <style>{shimmerAnimation}</style>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-900 text-white rounded-full text-sm font-medium mb-6">
              <img src={Github} className="h-4 w-4 invert" alt="Github Icon" />
              Open Source
            </div>
            <h1 className="text-5xl font-bold leading-tight">
              Your Files,{" "}
              <span className="bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Your Control
              </span>
            </h1>
            <p className="text-xl text-gray-600 mt-4">
              Open source cloud storage with{" "}
              <span className="font-semibold text-gray-900">
                unlimited space
              </span>
              . Self-host or use our free instance. No limits, no hidden costs.
            </p>

            <div className="flex gap-4 mt-8">
              <Link
                to="/dashboard"
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                Get Started <ArrowRight size={18} />
              </Link>
              <a
                href="https://github.com/karthikeyakallapu/ESBOX"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <img src={Github} className="h-7 w-7" alt="Github Icon" />
                GitHub
              </a>
            </div>

            <div className="flex items-center gap-6 mt-8 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <CheckCircle size={16} className="text-green-500" /> Unlimited
                Storage
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle size={16} className="text-green-500" /> Open Source
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle size={16} className="text-green-500" /> Self-host
              </span>
            </div>
          </div>

          {/* Enhanced Cloud Storage Image Section */}
          <div className="relative">
            {/* Animated background effect */}
            <div className="absolute inset-0 bg-linear-to-r from-blue-500 to-purple-600 rounded-3xl blur-3xl opacity-20 animate-pulse"></div>

            {/* Main container */}
            <div className="relative bg-white rounded-3xl shadow-2xl p-4 border border-gray-100 overflow-hidden">
              {/* Header with storage info */}
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-linear-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Cloud className="text-white" size={18} />
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">
                      ESBOX Cloud
                    </span>
                    <span className="text-xs text-gray-500 block">
                      Active • Synced
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full font-medium flex items-center gap-1">
                    <InfinityIcon size={12} /> Unlimited
                  </span>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>

              {/* Storage visualization - Showing unlimited with infinity bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Storage</span>
                  <span className="flex items-center gap-1">
                    <InfinityIcon size={12} className="text-purple-500" />
                    Unlimited • Free forever
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden relative">
                  <div className="h-full w-full bg-linear-to-r from-blue-500 to-purple-500 rounded-full opacity-20"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-full bg-linear-to-r from-transparent via-white to-transparent animate-shimmer"></div>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-1 text-right">
                  No storage limits • Upload as much as you want
                </p>
              </div>

              {/* Quick actions */}
              <div className="flex gap-2 mb-4">
                <button className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors flex items-center justify-center gap-1">
                  <Upload size={14} /> Upload
                </button>
                <button className="flex-1 py-2 bg-gray-50 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-1">
                  <Download size={14} /> Download
                </button>
                <button className="flex-1 py-2 bg-gray-50 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-1">
                  <Share2 size={14} /> Share
                </button>
              </div>

              {/* Recent files section */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Recent files
                  </span>
                  <span className="text-xs text-blue-600 hover:underline cursor-pointer">
                    View all
                  </span>
                </div>

                <div className="space-y-2">
                  {recentFiles.slice(0, 4).map((file, index) => {
                    const Icon = file.icon;
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-1.5 rounded-lg ${colors[file.type]} bg-opacity-10 bg-current`}
                          >
                            <Icon size={16} className={colors[file.type]} />
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-700 block">
                              {file.name}
                            </span>
                            <span className="text-xs text-gray-400">
                              {file.size}
                            </span>
                          </div>
                        </div>
                        <Star
                          size={14}
                          className="text-gray-300 group-hover:text-yellow-400 transition-colors"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Activity indicator */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-linear-to-br from-blue-500 to-purple-500 border-2 border-white flex items-center justify-center">
                      <span className="text-[10px] text-white font-bold">
                        JD
                      </span>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-linear-to-br from-green-500 to-teal-500 border-2 border-white flex items-center justify-center">
                      <span className="text-[10px] text-white font-bold">
                        MK
                      </span>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-linear-to-br from-orange-500 to-red-500 border-2 border-white flex items-center justify-center">
                      <span className="text-[10px] text-white font-bold">
                        AL
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">+3 active users</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <InfinityIcon size={12} className="text-purple-500" />
                  <span>Unlimited storage</span>
                </div>
              </div>

              {/* Floating elements for visual interest */}
              <div className="absolute -top-2 -right-2 w-12 h-12 bg-yellow-400 rounded-full opacity-20 blur-xl"></div>
              <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-purple-400 rounded-full opacity-20 blur-xl"></div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-400 rounded-full opacity-10 blur-3xl"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-4">
            Why Choose ESBOX?
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Built for developers, designed for everyone. Complete control over
            your data.
          </p>

          <div className="grid md:grid-cols-4 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="p-6 bg-gray-50 rounded-2xl hover:shadow-lg transition-shadow group"
                >
                  <div className="w-12 h-12 bg-linear-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="text-blue-600" size={24} />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-500">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Open Source Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-linear-to-br from-gray-900 to-gray-800 rounded-3xl p-12 text-white">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4">100% Open Source</h2>
                <p className="text-gray-300 mb-6 text-lg">
                  ESBOX is completely open source. Self-host on your own
                  servers, contribute to the project, or just use our free
                  hosted version.
                </p>
                <div className="flex gap-4">
                  <a
                    href="https://github.com/karthikeyakallapu/ESBOX"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-white text-gray-900 rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-2 font-medium"
                  >
                    <img src={Github} className="h-7 w-7" alt="Github Icon" />{" "}
                    View on GitHub
                  </a>
                </div>
              </div>
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                <div className="flex items-center gap-2 mb-4">
                  <Server size={18} className="text-gray-400" />
                  <span className="text-sm text-gray-400">Quick deploy</span>
                </div>
                <pre className="text-sm text-gray-300 font-mono">
                  <code>{`git clone https://github.com/karthikeyakallapu/ESBOX
cd esbox
docker-compose up -d

# Your cloud storage is ready!`}</code>
                </pre>
                <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                  <Lock size={12} />
                  <span>Self-hosted • Full control • No vendor lock-in</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="pb-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-linear-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Start using ESBOX today</h2>
            <p className="text-blue-100 mb-6 text-lg">
              Unlimited storage, completely free. No signup required.
            </p>

            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl font-medium hover:bg-gray-100 transition-colors text-lg shadow-lg"
            >
              Go to Dashboard <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-sm text-gray-500">
          <span>© 2026 ESBOX. Open source forever.</span>
          <div className="flex gap-6">
            <a href="/privacy" className="hover:text-gray-900">
              Privacy
            </a>
            <a href="/terms" className="hover:text-gray-900">
              Terms
            </a>
            <a
              href="https://github.com/karthikeyakallapu/ESBOX"
              className="hover:text-gray-900"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
