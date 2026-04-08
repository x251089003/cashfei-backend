const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  // Loan params (from calculator)
  amount: { type: Number, required: true },
  period: { type: Number, required: true },

  // Step 1: Dane podstawowe
  firstName: String,
  lastName: String,
  pesel: String,
  phone: String,
  email: String,
  consentRegulations: { type: Boolean, default: false },
  consentMarketing: { type: Boolean, default: false },
  consentPartners: { type: Boolean, default: false },
  consentPhone: { type: Boolean, default: false },

  // Step 2: Sytuacja osobista
  maritalStatus: String,
  propertyType: String,
  residenceStatus: String,
  residenceSince: String,

  // Step 3: Adres zamieszkania
  postalCode: String,
  city: String,
  street: String,
  houseNumber: String,
  apartmentNumber: String,

  // Step 4: Wyksztalcenie i praca
  education: String,
  incomeSource: String,
  industry: String,
  position: String,
  employmentStart: String,
  companyName: String,
  companyNip: String,
  companyCity: String,

  // Step 5: Finanse
  dependents: Number,
  netIncome: Number,
  householdIncome: Number,
  monthlyExpenses: Number,
  loanInstallments: Number,
  householdExpenses: Number,

  // Step 6: Pozostale informacje
  loanPurpose: String,
  bankAccount: String,
  idNumber: String,
  idIssueDate: String,
  consentBIK: { type: Boolean, default: false },
  consentDataProcess: { type: Boolean, default: false },
  consentAllPartners: { type: Boolean, default: false },

  // Tracking
  currentStep: { type: Number, default: 1 },
  completed: { type: Boolean, default: false },
  referenceNumber: String,
}, {
  timestamps: true,
});

module.exports = mongoose.model('Application', applicationSchema);
