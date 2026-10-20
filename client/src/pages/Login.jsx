import { useState } from 'react';
import { useAuth } from '../AuthContext.jsx';
import { errMsg } from '../api';

export default function Login() {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegister) await register(form.name, form.email, form.password);
      else await login(form.email, form.password);
    } catch (err) {
      setError(errMsg(err));
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-5">
        <div className="card shadow-sm">
          <div className="card-body p-4">
            <h3 className="mb-1">StaffSync</h3>
            <p className="text-muted">{isRegister ? 'Create an employee account' : 'Sign in to continue'}</p>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={submit}>
              {isRegister && (
                <input className="form-control mb-3" name="name" placeholder="Full name" value={form.name} onChange={change} required />
              )}
              <input className="form-control mb-3" type="email" name="email" placeholder="Email" value={form.email} onChange={change} required />
              <input className="form-control mb-3" type="password" name="password" placeholder="Password (min 6 chars)" value={form.password} onChange={change} required minLength={6} />
              <button className="btn btn-primary w-100">{isRegister ? 'Register' : 'Login'}</button>
            </form>
            <button className="btn btn-link mt-2 p-0" onClick={() => { setIsRegister(!isRegister); setError(''); }}>
              {isRegister ? 'Already have an account? Login' : 'New employee? Register'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
