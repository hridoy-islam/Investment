import React, { useEffect, useState } from 'react';
import { Camera } from 'lucide-react';
import Select from 'react-select';
import { User } from '../../../types/user.types';
import { CustomDatePicker } from '@/components/shared/CustomDatePicker';
import TabSection from '../TabSection';
import { Input } from '@/components/ui/input';
import { countries, nationalities } from '@/types';

interface PersonalDetailsProps {
  userData: User;
  isEditing?: boolean;
  onSave?: (data: User) => void; // Updated to accept data parameter
  onCancel?: () => void;
  onEdit?: () => void;
}

const PersonalDetails: React.FC<PersonalDetailsProps> = (props) => {
  const { userData, isEditing, onSave, onCancel, onEdit } = props;

  const [localData, setLocalData] = useState<User>(userData);

  const handleInputChange = (field: keyof User, value: any) => {
    setLocalData((prevData) => ({
      ...prevData,
      [field]: value
    }));
  };
  useEffect(() => {
    setLocalData(userData);
  }, [userData]);
  const handleSave = () => {
    if (onSave) {
      onSave(localData); // Pass the updated localData to parent
    }
  };

  // Assume `nationalities` and `countries` arrays are already available
  const nationalityOptions = nationalities.map((nationality) => ({
    label: nationality,
    value: nationality.toLowerCase().replace(/\s/g, '-')
  }));

  const countryOptions = countries.map((country) => ({
    label: country,
    value: country.toLowerCase().replace(/\s/g, '-')
  }));

  // Utility function to get selected option from value
  const findOption = (
    options: { value: string; label: string }[],
    value: string
  ) => options.find((opt) => opt.value === value);

  const titleOptions = [
    { value: 'Mr', label: 'Mr' },
    { value: 'Mrs', label: 'Mrs' },
    { value: 'Miss', label: 'Miss' },
    { value: 'Ms', label: 'Ms' },
    { value: 'Dr', label: 'Dr' },
    { value: 'Prof', label: 'Prof' }
  ];

  const genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Non-binary', label: 'Non-binary' },
    { value: 'Prefer not to say', label: 'Prefer not to say' }
  ];

  const studentTypeOptions = [
    { value: 'eu', label: 'EU' },
    { value: 'international', label: 'International' }
  ];

  const yesNoOptions = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' }
  ];

  const visaOptions = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' }
  ];

  const maritalStatusOptions = [
    { value: 'single', label: 'Single' },
    { value: 'married', label: 'Married' },
    { value: 'divorced', label: 'Divorced' },
    { value: 'widowed', label: 'Widowed' },
    { value: 'separated', label: 'Separated' },
    { value: 'other', label: 'Other' }
  ];

  const capitalizeFirstLetter = (str: string) => {
    if (!str) return ''; // return empty string if input is empty or undefined
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  return (
    <TabSection
      title="Personal Details"
      description="Your basic personal information"
      userData={userData}
      isEditing={isEditing}
      onSave={handleSave}
      onCancel={onCancel}
      onEdit={onEdit}
    >
      <div className="space-y-6">
        {/* Profile Image */}
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <div className="group relative">
            <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-white bg-gray-200 shadow-lg">
              {localData.image ? (
                <img
                  src={localData.image}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gray-100 text-gray-400">
                  No Image
                </div>
              )}
            </div>

            {isEditing && (
              <label
                htmlFor="profile-image"
                className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-watney p-2 text-white shadow-md transition-colors hover:bg-indigo-700"
              >
                <Camera size={16} />
                <input
                  id="profile-image"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  // onChange={handleImageChange}
                />
              </label>
            )}
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {capitalizeFirstLetter(localData.title)}{' '}
              {capitalizeFirstLetter(localData.firstName)}{' '}
              {capitalizeFirstLetter(localData.initial)}{' '}
              {capitalizeFirstLetter(localData?.lastName)}
            </h3>
            <p className="text-gray-500">{localData.email}</p>
            <p className="text-gray-500">{localData.phone}</p>
            <p className="mt-1 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
              {localData.status}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-4">
            {/* Form Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Title
              </label>
              {isEditing ? (
                <Select
                  className="react-select-container"
                  classNamePrefix="react-select"
                  options={titleOptions}
                  value={titleOptions.find(
                    (option) => option.value === localData?.title
                  )}
                  onChange={(selectedOption) =>
                    handleInputChange('title', selectedOption?.value)
                  }
                />
              ) : (
                <div className="mt-1 text-gray-900">
                  {capitalizeFirstLetter(localData?.title || '-')}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              {isEditing ? (
                <Input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={localData?.firstName || ''}
                  onChange={(e) =>
                    handleInputChange('firstName', e.target.value)
                  }
                />
              ) : (
                <div className="mt-1 text-gray-900">
                  {capitalizeFirstLetter(localData?.firstName || '-')}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Middle Name
              </label>
              {isEditing ? (
                <Input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={localData?.initial || ''}
                  onChange={(e) => handleInputChange('initial', e.target.value)}
                />
              ) : (
                <div className="mt-1 text-gray-900">
                  {capitalizeFirstLetter(localData?.initial || '-')}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              {isEditing ? (
                <Input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={localData?.lastName || ''}
                  onChange={(e) =>
                    handleInputChange('lastName', e.target.value)
                  }
                />
              ) : (
                <div className="mt-1 text-gray-900">
                  {capitalizeFirstLetter(localData?.lastName || '-')}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Country of Residence
              </label>
              {isEditing ? (
                <div className="mt-1">
                  <Select
                    options={countryOptions}
                    value={findOption(
                      countryOptions,
                      localData?.countryOfResidence || ''
                    )}
                    onChange={(selectedOption) =>
                      handleInputChange(
                        'countryOfResidence',
                        selectedOption?.value || ''
                      )
                    }
                  />
                </div>
              ) : (
                <div className="mt-1 text-gray-900">
                  {findOption(
                    countryOptions,
                    localData?.countryOfResidence || ''
                  )?.label || '-'}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {/* Extended Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Date of Birth
              </label>
              {isEditing ? (
                <CustomDatePicker
                  selected={
                    localData?.dateOfBirth
                      ? new Date(localData.dateOfBirth)
                      : null
                  }
                  onChange={(date: Date | null) => {
                    if (date) {
                      handleInputChange('dateOfBirth', date.toISOString());
                    }
                  }}
                  placeholder="Use your official birth date"
                />
              ) : (
                <div className="mt-1 text-gray-900">
                  {localData?.dateOfBirth
                    ? new Date(localData.dateOfBirth).toLocaleDateString()
                    : '-'}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Share Code
              </label>
              {isEditing ? (
                <Input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={localData?.shareCode || ''}
                  onChange={(e) =>
                    handleInputChange('shareCode', e.target.value)
                  }
                />
              ) : (
                <div className="mt-1 text-gray-900">
                  {localData?.shareCode || '-'}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                National Insurance Number
              </label>
              {isEditing ? (
                <Input
                  type="text"
                  className="mt-1 block w-full"
                  value={localData?.nationalInsuranceNumber || ''}
                  onChange={(e) =>
                    handleInputChange('nationalInsuranceNumber', e.target.value)
                  }
                />
              ) : (
                <div className="mt-1 text-gray-900">
                  {localData?.nationalInsuranceNumber || '-'}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nationality
              </label>
              {isEditing ? (
                <div className="mt-1">
                  <Select
                    options={nationalityOptions}
                    value={findOption(
                      nationalityOptions,
                      localData?.nationality || ''
                    )}
                    onChange={(selectedOption) =>
                      handleInputChange(
                        'nationality',
                        selectedOption?.value || ''
                      )
                    }
                  />
                </div>
              ) : (
                <div className="mt-1 text-gray-900">
                  {findOption(nationalityOptions, localData?.nationality || '')
                    ?.label || '-'}
                </div>
              )}
            </div>

            {/* Country of Residence */}
          </div>
        </div>

        {/* Address Fields */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Address Line 1
              </label>
              {isEditing ? (
                <Input
                  type="text"
                  className="mt-1 block w-full"
                  value={localData?.postalAddress?.line1 || ''}
                  onChange={(e) =>
                    handleInputChange('postalAddress.line1', e.target.value)
                  }
                />
              ) : (
                <div className="mt-1 text-gray-900">
                  {localData?.postalAddress?.line1 || '-'}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                City
              </label>
              {isEditing ? (
                <Input
                  type="text"
                  className="mt-1 block w-full"
                  value={localData?.postalAddress?.city || ''}
                  onChange={(e) =>
                    handleInputChange('postalAddress.city', e.target.value)
                  }
                />
              ) : (
                <div className="mt-1 text-gray-900">
                  {localData?.postalAddress?.city || '-'}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Country
              </label>
              {isEditing ? (
                <Input
                  type="text"
                  className="mt-1 block w-full"
                  value={localData?.postalAddress?.country || ''}
                  onChange={(e) =>
                    handleInputChange('postalAddress.country', e.target.value)
                  }
                />
              ) : (
                <div className="mt-1 text-gray-900">
                  {localData?.postalAddress?.country || '-'}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Address Line 2 (Optional)
              </label>
              {isEditing ? (
                <Input
                  type="text"
                  className="mt-1 block w-full"
                  value={localData?.postalAddress?.line2 || ''}
                  onChange={(e) =>
                    handleInputChange('postalAddress.line2', e.target.value)
                  }
                />
              ) : (
                <div className="mt-1 text-gray-900">
                  {localData?.postalAddress?.line2 || '-'}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Post Code
              </label>
              {isEditing ? (
                <Input
                  type="text"
                  className="mt-1 block w-full"
                  value={localData?.postalAddress?.postCode || ''}
                  onChange={(e) =>
                    handleInputChange('postalAddress.postCode', e.target.value)
                  }
                />
              ) : (
                <div className="mt-1 text-gray-900">
                  {localData?.postalAddress?.postCode || '-'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </TabSection>
  );
};

export default PersonalDetails;
