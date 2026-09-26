import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useParams, Navigate, useLocation, Outlet } from 'react-router-dom';
import './App.css';

// Initial Mock Data
const initialTasks = [
  {
    id: "TASK-001",
    header: "Complete React Assignment",
    description: "Build a full task manager using React Router and Hooks.",
    priority: "High",
    category: "Academic",
    raisedDate: new Date().toISOString(),
    dueDate: "2026-08-28",
    status: "Pending"
  },
  {
    id: "TASK-002",
    header: "Buy Groceries",
    description: "Get milk, eggs, bread, and fruits for the week.",
    priority: "Medium",
    category: "Personal",
    raisedDate: new Date(Date.now() - 86400000).toISOString(),
    dueDate: "2026-08-28",
    status: "Raised"
  },
  {
    id: "TASK-003",
    header: "Submit Scholarship Form",
    description: "Fill out the online application before the deadline.",
    priority: "High",
    category: "Academic",
    raisedDate: new Date(Date.now() - 172800000).toISOString(),
    dueDate: "2026-08-28",
    status: "Closed"
  }
];

// Context replacement: We'll pass state down via a wrapper or just use App level state.
// Since it's a small app, we'll keep state in App and pass it.

export default function App() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('taskManagerData');
    return saved ? JSON.parse(saved) : initialTasks;
  });
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    localStorage.setItem('taskManagerData', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (newTask) => {
    setTasks([...tasks, { ...newTask, id: `TASK-${Date.now().toString().slice(-4)}`, raisedDate: new Date().toISOString() }]);
  };

  const updateTaskStatus = (id, newStatus) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div className="app-layout">
      {isAuthenticated && <Sidebar setIsAuthenticated={setIsAuthenticated} />}
      <main className="main-content">
        <Routes>
          <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
          
          <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
            <Route path="/" element={<Dashboard tasks={tasks} />} />
            <Route path="/tasks" element={<TasksList tasks={tasks} updateTaskStatus={updateTaskStatus} deleteTask={deleteTask} />} />
            <Route path="/tasks/add" element={<AddTask addTask={addTask} />} />
            <Route path="/tasks/:id" element={<TaskDetails tasks={tasks} updateTaskStatus={updateTaskStatus} />} />
            <Route path="/completed" element={<CompletedTasks tasks={tasks} />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}

// ---------------- Components ---------------- //

function ProtectedRoute({ isAuthenticated, children }) {
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <Outlet />;
}

function Sidebar({ setIsAuthenticated }) {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? "active-link" : "";

  return (
    <aside className="sidebar">
      <h2>TaskMaster</h2>
      <nav>
        <Link to="/" className={isActive("/")}>Dashboard</Link>
        <Link to="/tasks" className={isActive("/tasks")}>All Tasks</Link>
        <Link to="/tasks/add" className={isActive("/tasks/add")}>Add Task</Link>
        <Link to="/completed" className={isActive("/completed")}>Completed Tasks</Link>
      </nav>
      <button onClick={() => setIsAuthenticated(false)} className="btn-logout">Logout</button>
    </aside>
  );
}

function Login({ setIsAuthenticated }) {
  const navigate = useNavigate();
  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Welcome to TaskMaster</h2>
        <p>Your personal productivity suite.</p>
        <button onClick={() => { setIsAuthenticated(true); navigate('/'); }} className="btn-primary">
          Login to Continue
        </button>
      </div>
    </div>
  );
}

// ---------------- Pages ---------------- //

