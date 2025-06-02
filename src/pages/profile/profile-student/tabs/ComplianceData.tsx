import React, { useEffect, useState } from 'react';
import TabSection from '../TabSection';
import { User } from '../../../types/user.types';
import Select from 'react-select';
import { Input } from '@/components/ui/input';
import { CustomDatePicker } from '@/components/shared/CustomDatePicker';

const ComplianceData = ({
  userData,
  isEditing = false,
  onSave,
  onCancel,
  onEdit
}) => {
  const [localData, setLocalData] = useState<User>(userData);

  // Handle input changes for all fields
  const handleInputChange = (field: keyof User, value: any) => {
    setLocalData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  useEffect(() => {
    setLocalData(userData);
  }, [userData]);

  const handleSave = () => {
    if (onSave) {
      onSave(localData);
    }
  };

  const capitalizeFirstLetter = (str: string) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

 const visaOptions = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' }
  ];
  const enteredUKOptions = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' }
  ];

  const completedUKCourseOptions = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' }
  ];

  const visaRefusalOptions = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' }
  ];

  const statusOptions = [
    { value: 'uk-citizen', label: 'UK Citizen' },
    { value: 'eu-settled', label: 'EU Settled Status' },
    { value: 'eu-pre-settled', label: 'EU Pre-Settled Status' },
    { value: 'tier4', label: 'Tier 4 Student Visa' },
    { value: 'tier2', label: 'Tier 2 Work Visa' },
    { value: 'other', label: 'Other' }
  ];

  const disabilityOptions = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' }
  ];

  const benefitsOptions = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' }
  ];
  const studentFinanceOptions = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' }
  ];


  return (
    <TabSection
      title="Other Information"
      description="Regulatory and other requirements"
      userData={userData}
      isEditing={isEditing}
      onSave={handleSave}
      onCancel={onCancel}
      onEdit={onEdit}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        
        {/* Start Date in UK */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Start Date in UK
          </label>
          {isEditing ? (
            <CustomDatePicker
              selected={localData?.startDateInUK ? new Date(localData.startDateInUK) : null}
              onChange={(date: Date | null) => 
                handleInputChange('startDateInUK', date ? date.toISOString() : null)
              }
              placeholder="Select start date"
            />
          ) : (
            <div className="mt-1 text-gray-900">
              {localData?.startDateInUK
                ? new Date(localData.startDateInUK).toLocaleDateString()
                : '-'}
            </div>
          )}
        </div>

        {/* National Insurance Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            National Insurance Number
          </label>
          {isEditing ? (
            <Input
              type="text"
              value={localData?.niNumber || ''}
              onChange={(e) => handleInputChange('niNumber', e.target.value)}
              placeholder="AB123456C"
            />
          ) : (
            <div className="mt-1 text-gray-900">
              {localData?.niNumber || '-'}
            </div>
          )}
        </div>

        {/* LTR/BRP Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            LTR/BRP Code
          </label>
          {isEditing ? (
            <Input
              type="text"
              value={localData?.ltrCode || ''}
              onChange={(e) => handleInputChange('ltrCode', e.target.value)}
            />
          ) : (
            <div className="mt-1 text-gray-900">
              {localData?.ltrCode || '-'}
            </div>
          )}
        </div>

        {/* Disability Details (Conditional) */}
        {localData?.disability === 'yes' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Please provide disability details
            </label>
            {isEditing ? (
              <Input
                type="text"
                value={localData?.disabilityDetails || ''}
                onChange={(e) => handleInputChange('disabilityDetails', e.target.value)}
              />
            ) : (
              <div className="mt-1 text-gray-900">
                {localData?.disabilityDetails || '-'}
              </div>
            )}
          </div>
        )}

        {/* Criminal Conviction */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Do you have any criminal convictions?
          </label>
          {isEditing ? (
            <Select
              options={[
                { value: true, label: 'Yes' },
                { value: false, label: 'No' }
              ]}
              value={{
                value: localData?.criminalConviction || false,
                label: localData?.criminalConviction ? 'Yes' : 'No'
              }}
              onChange={(selectedOption) => 
                handleInputChange('criminalConviction', selectedOption?.value)
              }
              className="react-select-container"
              classNamePrefix="react-select"
            />
          ) : (
            <div className="mt-1 text-gray-900">
              {localData?.criminalConviction ? 'Yes' : 'No'}
            </div>
          )}
        </div>

        {/* Conviction Details (Conditional) */}
        {(localData?.criminalConviction || localData?.convictionDetails) && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Please provide conviction details
            </label>
            {isEditing ? (
              <textarea
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={localData?.convictionDetails || ''}
                onChange={(e) => handleInputChange('convictionDetails', e.target.value)}
              />
            ) : (
              <div className="mt-1 text-gray-900">
                {localData?.convictionDetails || '-'}
              </div>
            )}
          </div>
        )}

        {/* Visa Required */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Is Visa Required?
          </label>
          {isEditing ? (
            <Select
              options={visaOptions}
              value={visaOptions.find(
                (option) => option.value === localData?.visaRequired
              )}
              onChange={(selected) => 
                handleInputChange('visaRequired', selected?.value)
              }
              className="react-select-container"
              classNamePrefix="react-select"
            />
          ) : (
            <div className="mt-1 text-gray-900">
              {capitalizeFirstLetter(localData?.visaRequired || '-')}
            </div>
          )}
        </div>

        {/* Entered UK Before */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Have you entered the UK before?
          </label>
          {isEditing ? (
            <Select
              options={enteredUKOptions}
              value={enteredUKOptions.find(
                (option) => option.value === localData?.enteredUKBefore
              )}
              onChange={(selected) =>
                handleInputChange('complianceData', {
                  ...localData,
                  enteredUKBefore: selected?.value
                })
              }
              className="react-select-container"
              classNamePrefix="react-select"
            />
          ) : (
            <div className="mt-1 text-gray-900">
              {capitalizeFirstLetter(localData?.enteredUKBefore || '-')}
            </div>
          )}
        </div>

        {/* Completed UK Course */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Have you completed a course in the UK?
          </label>
          {isEditing ? (
            <Select
              options={completedUKCourseOptions}
              value={completedUKCourseOptions.find(
                (option) => option.value === localData?.completedUKCourse
              )}
              onChange={(selected) =>
                handleInputChange('complianceData', {
                  ...localData,
                  completedUKCourse: selected?.value
                })
              }
              className="react-select-container"
              classNamePrefix="react-select"
            />
          ) : (
            <div className="mt-1 text-gray-900">
              {capitalizeFirstLetter(localData?.completedUKCourse || '-')}
            </div>
          )}
        </div>

        {/* Visa Refusal */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Have you ever had a visa refusal?
          </label>
          {isEditing ? (
            <Select
              options={visaRefusalOptions}
              value={visaRefusalOptions.find(
                (option) => option.value === localData?.visaRefusal
              )}
              onChange={(selected) =>
                handleInputChange('complianceData', {
                  ...localData,
                  visaRefusal: selected?.value
                })
              }
              className="react-select-container"
              classNamePrefix="react-select"
            />
          ) : (
            <div className="mt-1 text-gray-900">
              {capitalizeFirstLetter(localData?.visaRefusal || '-')}
            </div>
          )}
        </div>

        {/* Immigration Status / Visa Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Visa/Immigration Status
          </label>
          {isEditing ? (
            <Select
              options={statusOptions}
              value={statusOptions.find(
                (option) => option.value === localData?.immigrationStatus
              )}
              onChange={(selected) =>
                handleInputChange('complianceData', {
                  ...localData,
                  immigrationStatus: selected?.value
                })
              }
              className="react-select-container"
              classNamePrefix="react-select"
            />
          ) : (
            <div className="mt-1 text-gray-900">
              {capitalizeFirstLetter(localData?.immigrationStatus || '-')}
            </div>
          )}
        </div>

        {/* Disability */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Do you have any disabilities or learning difficulties?
          </label>
          {isEditing ? (
            <Select
              options={disabilityOptions}
              value={disabilityOptions.find(
                (option) => option.value === localData?.disability
              )}
              onChange={(selected) =>
                handleInputChange('complianceData', {
                  ...localData,
                  disability: selected?.value
                })
              }
              className="react-select-container"
              classNamePrefix="react-select"
            />
          ) : (
            <div className="mt-1 text-gray-900">
              {capitalizeFirstLetter(localData?.disability || '-')}
            </div>
          )}
        </div>

        {/* Benefits */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Are you currently receiving any benefits?
          </label>
          {isEditing ? (
            <Select
              options={benefitsOptions}
              value={benefitsOptions.find(
                (option) => option.value === localData?.benefits
              )}
              onChange={(selected) =>
                handleInputChange('complianceData', {
                  ...localData,
                  benefits: selected?.value
                })
              }
              className="react-select-container"
              classNamePrefix="react-select"
            />
          ) : (
            <div className="mt-1 text-gray-900">
              {capitalizeFirstLetter(localData?.benefits || '-')}
            </div>
          )}
        </div>

        {/* Student Finance */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Will you apply for student finance?
          </label>
          {isEditing ? (
            <Select
              options={studentFinanceOptions}
              value={studentFinanceOptions.find(
                (option) => option.value === localData?.studentFinance
              )}
              onChange={(selected) =>
                handleInputChange('complianceData', {
                  ...localData,
                  studentFinance: selected?.value
                })
              }
              className="react-select-container"
              classNamePrefix="react-select"
            />
          ) : (
            <div className="mt-1 text-gray-900">
              {capitalizeFirstLetter(localData?.studentFinance || '-')}
            </div>
          )}
        </div>
      </div>
      </div>
    </TabSection>
  );
};

export default ComplianceData;
