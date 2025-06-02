import React, { useEffect, useState } from 'react';
import TabSection from '../TabSection';
import { User } from '../../../types/user.types';
import Select from 'react-select';
import { Input } from '@/components/ui/input';
import { CustomDatePicker } from '@/components/shared/CustomDatePicker';

interface ApplicationDataProps {
  userData: User;
  isEditing?: boolean;
  onSave?: (data: User) => void;
  onCancel?: () => void;
  onEdit?: () => true;
}

const ApplicationData: React.FC<ApplicationDataProps> = ({
  userData,
  isEditing = false,
  onSave,
  onCancel,
  onEdit
}) => {
  const [localData, setLocalData] = useState<User>(userData);

  useEffect(() => {
    setLocalData(userData);
  }, [userData]);

  const handleInputChange = <K extends keyof User>(
    field: K,
    value: User[K]
  ) => {
    setLocalData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (onSave) onSave(localData);
  };

  // Source options
  const sourceOptions = [
    { value: 'website', label: 'Company Website' },
    { value: 'referral', label: 'Referral' },
    { value: 'agent', label: 'Agent' },
    { value: 'socialMedia', label: 'Social Media' }
  ];

  // Yes/No options for dropdowns
  const yesNoOptions = [
    { value: true, label: 'Yes' },
    { value: false, label: 'No' }
  ];

  return (
    <TabSection
      title="Application Details"
      description="Your submitted application details"
      userData={userData}
      isEditing={isEditing}
      onSave={handleSave}
      onCancel={onCancel}
      onEdit={onEdit}
    >
      <div className="space-y-8">
        {/* Available From Date */}

        <div className="space-y-4">
          {/* Extended Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Available From Date
            </label>
            {isEditing ? (
              <CustomDatePicker
                selected={
                  localData?.availableFromDate
                    ? new Date(localData.availableFromDate)
                    : null
                }
                onChange={(date: Date | null) => {
                  if (date) {
                    handleInputChange('availableFromDate', date.toISOString());
                  }
                }}
                placeholder="Available From Date"
              />
            ) : (
              <div className="mt-1 text-gray-900">
                {localData?.availableFromDate
                  ? new Date(localData.availableFromDate).toLocaleDateString()
                  : '-'}
              </div>
            )}
          </div>

          {/* Source */}
          <label className="block text-sm font-medium text-gray-700">
            How did you hear about us?
          </label>
          {isEditing ? (
            <Select
              options={sourceOptions}
              value={sourceOptions.find(
                (opt) => opt.value === localData.source
              )}
              onChange={(selected) =>
                handleInputChange('source', selected?.value || '')
              }
              className="react-select-container"
              classNamePrefix="react-select"
            />
          ) : (
            <div className="mt-1 text-gray-900">
              {capitalizeFirstLetter(localData.source || '-')}
            </div>
          )}
        </div>

        {/* Referral Employee */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Referral Employee
          </label>
          {isEditing ? (
            <Input
              type="text"
              value={localData.referralEmployee || ''}
              onChange={(e) =>
                handleInputChange('referralEmployee', e.target.value)
              }
            />
          ) : (
            <div className="mt-1 text-gray-900">
              {localData.referralEmployee || '-'}
            </div>
          )}
        </div>

        {/* Is Student? */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Is Student?
          </label>
          {isEditing ? (
            <Select
              options={yesNoOptions}
              value={yesNoOptions.find(
                (opt) => opt.value === localData.isStudent
              )}
              onChange={(selected) =>
                handleInputChange('isStudent', selected?.value || false)
              }
              className="react-select-container"
              classNamePrefix="react-select"
            />
          ) : (
            <div className="mt-1 text-gray-900">
              {localData.isStudent ? 'Yes' : 'No'}
            </div>
          )}
        </div>

        {/* Is Under State Pension Age? */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Is Under State Pension Age?
          </label>
          {isEditing ? (
            <Select
              options={yesNoOptions}
              value={yesNoOptions.find(
                (opt) => opt.value === localData.isUnderStatePensionAge
              )}
              onChange={(selected) =>
                handleInputChange(
                  'isUnderStatePensionAge',
                  selected?.value || false
                )
              }
              className="react-select-container"
              classNamePrefix="react-select"
            />
          ) : (
            <div className="mt-1 text-gray-900">
              {localData.isUnderStatePensionAge ? 'Yes' : 'No'}
            </div>
          )}
        </div>

        {/* Weekly Availability */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Weekly Availability
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {[
              'Monday',
              'Tuesday',
              'Wednesday',
              'Thursday',
              'Friday',
              'Saturday',
              'Sunday'
            ].map((day) => (
              <div key={day} className="flex items-center gap-2">
                <label className="text-sm">{day}</label>
                <input
                  type="checkbox"
                  checked={localData.availability?.[day.toLowerCase()] || false}
                  onChange={(e) =>
                    setLocalData((prev) => ({
                      ...prev,
                      availability: {
                        ...prev.availability,
                        [day.toLowerCase()]: e.target.checked
                      }
                    }))
                  }
                  disabled={!isEditing}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </TabSection>
  );
};

// Helper function to capitalize first letter
function capitalizeFirstLetter(str: string): string {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

export default ApplicationData;
