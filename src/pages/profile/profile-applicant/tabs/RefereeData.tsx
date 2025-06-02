import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import TabSection from '../TabSection';
import { User } from '../../../types/user.types';

interface RefereeDetailsProps {
  userData: User;
  isEditing: boolean;
  onSave: (data: User) => void;
  onCancel: () => void;
  onEdit: () => void;
}

const RefereeDetails = ({
  userData,
  isEditing,
  onSave,
  onCancel,
  onEdit
}: RefereeDetailsProps) => {
  const [localData, setLocalData] = useState<User>(userData);

  const handleInputChange = (
    refereeKey: 'referee1' | 'referee2',
    field: string,
    value: string
  ) => {
    setLocalData((prevData) => ({
      ...prevData,
      [refereeKey]: {
        ...prevData[refereeKey],
        [field]: value
      }
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

  const capitalizeFirstLetter = (str: string): string => {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
  };

  const renderRefereeForm = (refereeKey: 'referee1' | 'referee2', title: string) => {
    const referee = localData[refereeKey];

    return (
      <div className="space-y-4  p-4 rounded-md bg-white shadow-sm">
<h3 className="text-lg font-semibold text-gray-800">
  {refereeKey === 'referee1' ? 'Reference 1' : 'Reference 2'}
</h3>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          {isEditing ? (
            <Input
              type="text"
              value={referee.name}
              onChange={(e) => handleInputChange(refereeKey, 'name', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          ) : (
            <div className="mt-1 text-gray-900">{referee?.name || '-'}</div>
          )}
        </div>

        {/* Organisation */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Organisation</label>
          {isEditing ? (
            <Input
              type="text"
              value={referee.organisation}
              onChange={(e) => handleInputChange(refereeKey, 'organisation', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          ) : (
            <div className="mt-1 text-gray-900">{referee?.organisation || '-'}</div>
          )}
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Address</label>
          {isEditing ? (
            <Input
              type="text"
              value={referee.address}
              onChange={(e) => handleInputChange(refereeKey, 'address', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          ) : (
            <div className="mt-1 text-gray-900">{referee?.address || '-'}</div>
          )}
        </div>

        {/* Relationship */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Relationship</label>
          {isEditing ? (
            <Input
              type="text"
              value={referee.relationship}
              onChange={(e) => handleInputChange(refereeKey, 'relationship', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          ) : (
            <div className="mt-1 text-gray-900">{capitalizeFirstLetter(referee.relationship) || '-'}</div>
          )}
        </div>

        {/* Specify Other Relationship (Conditional) */}
        {referee.relationship?.toLowerCase() === 'other' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Specify Other Relationship</label>
            {isEditing ? (
              <Input
                type="text"
                value={referee.otherRelationship || ''}
                onChange={(e) => handleInputChange(refereeKey, 'otherRelationship', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            ) : (
              <div className="mt-1 text-gray-900">{referee?.otherRelationship || '-'}</div>
            )}
          </div>
        )}

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          {isEditing ? (
            <Input
              type="email"
              value={referee.email}
              onChange={(e) => handleInputChange(refereeKey, 'email', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          ) : (
            <div className="mt-1 text-gray-900">{referee?.email || '-'}</div>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone</label>
          {isEditing ? (
            <Input
              type="text"
              value={referee.phone}
              onChange={(e) => handleInputChange(refereeKey, 'phone', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          ) : (
            <div className="mt-1 text-gray-900">{referee?.phone || '-'}</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <TabSection
      title="Reference Details"
      description="Your Reference information"
      userData={userData}
      isEditing={isEditing}
      onSave={handleSave}
      onCancel={onCancel}
      onEdit={onEdit}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderRefereeForm('referee1', 'Referee 1')}
        {renderRefereeForm('referee2', 'Referee 2')}
      </div>
    </TabSection>
  );
};

export default RefereeDetails;