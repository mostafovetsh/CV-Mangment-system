import React, { useState } from 'react';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onLogin(data.user);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={submit}>
        <div className="brand">نظام إدارة السير الذاتية</div>
        <h2>تسجيل الدخول</h2>
        {error && <div className="error">{error}</div>}
        <div className="form-group">
          <label>اسم المستخدم</label>
          <input value={username} onChange={e => setUsername(e.target.value)} placeholder="ادخل اسم المستخدم" />
        </div>
        <div className="form-group">
          <label>كلمة المرور</label>
          <div className="password-row">
            <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="ادخل كلمة المرور" />
            <button type="button" className="btn-icon" aria-label="Toggle password" onClick={() => setShowPassword(s => !s)}>{showPassword ? 'إخفاء' : 'إظهار'}</button>
          </div>
        </div>
        <div className="form-actions" style={{justifyContent: 'space-between', alignItems: 'center'}}>
          <div style={{fontSize:12, color:'#666'}}>Demo: <b>admin/admin123</b></div>
          <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'جاري...' : 'دخول'}</button>
        </div>
      </form>
    </div>
  );
}
