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
    <div className="auth">
      <section className="auth-brand">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true" />
          StaffSync
        </div>
        <div>
          <h2>Everyone's work, kept in sync.</h2>
          <p>Attendance, leave, training and company news for HR, managers and employees in one place.</p>
        </div>
      </section>

      <section className="auth-form">
        <form onSubmit={submit}>
          <h1>{isRegister ? 'Create your account' : 'Sign in'}</h1>
          <p className="lead-in">
            {isRegister
              ? 'New accounts start as employee accounts. HR can change your role later.'
              : 'Use the email and password your HR team gave you.'}
          </p>

          {error && <div className="alert alert-danger" role="alert">{error}</div>}

          {isRegister && (
            <>
              <label className="form-label" htmlFor="name">Full name</label>
              <input id="name" className="form-control mb-3" name="name" value={form.name} onChange={change} required />
            </>
          )}
          <label className="form-label" htmlFor="email">Email</label>
          <input id="email" className="form-control mb-3" type="email" name="email" value={form.email} onChange={change} required />
          <label className="form-label" htmlFor="password">Password</label>
          <input id="password" className="form-control mb-4" type="password" name="password" value={form.password} onChange={change} required minLength={6} />

          <button className="btn btn-primary w-100 py-2">{isRegister ? 'Create account' : 'Sign in'}</button>

          <button
            type="button"
            className="btn btn-link mt-3 p-0"
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
          >
            {isRegister ? 'Have an account? Sign in' : 'New here? Create an account'}
          </button>
        </form>
      </section>
    </div>
  );
}
