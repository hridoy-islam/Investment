// utils/form-validation-utils.ts

type StepValidationConfig = {
  requiredFields: string[];
};

export const stepValidationConfigs: Record<number, StepValidationConfig> = {
  1:{ requiredFields: []},
  2: { // Personal Details
    requiredFields: [
      'firstName',
      'lastName',
      'maritalStatus',
      'nationality',
      'ethnicity',
      'countryOfBirth',
      'applicationLocation',
      'dateOfBirth',
      'postalAddress'
    ],
   
  },
  3: { // application
    requiredFields: [
      'availableFromDate',
      'source',
      'availability',
      'isStudent','isUnderStatePensionAge'
    ]
  },
  4: { // education
    requiredFields: [
      'educationData',
     
    ]
  },
  5: { // employment
    requiredFields: [
      'isEmployed',
      'hasPreviousEmployment'
      
    ]
  },
  6: { // disability
    requiredFields: [
      'hasDisability',
      'needsReasonableAdjustment',
    ]
  },
  7: { // referee
    requiredFields: [
       // Referee 1
    'referee1.name',
    'referee1.organisation',
    'referee1.address',
    'referee1.relationship',
    'referee1.email',
    'referee1.phone',

    // Referee 2
    'referee2.name',
    'referee2.organisation',
    'referee2.address',
    'referee2.relationship',
    'referee2.email',
    'referee2.phone'
    ]
  },
  8: { // Documents
    requiredFields: [
      
    ]
  },
  9: { // terms
    requiredFields: [
      
    ]
  }
};

export const validateStep = (stepId: number, formData: any): boolean => {
  const config = stepValidationConfigs[stepId];
  if (!config) return true; // If no config, assume step is valid

  return config.requiredFields.every(field => {
    const value = formData[field];
    
    // Check if field exists and isn't empty
    if (value === undefined || value === null || value === '') {
      return false;
    }

   
    return true;
  });
};

export const findFirstIncompleteStep = (formData: any): number => {
  const stepIds = Object.keys(stepValidationConfigs).map(Number).sort((a, b) => a - b);
  
  for (const stepId of stepIds) {
    if (!validateStep(stepId, formData)) {
      return stepId;
    }
  }
  
  return 1; 
};