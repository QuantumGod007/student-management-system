import {
  LayoutDashboard,
  Users,
  UserPlus,
  GraduationCap,
} from "lucide-react";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "students", label: "Students", icon: Users },
  { id: "add", label: "Add Student", icon: UserPlus },
];

function Sidebar({ activeItem = "dashboard", onNavigate, onAddStudent }) {
  const handleClick = (id) => {
    if (id === "add") {
      if (onAddStudent) onAddStudent();
      return;
    }

    if (onNavigate) onNavigate(id);
  };

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">
          <GraduationCap size={22} strokeWidth={1.8} />
        </div>

        <div>
          <h2>StudentHub</h2>
          <p>MITAOE Administration</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              className={`nav-item nav-item-${item.id} ${
                activeItem === item.id ? "active" : ""
              }`}
              onClick={() => handleClick(item.id)}
            >
              <Icon size={18} strokeWidth={1.8} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <strong>MITAOE</strong>
        <span>Student Administration</span>
      </div>
    </aside>
  );
}

export default Sidebar;
