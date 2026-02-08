import { Link } from "react-router-dom";

const SideNav = () => {
  return (
    <nav className="flex  flex-col gap-4 p-4 text-slate-700">
      <ul className="flex flex-col gap-2 text-sm">
        <Link to="/dashboard">
          <li className="rounded-md bg-slate-100 px-3 py-2 font-medium text-slate-900">
            Dashboard
          </li>
        </Link>

        <Link to="/starred">
          <li className="rounded-md px-3 py-2 hover:bg-slate-100">Starred</li>
        </Link>

        <Link to="/starred">
          <li className="rounded-md px-3 py-2 hover:bg-slate-100">Recent</li>
        </Link>

        <Link to="/starred">
          <li className="rounded-md px-3 py-2 hover:bg-slate-100">Settings</li>
        </Link>
      </ul>
    </nav>
  );
};

export default SideNav;