function Dashboard({ tasks }) {
  const total = tasks.length;
  const pending = tasks.filter(t => t.status === "Pending").length;
  const raised = tasks.filter(t => t.status === "Raised").length;
  const closed = tasks.filter(t => t.status === "Closed").length;

  return (
    <div className="page fade-in">
      <h1>Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card"><h3>Total</h3><p>{total}</p></div>
        <div className="stat-card"><h3>Raised</h3><p>{raised}</p></div>
        <div className="stat-card"><h3>Pending</h3><p>{pending}</p></div>
        <div className="stat-card"><h3>Closed</h3><p>{closed}</p></div>
      </div>
      
      <div className="recent-tasks">
        <h2>Recent Tasks</h2>
        {tasks.slice(-3).reverse().map(task => (
          <div key={task.id} className="task-row">
            <span>{task.header}</span>
            <span className={`badge ${task.status.toLowerCase()}`}>{task.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TasksList({ tasks, updateTaskStatus, deleteTask }) {
  const [filter, setFilter] = useState("All");

  const filteredTasks = filter === "All" ? tasks : tasks.filter(t => t.category === filter);

  return (
    <div className="page fade-in">
      <div className="page-header">
        <h1>All Tasks</h1>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="filter-select">
          <option value="All">All Categories</option>
          <option value="Academic">Academic</option>
          <option value="Personal">Personal</option>
        </select>
      </div>
      
      <div className="task-grid">
        {filteredTasks.length === 0 ? <p>No tasks found.</p> : filteredTasks.map(task => (
          <div key={task.id} className="task-card">
            <div className="card-top">
              <h3>{task.header}</h3>
              <span className={`badge ${task.priority.toLowerCase()}`}>{task.priority}</span>
            </div>
            <p className="task-desc">{task.description}</p>
            <div className="card-meta">
              <span>{task.category}</span>
              <span>Due: {task.dueDate}</span>
            </div>
            <div className="card-actions">
              <Link to={`/tasks/${task.id}`} className="btn-view">View Details</Link>
              <button onClick={() => deleteTask(task.id)} className="btn-delete">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AddTask({ addTask }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    header: "", description: "", priority: "Medium", category: "Personal", dueDate: "2026-08-28", status: "Raised"
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addTask(formData);
    navigate('/tasks');
  };

  return (
    <div className="page fade-in">
      <h1>Create New Task</h1>
      <form onSubmit={handleSubmit} className="task-form">
        <div className="form-group">
          <label>Task Header</label>
          <input type="text" value={formData.header} onChange={e => setFormData({...formData, header: e.target.value})} required />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Priority</label>
            <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div className="form-group">
            <label>Category</label>
            <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
              <option value="Academic">Academic</option>
              <option value="Personal">Personal</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Due Date</label>
            <input type="date" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
              <option value="Raised">Raised</option>
              <option value="Pending">Pending</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>
        <button type="submit" className="btn-primary" style={{marginTop: '1rem'}}>Save Task</button>
      </form>
    </div>
  );
}

function TaskDetails({ tasks, updateTaskStatus }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const task = tasks.find(t => t.id === id);

  if (!task) return <div className="page fade-in"><h2>Task not found!</h2></div>;

  return (
    <div className="page fade-in">
      <button onClick={() => navigate(-1)} className="btn-back">← Back</button>
      <div className="details-card">
        <h1>{task.header}</h1>
        <div className="meta-tags">
          <span className={`badge ${task.priority.toLowerCase()}`}>{task.priority} Priority</span>
          <span className="badge category">{task.category}</span>
          <span className={`badge ${task.status.toLowerCase()}`}>{task.status}</span>
        </div>
        <p className="details-desc">{task.description}</p>
        <div className="dates">
          <p><strong>Raised On:</strong> {new Date(task.raisedDate).toLocaleString()}</p>
          <p><strong>Due Date:</strong> {task.dueDate}</p>
        </div>
        
        <div className="status-updater">
          <h3>Update Status</h3>
          <div className="status-buttons">
            <button onClick={() => updateTaskStatus(task.id, 'Raised')} className={task.status === 'Raised' ? 'active' : ''}>Raised</button>
            <button onClick={() => updateTaskStatus(task.id, 'Pending')} className={task.status === 'Pending' ? 'active' : ''}>Pending</button>
            <button onClick={() => updateTaskStatus(task.id, 'Closed')} className={task.status === 'Closed' ? 'active' : ''}>Closed</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompletedTasks({ tasks }) {
  const completed = tasks.filter(t => t.status === "Closed");
  return (
    <div className="page fade-in">
      <h1>Completed Tasks</h1>
      <div className="task-grid">
        {completed.length === 0 ? <p>No completed tasks yet.</p> : completed.map(task => (
          <div key={task.id} className="task-card closed-card">
            <h3>{task.header}</h3>
            <p className="task-desc">{task.description}</p>
            <div className="card-actions">
              <Link to={`/tasks/${task.id}`} className="btn-view">View Details</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
