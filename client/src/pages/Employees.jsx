import { useEffect, useState } from 'react';
import api, { errMsg } from '../api';

const empty = {
  name: '', email: '', password: '', role: 'employee', department: '', position: '', phone: '', salary: '', manager: '',
};

export default function Employees() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');

  const [managers, setManagers] = useState([]);

  const load = () =>
    api.get('/users', { params: { search, role } }).then((r) => setUsers(r.data));
  useEffect(() => { load(); }, [search, role]);
  useEffect(() => {
    api.get('/users', { params: { role: 'manager' } }).then((r) => setManagers(r.data));
  }, []);
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const startAdd = () => { setForm(empty); setEditingId(null); setShow(true); setError(''); };
  const startEdit = (u) => {
    setForm({
      name: u.name, email: u.email, password: '', role: u.role, department: u.department || '',
      position: u.position || '', phone: u.phone || '', salary: u.salary || '', manager: u.manager?._id || '',
    });
    setEditingId(u._id);
    setShow(true);
    setError('');
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      const body = { ...form };
      if (!body.password) delete body.password;
      if (editingId) await api.put(`/users/${editingId}`, body);
      else await api.post('/users', body);
      setShow(false);
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const remove = async (u) => {
    if (!window.confirm(`Delete ${u.name}?`)) return;
    try {
      await api.delete(`/users/${u._id}`);
      load();
    } catch (err) {
      alert(errMsg(err));
    }
  };

  return (
    <>
      <div className="d-flex flex-wrap gap-2 mb-3">
        <input className="form-control w-auto" placeholder="Search name, email, department" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="form-select w-auto" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">All roles</option>
          <option value="employee">Employees</option>
          <option value="manager">Managers</option>
          <option value="hr">HR</option>
        </select>
        <button className="btn btn-primary ms-auto" onClick={startAdd}>+ Add person</button>
      </div>

      {show && (
        <div className="card shadow-sm mb-4">
          <div className="card-header">{editingId ? 'Edit person' : 'Add person'}</div>
          <div className="card-body">
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={save} className="row g-2">
              <div className="col-md-4"><input className="form-control" name="name" placeholder="Name" value={form.name} onChange={change} required /></div>
              <div className="col-md-4"><input className="form-control" type="email" name="email" placeholder="Email" value={form.email} onChange={change} required /></div>
              <div className="col-md-4"><input className="form-control" type="password" name="password" placeholder={editingId ? 'New password (optional)' : 'Password'} value={form.password} onChange={change} required={!editingId} minLength={6} /></div>
              <div className="col-md-3">
                <select className="form-select" name="role" value={form.role} onChange={change}>
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="hr">HR</option>
                </select>
              </div>
              <div className="col-md-3"><input className="form-control" name="department" placeholder="Department" value={form.department} onChange={change} /></div>
              <div className="col-md-3"><input className="form-control" name="position" placeholder="Position" value={form.position} onChange={change} /></div>
              <div className="col-md-3"><input className="form-control" type="number" name="salary" placeholder="Salary" value={form.salary} onChange={change} /></div>
              <div className="col-md-4"><input className="form-control" name="phone" placeholder="Phone" value={form.phone} onChange={change} /></div>
              <div className="col-md-4">
                <select className="form-select" name="manager" value={form.manager} onChange={change}>
                  <option value="">No manager</option>
                  {managers.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
                </select>
              </div>
              <div className="col-md-4 d-flex gap-2">
                <button className="btn btn-success">Save</button>
                <button type="button" className="btn btn-outline-secondary" onClick={() => setShow(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card shadow-sm">
        <div className="table-responsive">
          <table className="table mb-0">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Department</th><th>Position</th><th>Manager</th><th></th></tr></thead>
            <tbody>
              {users.length === 0 && <tr><td colSpan="7" className="text-muted">No people found</td></tr>}
              {users.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td><span className="badge bg-secondary">{u.role}</span></td>
                  <td>{u.department || '-'}</td>
                  <td>{u.position || '-'}</td>
                  <td>{u.manager?.name || '-'}</td>
                  <td className="text-nowrap">
                    <button className="btn btn-sm btn-outline-primary me-1" onClick={() => startEdit(u)}>Edit</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => remove(u)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
