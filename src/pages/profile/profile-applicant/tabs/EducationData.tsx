import React, { useEffect, useState } from 'react';
import TabSection from '../TabSection';
import { User } from '../../../types/user.types';
import { Input } from '@/components/ui/input';
import { CustomDatePicker } from '@/components/shared/CustomDatePicker';

const EducationData = ({
  userData,
  isEditing = false,
  onSave,
  onCancel,
  onEdit
}) => {
  const [localData, setLocalData] = useState<User>(userData);

  const handleInputChange = (field: keyof User, value: any) => {
    setLocalData((prevData) => ({
      ...prevData,
      [field]: value
    }));
  };

  const handleNestedChange = (
    section: keyof User,
    index: number,
    field: string,
    value: any
  ) => {
    const updatedArray = [...(localData[section] || [])];
    updatedArray[index] = {
      ...updatedArray[index],
      [field]: value
    };
    setLocalData((prevData) => ({
      ...prevData,
      [section]: updatedArray
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
  const handleAddEducation = () => {
  const newEntry = {
    institution: '',
    qualification: '',
    awardDate: null,
    grade: ''
  };
  setLocalData((prevData) => ({
    ...prevData,
    educationData: [...(prevData.educationData || []), newEntry]
  }));
};


  return (
    <TabSection
      title="Education"
      description="Your educational background and qualifications"
      userData={userData}
      isEditing={isEditing}
      onSave={handleSave}
      onCancel={onCancel}
      onEdit={onEdit}
    >
      <div className="space-y-8">
        

        {/* Education Data */}
        <div>
  <h3 className="mb-4 text-lg font-medium text-gray-900">Education</h3>
 {(localData.educationData || []).map((entry, index) => (
  <div key={index} className="mb-6">
    <h4 className="mb-2 text-md font-semibold text-gray-800">
      Education {index + 1}
    </h4>

    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* Institution */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Institution</label>
        {isEditing ? (
          <Input
            value={entry.institution || ''}
            onChange={(e) =>
              handleNestedChange('educationData', index, 'institution', e.target.value)
            }
          />
        ) : (
          <div className="mt-1 text-gray-900">{entry.institution || '-'}</div>
        )}
      </div>

      {/* Qualification */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Qualification</label>
        {isEditing ? (
          <Input
            value={entry.qualification || ''}
            onChange={(e) =>
              handleNestedChange('educationData', index, 'qualification', e.target.value)
            }
          />
        ) : (
          <div className="mt-1 text-gray-900">{entry.qualification || '-'}</div>
        )}
      </div>

      {/* Award Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Award Date</label>
        {isEditing ? (
          <CustomDatePicker
            selected={entry.awardDate ? new Date(entry.awardDate) : null}
            onChange={(date) =>
              handleNestedChange('educationData', index, 'awardDate', date)
            }
          />
        ) : (
          <div className="mt-1 text-gray-900">
            {entry.awardDate
              ? new Date(entry.awardDate).toLocaleDateString()
              : '-'}
          </div>
        )}
      </div>

      {/* Grade */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Grade</label>
        {isEditing ? (
          <Input
            value={entry.grade || ''}
            onChange={(e) =>
              handleNestedChange('educationData', index, 'grade', e.target.value)
            }
          />
        ) : (
          <div className="mt-1 text-gray-900">{entry.grade || '-'}</div>
        )}
      </div>
    </div>
  </div>
))}


  {isEditing && (
    <button
      type="button"
      onClick={handleAddEducation}
      className="px-4 py-2 text-sm font-medium text-white bg-watney rounded-md hover:bg-watney/90 focus:outline-none focus:ring-2 focus:watney/90"
    >
      + Add Education
    </button>
  )}
</div>


      
      </div>
    </TabSection>
  );
};

export default EducationData;
