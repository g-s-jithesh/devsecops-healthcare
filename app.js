const express = require('express');
const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '10kb' }));

// Security headers
app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Content-Security-Policy': "default-src 'self'; frame-ancestors 'none'; form-action 'self'",
    'Referrer-Policy': 'no-referrer',
    'Cache-Control': 'no-store',
    'Permissions-Policy': 'geolocation=()'
  });
  next();
});

// Secrets come from environment variables (Kubernetes Secret) - never hardcoded
const DB_PASSWORD = process.env.DB_PASSWORD;

const patients = [{ id: 1, name: 'John Doe', condition: 'Hypertension' }];
const isValidText = s => typeof s === 'string' && /^[A-Za-z ,.'-]{1,50}$/.test(s);

app.get('/', (req, res) => res.send('<h1>Healthcare Patient Service</h1><p>Secure DevSecOps demo (VLE-9)</p>'));

app.get('/health', (req, res) => res.json({ status: 'ok', dbConfigured: Boolean(DB_PASSWORD) }));

app.get('/patients/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: 'Invalid patient id' });
  const patient = patients.find(p => p.id === id);
  if (!patient) return res.status(404).json({ error: 'Not found' });
  res.json(patient);
});

app.post('/patients', (req, res) => {
  const { name, condition } = req.body || {};
  if (!isValidText(name) || !isValidText(condition)) return res.status(400).json({ error: 'Invalid input' });
  const patient = { id: patients.length + 1, name, condition };
  patients.push(patient);
  res.status(201).json(patient);
});

app.listen(3000, () => console.log('Healthcare app listening on port 3000'));
