export interface TCareer {
  // Profile
  profilePictureUrl?: string;
  title: string;
  firstName: string;
  initial?: string;
  lastName: string;
  dateOfBirth: Date;

  // Contact Info
  email: string;
  phone?: string;
  nationality?: string;
  countryOfResidence?: string;
  postalAddress: {
    line1: string;
    line2?: string;
    city: string;
    postCode: string;
    country: string;
  };

  // Official Numbers
  nationalInsuranceNumber?: string;
  nhsNumber?: string;
  shareCode?: string;

  // Application Details
  applicationDate: Date;
  availableFromDate: Date;
  employmentType?: "full-time" | "part-time" | "contractor" | "temporary" | "intern";
  position: string;
  source: string;
  branch: string;
  area: string;
  noticePeriod: string;
  salaryExpectation: string;
  maxHoursPerWeek: string;
  carTravelAllowance: boolean;
  isFullTime?: boolean;
  availability: Record<string, boolean>; // e.g., { monday: true, tuesday: false, ... }

  // Demographics
  gender?: string;
  maritalStatus?: string;
  ethnicOrigin?: string;
  religion?: string;
  isBritishCitizen: boolean;
  isStudent: boolean;
  isUnderStatePensionAge: boolean;

  // Disability
  hasDisability: boolean;
  disabilityDetails?: string;
  needsReasonableAdjustment: boolean;
  reasonableAdjustmentDetails?: string;

  // Employment
  isEmployed: string;
  currentEmployment?: {
    employer?: string;
    jobTitle?: string;
    startDate?: string;
    endDate?: string;
    currentlyEmployed?: boolean;
    employmentType?: string;
    responsibilities?: string;
    supervisor?: string;
    contactPermission?: string;
  };
  previousEmployments?: {
    employer: string;
    jobTitle: string;
    startDate: string;
    endDate: string;
    reasonForLeaving: string;
    responsibilities: string;
    contactPermission: string;
  }[];
  hasEmploymentGaps: string;
  employmentGapsExplanation?: string;

  // Right to Work
  rightToWork?: {
    hasExpiry: boolean;
    expiryDate?: Date;
  };

  // Referees
  referees: {
    name: string;
    organisation: string;
    address: string;
    designation: string;
    email: string;
    phone: string;
  }[];

  // Equality Info (repeat for redundancy in some schemas)
  equalityInformation?: {
    nationality: string;
    religion?: string;
    hasDisability: boolean;
    disabilityDetails?: string;
  };

  // Declaration
  declarationCorrectUpload: boolean;
  declarationContactReferee: boolean;
  criminalConviction: boolean;
  criminalConvictionDetails?: string;
  appliedBefore: boolean;

  // Documents
  documents: {
    passport?: File | string;
    cv?: File | string;
    proofOfAddress?: File | string;
    qualification?: File | string;
    reference?: File | string;
    shareCode?: File | string;
    eVisa?: File | string;
    nationalInsurance?: File | string;
  };

  // Extra
  wtrDocumentUrl?: File | string;
  referralEmployee?: string;
  notes?: string;
  status: "applied" | "shortlisted" | "interviewing" | "offered" | "hired" | "rejected";

  // Dates
  availableFrom: Date;
  startDate: Date;
}
