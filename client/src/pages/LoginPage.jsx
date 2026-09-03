import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const demoAccounts = [
  {
    label: 'Dispatcher',
    email: 'dispatcher@demo.com',
    password: 'password123',
  },
  {
    label: 'Technician 1',
    email: 'priya@demo.com',
    password: 'password123',
  },
  {
    label: 'Technician 2',
    email: 'sam@demo.com',
    password: 'password123',
  },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [selected, setSelected] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  function selectAccount(account) {
    setSelected(account.email);
    setEmail(account.email);
    setPassword(account.password);
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white border border-gray-200 shadow-sm p-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Field Service Dispatch
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Sign in with a demo account or enter your credentials.
        </p>

        <div className="mt-6 space-y-3">
          {demoAccounts.map((account) => (
            <button
              key={account.email}
              type="button"
              onClick={() => selectAccount(account)}
              className={`w-full rounded-xl border p-4 text-left transition ${
                selected === account.email
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    {account.label}
                  </p>
                  <p className="text-sm text-gray-500">
                    {account.email}
                  </p>
                </div>

                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                  Autofill
                </span>
              </div>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 py-2.5 font-medium text-white transition hover:bg-blue-700"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 rounded-lg bg-gray-50 border border-gray-200 p-3">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Demo Password
          </p>

          <p className="mt-1 font-mono text-sm text-gray-900">
            password123
          </p>
        </div>
      </div>
    </div>
  );
}
