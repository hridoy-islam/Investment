import React, { useEffect, useState } from 'react';
import TabSection from '../TabSection';
import { User } from '../../../types/user.types';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch'; // Assuming you're using a Switch component
import { Label } from '@/components/ui/label';
import Select from 'react-select';
import { Textarea } from '@/components/ui/textarea';

const DisabilityData = ({
  userData,
  isEditing = false,
  onSave,
  onCancel,
  onEdit
}) => {
  const [localData, setLocalData] = useState<User>(userData);

  const handleInputChange = (field: keyof User, value: any) => {
    setLocalData((prev) => ({
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
  const yesNoOptions = [
    { value: true, label: 'Yes' },
    { value: false, label: 'No' }
  ];
  return (
    <TabSection
      title="Disability Information"
      description="Regulatory and other requirements"
      userData={userData}
      isEditing={isEditing}
      onSave={handleSave}
      onCancel={onCancel}
      onEdit={onEdit}
    >
      <div className="space-y-6">
        {/* Has Disability */}
        <div className="flex  flex-col items-start space-y-2">
          <Label htmlFor="hasDisability">Do You Have  Disability?</Label>
          {isEditing ? (
            <Select
              id="hasDisability"
              options={yesNoOptions}
              value={yesNoOptions.find(
                (opt) => opt.value === localData?.hasDisability
              )}
              onChange={(selected) =>
                handleInputChange('hasDisability', selected?.value)
              }
              className="react-select-container"
              classNamePrefix="react-select"
            />
          ) : (
            <div className="text-gray-900">
              {localData?.hasDisability ? 'Yes' : 'No'}
            </div>
          )}
        </div>

        {/* Disability Details (conditional) */}
        {localData?.hasDisability && (
          <div>
            <Label className="block text-sm font-medium text-gray-700">
             Disability Details
            </Label>
            {isEditing ? (
              <Textarea
                value={localData?.disabilityDetails || ''}
                onChange={(e) =>
                  handleInputChange('disabilityDetails', e.target.value)
                }
                placeholder="Describe your disability"
              />
            ) : (
              <div className="mt-1 text-gray-900">
                {localData?.disabilityDetails || '-'}
              </div>
            )}
          </div>
        )}

        {/* Needs Reasonable Adjustment */}
        <div className="flex  flex-col items-start space-y-2">
          <Label htmlFor="needsReasonableAdjustment">
            Needs Reasonable Adjustment?
          </Label>
          {isEditing ? (
            <Select
              id="needsReasonableAdjustment"
              options={yesNoOptions}
              value={yesNoOptions.find(
                (opt) => opt.value === localData?.needsReasonableAdjustment
              )}
              onChange={(selected) =>
                handleInputChange('needsReasonableAdjustment', selected?.value)
              }
              className="react-select-container"
              classNamePrefix="react-select"
              menuPortalTarget={document.body}
              menuPosition="fixed"
              styles={{
                menuPortal: (base) => ({ ...base, zIndex: 9999 })
              }}
            />
          ) : (
            <div className="text-gray-900">
              {localData?.needsReasonableAdjustment ? 'Yes' : 'No'}
            </div>
          )}
        </div>

        {/* Reasonable Adjustment Details (conditional) */}
        {localData?.needsReasonableAdjustment && (
          <div>
            <Label className="block text-sm font-medium text-gray-700">
              Reasonable Adjustment Details
            </Label>
            {isEditing ? (
              <Textarea
                value={localData?.reasonableAdjustmentDetails || ''}
                onChange={(e) =>
                  handleInputChange(
                    'reasonableAdjustmentDetails',
                    e.target.value
                  )
                }
                placeholder="Describe the needed adjustments"
              />
            ) : (
              <div className="mt-1 text-gray-900">
                {localData?.reasonableAdjustmentDetails || '-'}
              </div>
            )}
          </div>
        )}
      </div>
    </TabSection>
  );
};

export default DisabilityData;
