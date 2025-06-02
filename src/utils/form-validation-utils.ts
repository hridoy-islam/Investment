// utils/form-validation-utils.ts

type StepValidationConfig = {
  requiredFields: string[];
};

export const stepValidationConfigs: Record<number, StepValidationConfig> = {
  1: { // Personal Details
    requiredFields: [
      'firstName',
      'lastName',
      'maritalStatus',
      'nationality',
      'ethnicity',
      'countryOfBirth',
      'applicationLocation'
    ],
   
  },
  2: { // Address
    requiredFields: [
      'residentialAddressLine1',
      'residentialCity',
      'residentialPostCode',
      'residentialCountry'
    ]
  },
  3: { // Emergency Contact
    requiredFields: [
      'emergencyContactNumber',
      'emergencyEmail',
      'emergencyFullName',
      'emergencyRelationship',
      'emergencyAddress'
    ]
  },
  4: { // Education
    requiredFields: [
      'educationData',
      
    ]
  },
  5: { // Employment
    requiredFields: [
      'isEmployed',
      'hasPreviousEmployment'
    ]
  },
  6: { // Compliance
    requiredFields: [
      'visaRefusals',
      'completedUKCourse',
      'enteredUKBefore',
      'visaRequired',
      'studentFinance',
      'criminalConviction',
      'benefits',
      'disability',
      'immigrationStatus',
      
    ]
  },
  7: { // Documents
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