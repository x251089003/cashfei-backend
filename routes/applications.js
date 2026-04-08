const express = require('express');
const Application = require('../models/Application');
const router = express.Router();

// Step field mapping
const STEP_FIELDS = {
  1: ['firstName', 'lastName', 'pesel', 'phone', 'email',
      'consentRegulations', 'consentMarketing', 'consentPartners', 'consentPhone'],
  2: ['maritalStatus', 'propertyType', 'residenceStatus', 'residenceSince'],
  3: ['postalCode', 'city', 'street', 'houseNumber', 'apartmentNumber'],
  4: ['education', 'incomeSource', 'industry', 'position', 'employmentStart',
      'companyName', 'companyNip', 'companyCity'],
  5: ['dependents', 'netIncome', 'householdIncome', 'monthlyExpenses',
      'loanInstallments', 'householdExpenses'],
  6: ['loanPurpose', 'bankAccount', 'idNumber', 'idIssueDate',
      'consentBIK', 'consentDataProcess', 'consentAllPartners'],
};

// POST /api/applications — Create application (Step 1)
router.post('/', async (req, res) => {
  try {
    const { amount, period, ...stepData } = req.body;

    const fields = {};
    for (const key of STEP_FIELDS[1]) {
      if (stepData[key] !== undefined) fields[key] = stepData[key];
    }

    const app = await Application.create({
      amount: amount || 10000,
      period: period || 24,
      ...fields,
      currentStep: 1,
    });

    res.status(201).json({ id: app._id, currentStep: 1 });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/applications/:id/step/:step — Update step data
router.put('/:id/step/:step', async (req, res) => {
  try {
    const { id, step } = req.params;
    const stepNum = parseInt(step);

    if (stepNum < 2 || stepNum > 6) {
      return res.status(400).json({ error: 'Invalid step (2-6)' });
    }

    const allowedFields = STEP_FIELDS[stepNum];
    if (!allowedFields) {
      return res.status(400).json({ error: 'Invalid step' });
    }

    const update = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    }
    update.currentStep = stepNum;

    // Mark completed on step 6
    if (stepNum === 6) {
      update.completed = true;
      update.referenceNumber = 'CF-' + Date.now().toString(36).toUpperCase().slice(-6);
    }

    const app = await Application.findByIdAndUpdate(id, update, { new: true });
    if (!app) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const result = { id: app._id, currentStep: app.currentStep };
    if (app.completed) {
      result.referenceNumber = app.referenceNumber;
    }
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/applications — List all applications
router.get('/', async (req, res) => {
  try {
    const apps = await Application.find()
      .sort({ createdAt: -1 })
      .select('firstName lastName email phone amount period currentStep completed referenceNumber createdAt');
    res.json(apps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/applications/stats — Stats overview
router.get('/stats', async (req, res) => {
  try {
    const [total, completed, today] = await Promise.all([
      Application.countDocuments(),
      Application.countDocuments({ completed: true }),
      Application.countDocuments({
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      }),
    ]);
    res.json({ total, completed, today });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/applications/:id — Single application detail
router.get('/:id', async (req, res) => {
  try {
    const app = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ error: 'Not found' });
    res.json(app);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
